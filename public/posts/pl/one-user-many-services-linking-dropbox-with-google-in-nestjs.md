---
title: "Jeden użytkownik, wiele usług: łączenie Dropboxa z Google w NestJS"
createdAt: 23-04-2025
tags: nestjs, node, javascript, typescript, oauth
description: Istnieje wiele przydatnych aplikacji, które organizują nasz workflow, zarządzając wieloma usługami. Czasami naszą pracą jest stworzenie takiej aplikacji, w takim wypadku, dobrze jest znać wzorce, które umożliwiają łączenie wielu różnych usług.
---

# Jeden użytkownik, wiele usług: łączenie Dropboxa z Google w NestJS

W erze, w której mamy mnóstwo usług do wszystkiego, często pojawia się potrzeba ich automatyzacji lub uzyskania jasnego wglądu w zasoby przechowywane w tych usługach. Z perspektywy dewelopera istnieje potrzeba tworzenia abstrakcji w kodzie, które pozwalają użytkownikom łączyć te usługi z ich kontem w aplikacji którą budujesz. Na szczęście mamy ugruntowany standard jakim jest OAuth. Przejdźmy do przykładu i zbudujmy funkcję, która pozwala na połączenie konta Dropbox z kontem utworzonym za pomocą Google.

## Wprowadzenie

Zbudujemy ten przykład na bazie projektu, który już implementuje proces uwierzytelnienia Google. Opisałem ten przypadek w [poprzednim poście](https://www.aboutjs.dev/pl/posts/implementing-authentication-in-nest-js-with-drizzle-and-passport-js), który stanowi kontynuację obecnego artykułu. Aby zacząć, możesz sklonować to repozytorium i przełączyć się na branch o nazwie `only-google-auth`.

Naszym celem jest umożliwienie użytkownikom połączenia wielu kont Dropbox. Aby to osiągnąć, musimy przygotować:

- OAuth dla Dropboxa
- Aktualizację bazy danych w celu przechowywania offline credentials (tokenów) Dropboxa
- Aktualizację kontrolerów, aby umożliwić użytkownikom inicjowanie procesu OAuth dla Dropboxa

Po zaimplementowaniu patentu łączenia kont będziemy mieć podstawy pod serwis, któray może obsługiwać dodatkowe funkcje — np. zbieranie i organizowanie plików z Dropboxa i Google Drive, umożliwienie agentom AI dostępu do zasobów użytkownika przechowywanych w obu usługach. Alternatywnie, może działać jako usługa uwierzytelniania/proxy dla innej aplikacji, która wymaga połączenia kont.

## Szyfrowanie

Będziemy przechowywać access i refresh tokeny zwrócone przez usługę uwierzytelnienia Dropboxa w bazie danych, aby późmniej móc pobierać zasoby użytkowników w ich imieniu. Aby upewnić się, że dane uwierzytelniające są bezpiecznie przechowywane w naszej bazie danych, musimy je zaszyfrować.
Aby to zrobić, stworzymy prosty moduł `EncryptionModule`, który zawiera serwis `EncryptionService`.

```ts
// encryption/encryption.service.ts

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";

@Injectable()
export class EncryptionService {
  private ENCRYPTION_KEY: Buffer;

  constructor(private configService: ConfigService) {
    this.ENCRYPTION_KEY = Buffer.from(
      this.configService.get<string>("ENCRYPTION_KEY")!,
      "hex",
    );

    if (this.ENCRYPTION_KEY.length !== 32) {
      throw new Error("Invalid ENCRYPTION_KEY length. Must be 32 bytes.");
    }
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(
      "aes-256-gcm",
      this.ENCRYPTION_KEY,
      iv,
    );

    let encrypted = cipher.update(text, "utf8", "base64");
    encrypted += cipher.final("base64");

    const authTag = cipher.getAuthTag();

    return [iv.toString("base64"), encrypted, authTag.toString("base64")].join(
      ":",
    );
  }

  decrypt(encryptedData: string): string {
    try {
      const [ivB64, encrypted, authTagB64] = encryptedData.split(":");
      if (!ivB64 || !encrypted || !authTagB64) {
        throw new Error("Invalid encrypted data format");
      }

      const iv = Buffer.from(ivB64, "base64");
      const authTag = Buffer.from(authTagB64, "base64");

      const decipher = crypto.createDecipheriv(
        "aes-256-gcm",
        this.ENCRYPTION_KEY,
        iv,
      );
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, "base64", "utf8");
      decrypted += decipher.final("utf8");

      return decrypted;
    } catch (err) {
      throw new Error("Failed to decrypt token: " + err.message);
    }
  }
}
```

Używamy `AES-256-GCM` do szyfrowania symetrycznego. Pamiętaj, aby dodać `ENCRYPTION_KEY` do swojego pliku `.env`.

## Dodanie zmian do schemy bazy danych

Musimy zaktualizować naszą schemę bazy danych, aby przechowywać dane Dropboxa wraz z relacjami. Aplikacja używa Drizzle do obsługi operacji na bazie danych, więc to zadanie będzie bezproblemowe. Stworzymy dwie nowe tabele:

- `dropbox_accounts` do przechowywania credentials Dropboxa wraz z ID konta Dropbox.

```ts
// src/drizzle/schema.ts

import {
  pgTable,
  serial,
  varchar,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

export const dropboxAccounts = pgTable("dropbox_accounts", {
  id: serial("id").primaryKey(),
  dropboxId: varchar("dropbox_id", { length: 255 }).notNull().unique(),
  accessToken: varchar("access_token", { length: 4000 }).notNull(),
  refreshToken: varchar("refresh_token", { length: 4000 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

- `users_to_dropbox_accounts` do utrzymywania relacji many-to-many pomiędzy tabelami `users` i `dropbox_accounts`.

```ts
// src/drizzle/schema.ts

const usersToDropboxAccounts = pgTable("users_to_dropbox_accounts", {
  userId: serial("user_id")
    .notNull()
    .references(() => users.id),
  dropboxAccountId: serial("dropbox_account_id")
    .notNull()
    .references(() => dropboxAccounts.id),
});
```

Dodatkowo dodajemy kolumnę: `is_connected_to_dropbox` do tabeli `users`, do oznaczenia użytkowników, którzy mają podłączone swoje konta Dropbox.

Wybór relacji many-to-many między tabelami `users` i `dropbox_accounts` pozwala naszym użytkownikom na połączenie wielu kont Dropbox z ich kontami w naszej aplikacji. Takie podejście jest elastyczne i skalowalne.

## Dropbox OAuth

Aby połączyć konto Dropbox z kontem utworzonym za pomocą Google, musimy zapewnić użytkownikom sposób na uwierzytelnienie ich konta Dropbox. Proces ten będzie niemal identyczny z typowym OAuth. Musimy wysłać ID użytkownika, do usługi uwierzytelniania Dropbox i otrzymać go z powrotem. Aby to obsłużyć, możemy przekazać token JWT z `userId` w payload do parametru `state` w authorizaion URL.

Aby przekazać ID użytkownika do parametru `state`, musimy udostępnić go w kontekście naszego uwierzytelniania Dropbox. Aby to osiągnąć, musimy wyodrębnić obiekt użytkownika z execution context i przekazać ID użytkownika jako stan. Możemy to osiągnąć w `DropboxGuard`.

```ts
// src/auth/auth.dropbox-guard.ts

import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class DropboxGuard extends AuthGuard("dropbox-oauth2") {
  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    return {
      session: false,
      state: user?.userId || "unknown",
    };
  }
}
```

Gdy mamy już `userId` zwrócone z guarda, możemy go wykorzystać w `DropboxStrategy`, czyli strategii uwierzytelniania opartej na Passport.js.

Zainsatlujmy `passport-dropbox-oauth2`:

```terminal
npm i passport-dropbox-oauth2
```

oraz zdefinujmy strategię:

```ts
// src/auth/auth.dropbox.strategy.ts
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-dropbox-oauth2";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";

type DropboxProfile = {
  id: string;
  emails?: Array<{ value: string }>;
};

export type DropboxUser = {
  dropboxId: string;
  email: string | undefined;
  accessToken: string;
  refreshToken: string;
  userId: number;
};

@Injectable()
export class DropboxStrategy extends PassportStrategy(
  Strategy,
  "dropbox-oauth2",
) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      apiVersion: "2",
      clientID: configService.get<string>("DROPBOX_APP_KEY"),
      clientSecret: configService.get<string>("DROPBOX_APP_SECRET"),
      callbackURL: configService.get<string>("DROPBOX_CALLBACK_URL"),
      passReqToCallback: true,
    });
  }
  /* SENDING THE STATE */
  authorizationParams(req: any): Record<string, string> {
    const state = this.authService.createStateToken(req.state);
    return {
      response_type: "code",
      token_access_type: "offline",
      state,
    };
  }
  /* GETTING STATE BACK */
  async validate(
    req: { query?: { state?: string } },
    accessToken: string,
    refreshToken: string,
    profile: DropboxProfile,
    done: VerifyCallback,
  ): Promise<void> {
    const { sub: userId } = this.authService.validateStateToken(
      req.query?.state ?? "",
    );

    const user: DropboxUser = {
      dropboxId: profile.id,
      email: profile?.emails?.[0]?.value,
      accessToken,
      refreshToken,
      userId: parseInt(userId) || 0,
    };

    done(null, user);
  }
}
```

Teraz wyraźnie widzimy w którym miejscu wysyłamy `state` a w którym dostajemy go z powrotem.

Aby przesłać parametr `state`, pobieramy `userId` (zwrócony przez guarda) z kontekstu, a następnie tworzymy JWT token z krótką datą ważności, który zawiera `userId`.

```ts
// // src/auth/auth.service.ts

export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /* Rest of the code */

  createStateToken(userId: number) {
    console.log("userId", userId);
    return this.jwtService.sign(
      { sub: userId },
      {
        secret: this.configService.get("STATE_JWT_SECRET"),
        expiresIn: "5min",
      },
    );
  }

  /* Rest of the code */
}
```

Następnie dołączamy token do parametru `state`. który jest częścią authorization URL, który generowany jest dla dla użytkownika po wywołaniu endpointa `auth/dropbox`.

Parametr `state` będzie dostępny, gdy serwis uwierzytelniający przekieruje użytkownika do naszego endpointa `auth/dropbox/callback`. Aby uzyskać dostęp do `state` w środku metody `validate` która pochodzi z Dropbox auth strtegy i jest wywoływana w auth callback'u, musimy przekazać flagę `passReqToCallback: true` w obiekcie konfiguracyjnym konstruktora. Wewnątrz wspomnianej metody `validate` możemy odczytać parametr `state` i wyciągnąć ID użytkownika z tokena JWT używając metody `validateStateToken` z klasy `AuthService`.

```ts
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /* Rest of the code */

  validateStateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get("STATE_JWT_SECRET"),
      });
      return payload;
    } catch (error) {
      throw new BadRequestException("Invalid state token");
    }
  }

  /* Rest of the code */
}
```

Po walidacji dane konta Dropbox zostaną przekazane do callback'u `done`, co umożliwi ich dalsze przetwarzanie.

## Dodanie kontrolerów

Teraz dodamy logikę uwierzytelniania Dropbox do modułu controllers.

Główna logika uwierzytelniania i token flow jest już zaimplementowana, więc musimy tylko podłączyć do niej naszą logikę uwierzytelnienia z Dropbox'em.

Punkt startu wygląda tak:

```ts
// src/auth/auth.controllers.ts

import { Controller, Get, Req, Res, UseGuards } from "@nestjs/common";
import { GoogleGuard } from "./auth.google-guard";
import { Response } from "express";
import { AuthService } from "./auth.service";
import { DropboxGuard } from "./auth.dropbox-guard";
import { JwtAuthGuard } from "./auth.jwt-guard";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get("google")
  @UseGuards(GoogleGuard)
  async auth() {}

  @Get("google/callback")
  @UseGuards(GoogleGuard)
  async googleCallback(@Req() req, @Res() res: Response) {
    const token = await this.authService.signIn(req.user);
    res.cookie("access_token", token, { httpOnly: true });
    return res.redirect("/users");
  }

  @Get("logout")
  async logout(@Res() res: Response) {
    res.clearCookie("access_token");
    return res.redirect("/");
  }
}
```

Pierwszą rzeczą, którą musimy dodać, jest endpoint do rozpoczęcia uwierzytelniania oraz middleware, które pełni rolę strażnika, który zapewnia, że tylko uwierzytelnieni użytkownicy mogą podłączyć konoto Dropboxa do swoich istniejących kont w aplikacji.

```ts
  @Get('dropbox')
  @UseGuards(JwtAuthGuard, DropboxGuard)
  async connectDropbox() {}
```

Bardzo ważną rzeczą jest to, że łączymy `JwtAuthGuard` i `DropboxGuard`, przekazując je do `@UseGuards`. Guards pełnią rolę warstwy autoryzacji, przekazanie ich jeden po drugim mówi NestJS, aby najpierw wykonał kod odpowiedzialny za sprawdzenie dostępu użytkownika do aplikacji, a następnie aktywował uwierzytelnianie Dropbox.

Doatkowo `DropboxGuard` pobiera `userId` z execution context i przekazuje go do `DropboxStrategy`,w sposób jaki omówiliśmy w [poprzedniej sekcji tego artykułu](https://www.aboutjs.dev/pl/posts/one-user-many-services-linking-dropbox-with-google-in-nestjs#dropbox-oauth).

Po wstępnym uwierzytelnieniu, IdP Dropbox'a przekieruje użytkownika do endpointa który jest naszym auth callback'iem dla Dropbox'a.

```ts

import { DropboxUser } from './auth.dropbox.strategy';

export interface DropboxRequest extends Request {
  user: DropboxUser;
}


/* rest of code */

  @Get('dropbox/callback')
  @UseGuards(DropboxGuard)
  async dropboxCallback(@Req() req: DropboxRequest, @Res() res: Response) {
    await this.authService.connectDropboxAccount(req.user);
    res.redirect('/users');
  }

```

W tym momencie ponownie używamy `DropboxGuard`, aby aktywować metodę `validate` pochodzącą z `DropboxStrategy`. Mając wszystkie dane wymagane do połączenia, możemy uruchomić logikę łączenia konta Dropbox, obsługiwaną przez `AuthService`.

## Logika łączenia kont

Ostatnie kroki które musimy podjąć to:

- walidacja danych
- uaktualnienie powiązanych rekordów w bazie danych

Musimy dodać następującą logikę do naszego istniejącego `AuthService`:

```ts
// src/auth/auth.service.ts

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { UserRepository } from "src/user/user.repository";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AuthDTO, connectDropboxDTOSchema } from "./auth.schema";

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /* rest of the existing code */
  async connectDropboxAccount(maybeUserDto: unknown) {
    const userDto = connectDropboxDTOSchema.safeParse(maybeUserDto);
    if (!userDto.success) {
      throw new BadRequestException("Invalid Dropbox user data");
    }
    const { userId, dropboxId, accessToken, refreshToken } = userDto.data;

    const user = await this.userRepository.findUserById(userId);
    if (!user) {
      throw new BadRequestException("Invalid credentials");
    }

    const connectedUser = await this.userRepository.connectDropboxAccount({
      userId: user.id,
      dropboxId,
      accessToken,
      refreshToken,
    });

    return connectedUser;
  }
}
```

Najpierw musimy sprawdzić, czy otrzymane dane pasują do naszej schem'y, sparsować je i wywnioskować typ. Do tego zadania doskonale nadaje się `zod`. Jeśli coś jest nie tak z danymi, powinniśmy od razu wyrzucić błąd. Kolejnym krokiem jest sprawdzenie, czy `userId` odpowiada ID docelowego użytkownika, które jest już zapisane w naszej bazie danych ( `userId` pochodzi z parametru `state`). Jeśli nie, powinniśmy także wyrzuić błąd.

Gdy wszytkie sprawdzenia przejdą pomyślnie, możemy uaktualnić rekordy w bazie danych aby odzwierciedlały połączenie kont.

```ts
// src/user/user.repository.ts

import { Inject, Injectable } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DrizzleProvider } from "src/drizzle/drizzle.provider";
import * as schema from "../drizzle/schema";
import { eq, exists, is } from "drizzle-orm";
import { ConfigService } from "@nestjs/config";
import { EncryptionService } from "src/encryption/encryption.service";

@Injectable()
export class UserRepository {
  constructor(
    @Inject(DrizzleProvider) private db: NodePgDatabase<typeof schema>,
    private configService: ConfigService,
    private encryptionService: EncryptionService,
  ) {}

  /* rest of the existing code */

  async connectDropboxAccount({
    dropboxId,
    userId,
    accessToken,
    refreshToken,
  }: {
    dropboxId: string;
    userId: number;
    accessToken: string;
    refreshToken: string;
  }) {
    const encryptedAccessToken = this.encryptionService.encrypt(accessToken);
    const encryptedRefreshToken = this.encryptionService.encrypt(refreshToken);

    let result: { id: schema.User["id"] }[] | null = null;
    await this.db.transaction(async (tx) => {
      const [dropboxAccount] = await tx
        .insert(schema.dropboxAccounts)
        .values({
          dropboxId,
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
        })
        .onConflictDoUpdate({
          target: schema.dropboxAccounts.dropboxId,
          set: {
            accessToken: encryptedAccessToken,
            refreshToken: encryptedRefreshToken,
          },
        })
        .returning({ id: schema.dropboxAccounts.id });
      result = await tx
        .insert(schema.usersToDropboxAccounts)
        .values({
          userId: userId,
          dropboxAccountId: dropboxAccount.id,
        })
        .onConflictDoNothing()
        .returning({ id: schema.usersToDropboxAccounts.userId });

      await tx
        .update(schema.users)
        .set({ isConnectedToDropbox: true })
        .where(eq(schema.users.id, userId));
    });
    return result?.[0];
  }
}
```

Używamy naszego `EncryptionService`, stworzonego wcześniej, do szyfrowania tokenów Dropbox'a. Jeśli chodzi o tabelę `dropbox_accounts`, to aktualizujemy bazę danych za pomocą paternu upsert (`ON CONFLICT DO UPDATE ...`) w przypadku ponownego połączenia, np. gdy refresh token był przeterminowany, a użytkownik ponownie się połączył. Dodatkowo dobrze jest opakować wszystkie zapytania w transakcję, aby zapewnić spójność oprecji. Jeśli wystąpią jakiekolwiek błędy podczas wykonywania zapytań, cała transakcja zostanie wycofana do stanu sprzed transakcji.

## Wnioski

Wróciliśmy do NestJS, aby dodać nową funkcję, i okazało się to zaskakująco bezproblemowe. Bezpiecznie dodaliśmy nową strategię uwierzytelnienia, traktując to jak dodawanie kolejnej cegiełki. Nawet w tak skomplikowanym przypadku udało nam się rozbić proces uwierzytelnienia na mniejsze, łatwe do zarządzania kroki. Moglibyśmy nawet połączyć więcej kont z innych serwisów w podobny sposób, uzyskując dostęp do większej ilości zasobów użytkowników rozproszonych pomiędzy różnymi usługami. Moim zdaniem NestJS to technologia, którą warto znać, jeśli interesujesz się rozwojem aplikacji webowych w JavaScript. Najlepszym sposobem na przyswojenie framweworka lub biblioteki i naukę nowych rzeczy jest budowanie. Więc sklonuj [repozytorium](https://github.com/greg2012201/nest-auth), dodaj kilka funkcji (np. pobieranie zasobów użytkowników z Google i Dropbox lub obsługę odświeżania tokenów Dropbox) i NestJS przestanie być dla Ciebie skomplikowany (jeśli kiedykolwiek był).

**Dzięki za wspólne zgłebienie tego tematu 🙌**
