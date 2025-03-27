---
title: Implementacja uwierzytelniania w NestJS z Drizzle i Passport.js
createdAt: 27-03-2025
tags: nest.js, authentication, drizzle, passport.js, node.js, jwt
description: NestJS to backendowy framework JavaScript, który szybko zyskuje na popularności. Sprawdźmy, jak zaimplementować uwierzytelnianie i doświadczmy magii NestJS'a w akcji.
---

# Implementacja uwierzytelniania w NestJS z Drizzle i Passport.js

NestJS to backendowy framework, który wyróżnia się na tle innych frameworków w ekosystemie Node.js. W przeciwieństwie do Expressa czy Hono, które dają pełną swobodę w organizacji kodu aplikacji, NestJS narzuca bardziej sztywne reguły. Pomimo podzielonych zdań deweloperów ze społeczności JavaScript, NestJS stale zyskuje na popularności, zajmując drugie miejsce w kategorii frameworków backendowych w [ankiecie State of JS 2024](https://2024.stateofjs.com/en-US/other-tools/#backend_frameworks).

## Wysokopoziomowy przegląd kluczowych koncepcji NestJS

NestJS wymusza organizację kodu za pomocą dobrze zdefiniowanych bloków konstrukcyjnych, zazwyczaj podzielonych na moduły według funkcjonalności lub domeny, takich jak np. users, auth czy products. Każdy katalog modułu zazwyczaj składa się z co najmniej trzech kluczowych plików: service, controller i module. Serwis odpowiada za logikę biznesową, kontroler obsługuje zapytania, moduł określa granice oraz zasady, według których różne części funkcjonalności mogą ze sobą współdziałać.

Jedną z najważniejszych cech NestJS jest wstrzykiwanie zależności(dependency injection). Każda wielokrotnego użytku klasa, np. service, jest oznaczona jako możliwa do wstrzyknięcia za pomocą dekoratora `@Injectable()`. Dzięki temu system DI NestJS może wstrzyknąć ją do konstruktora innej klasy — na przykład service może zostać wstrzyknięty do controller.

```ts
// user.service.ts
import { Injectable } from "@nestjs/common";

@Injectable()
export class UserService {
  getUser(id: string): {
    /* --- */
  };
}
```

Dekorator `@Injectable()` działa jako metadana, które system DI odczytuje w czasie działania aplikacji.

```ts
// user.controller.ts
import { Controller, Get, Param } from "@nestjs/common";
import { UserService } from "user.service.ts";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(":id")
  async findOne(@Param("id") id: string, @Res() res: Response) {
    const user = this.userService.getUser(id);
    return res.json(user);
  }
}
```

Magia, prawda? W naszym kontrolerze wystarczy zaimportować `UserService`, a NestJS wstrzyknie go do `UserController`, udostępniając go w konstruktorze.

Jednak aby wszystko działało poprawnie, musimy wykonać jeszcze jeden krok. Jak wspomniałem wcześniej, należy jawnie zdefiniować zasady i granice dla klas w katalogu `users`, tworząc plik `users.module.ts`.

```ts
import { Module } from "@nestjs/common";
import { UserService } from "./user.service";

@Module({
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
```

## Przegląd przykładowego projektu

Po zdobyciu ogólnego, wysokopoziomowego zrozumienia, jak działa NestJS, możemy teraz rozpocząć budowanie naszego małego przykładu uwierzytelniania.

Użyjemy Google jako identity provider'a (IdP), zarządzanie strategiami uwierzytelniania będzie realizowane przez `passport.js`, a dane użytkowników przechowywane w `PostgreSQL`, `drizzle` będzie służyć nam jako ORM.

## Konfiguracja projektu

Zainstalujmy NestJS wraz z wymaganymi zależnościami.

```console
npm i -g @nestjs/cli
nest new nest-auth
cd nest-auth
```

Do uwierzytelniania za pomocą Google musimy przechować sekrety w pliku .`env.` Sekrety te można uzyskać z Google Developer Console.

```md
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

## Konfiguracja bazy danych

Aby przechowywać dane użytkowników, musimy utworzyć bazę danych i podłączyć ją do naszej aplikacji.

Do tego wykorzystamy `docker-compose`.

Tworzymy plik `docker-compose.yml` w katalogu głównym projektu.

```yml
version: "3.8"

services:
  postgres:
    image: postgres:latest
    container_name: nest_auth_db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: nest_auth
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

Musimy pamiętać aby w pluku `.env` dodać połączenia z bazą danych.

```md
...

DATABASE_URL=postgres://<username>:<password>@<host>:<port>/<database>
```

Jak wspomniałem wcześniej, użyjemy drizzle jako naszego ORM. Ponieważ korzystamy z `PostgreSQL`, musimy również zainstalować paczkę `pg`. Dodatkowo możemy zainstalować `drizzle-kit`, aby uzyskać wygodne GUI do zarządzania bazą danych.

```terminal
npm i drizzle-orm drizzle-kit pg
```

Utwórzmy plik `drizzle.config.ts` w katalogu głównym projektu i zdefiniujmy konfigurację, ustawiając ścieżki do schema, migracji oraz dodając URL któy służy do połączenia z bazą danych.

```ts
import type { Config } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config({
  path: ".env",
});

export default {
  schema: "./src/drizzle/schema.ts",
  out: "./src/drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;
```

Teraz utwórzmy katalog `drizzle` w folderze `src`, a następnie dodajmy plik `schema.ts`, aby zdefiniować strukturę danych w bazie.

```ts
import { pgTable, serial, varchar, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  googleId: varchar("google_id", { length: 255 }).unique(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

Musimy także utworzyć skrypt migracji.

```ts
// src/migrate.ts

import * as dotenv from "dotenv";
import { type NodePgDatabase, drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "path";
import pg from "pg";
import { exit } from "process";

import * as allSchema from "./schema";

dotenv.config();

(async () => {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });
  let db: NodePgDatabase<typeof allSchema> | null = null;
  db = drizzle(pool, {
    schema: {
      ...allSchema,
    },
  });

  const migrationPath = path.join(process.cwd(), "src/drizzle/migrations");

  await migrate(db, { migrationsFolder: migrationPath });

  exit(0);
})();
```

Teraz w końcu możemy zasmakować magii NestJS.

Aby korzystać z połączenia z bazą danych obsługiwanego przez `drizzle`, musimy zdefiniować provider o nazwie `drizzleProvider`. Z tego, co wiem, `drizzle` nie oferuje żadnej integracji z NestJS, która zawierałaby taki provider, więc musimy stworzyć własny.

```ts
//src/drizzle/drizzle.provider.ts

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { ConfigService } from "@nestjs/config";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

export const DrizzleProvider = "DrizzleProvider";

export const drizzleProvider = [
  {
    provide: DrizzleProvider,
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
      const connectionString = configService.get<string>("DATABASE_URL");
      const pool = new Pool({
        connectionString,
      });

      return drizzle(pool, { schema }) as NodePgDatabase<typeof schema>;
    },
  },
];
```

Custom providers w NestJS działają jak argumenty przekazywane do konstruktora. W czasie działania aplikacji NestJS odczytuje token i wstrzykuje provider do każdej klasy, w której token `DrizzleProvider` został jawnie dodany do dekoratora `@Inject()`.

Rola funkcji `useFactory` polega na dynamicznym tworzeniu wartości mając dostęp do wstrzykiwanych zależności – w naszym przypadku `ConfigService`

Musimy przekazać kilka właściwości do obiektu przechowywanego w tablicy providers:

- `provide` Ciąg znaków pełniący rolę tokenu używanego przez system DI.
- `inject` Tablica zależności (klas) wymaganych w providerze. W naszym przypadku jest to `ConfigService`, który zapewnia dostęp do zmiennych środowiskowych.
- `useFactory` Funkcja generująca wartość do wstrzyknięcia do innych klas, mająca dostęp do wstrzykniętych zależności(poprzez tablicę `inject`). Tutaj pobieramy adres URL bazy danych za pomocą `ConfigService`, używamy go do nawiązania połączenia i zwracamy wrapper `drizzle` do interakcji z bazą danych.

Ostatnim krokiem konfiguracji Drizzle jest utworzenie `DrizzleModule`.

```ts
// src/drizzle.module.ts

import { Module } from "@nestjs/common";
import { DrizzleProvider, drizzleProvider } from "./drizzle.provider";

@Module({
  providers: [...drizzleProvider],
  exports: [DrizzleProvider],
})
export class DrizzleModule {}
```

Gdy provider jest już skonfigurowany, musimy zarejestrować go w `app.module.ts` i udostępnić globalnie w naszej aplikacji.

```ts
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { DrizzleModule } from "./drizzle/drizzle.module";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [DrizzleModule, ConfigModule.forRoot({ isGlobal: true })],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

## Google auth strategy

Ponieważ nasze uwierzytelnienie opiera się na usłudze Google, musimy utworzyć dla niej strategię Google w Passport.

Na początek zainstalujmy wymagane zależności, takie jak `Passport`, strategię google z `Passport` oraz utilities dla NestJS.

```console
npm i passport @nestjs/passport passport-google-oauth20
```

Nasza strategia Google to po prostu wstrzykiwalne rozszerzenie klasy `PassportStrategy` przygotowane dla NestJS.

```ts
// src/auth/google.strategy.ts

import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";

type GoogleProfile = {
  id: string;
  name: {
    givenName: string;
    familyName: string;
  };
  emails: Array<{ value: string }>;
};

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>("GOOGLE_CLIENT_ID"),
      clientSecret: configService.get<string>("GOOGLE_CLIENT_SECRET"),
      callbackURL: configService.get<string>("GOOGLE_CALLBACK_URL"),
      scope: ["email", "profile"],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: GoogleProfile,
    done: VerifyCallback,
  ): Promise<any> {
    if (!profile) {
      throw new UnauthorizedException("Invalid profile");
    }
    const { id, name, emails } = profile;
    const user = {
      id,
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      accessToken,
    };
    done(null, user);
  }
}
```

Prawie wszystko jest obsługiwane za nas out od the box. Musimy jedynie przekazać konfigurację z danymi uwierzytelniającymi Google i zdefiniować metodę `validate`, która w tym przypadku wyciąga i formatuje dane użytkownika Google. Choć dodanie walidacji (np. za pomocą biblioteki takiej jak Zod) może być dobrym pomysłem, pominiemy tą kwestę, aby zachować prostotę. Korzystamy także z wstrzykiwania zależności, aby pobrać dane uwierzytelniające z `ConfigService`.

Aby użyć naszej strategii w kontrolerze, musimy zdefiniować rozszerzenie klasy, które pozwoli nam to zrobić, a jest nim `AuthGuard`.

```ts
// src/auth/google-guard.ts

import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class GoogleGuard extends AuthGuard("google") {}
```

Ta klasa działa jak spust oraz zamyka całą logikę uwierzytelniania. Nie musimy implementować żadnych niestandardowych rozwiązań, ponieważ mamy gotową klasę eksportowaną z paczki `@nestjs/passport`.

Po przygotowaniu klas strategii i guard'a, musimy dodać je do pliku `auth.module.ts` w tablicy `providers`, aby były dostępne do wstrzykiwania zależności w ramach modułu autoryzacji.

```ts
// src/auth/module.ts

import { Module } from "@nestjs/common";
import { GoogleStrategy } from "./auth.google.strategy";
import { GoogleGuard } from "./auth.google-guard";

@Module({
  providers: [GoogleStrategy, GoogleGuard],
  exports: [],
  controllers: [],
  imports: [],
})
export class AuthModule {}
```

## Moduł User'a

Aby przeprowadzić uwierzytelnianie, musimy zaimplementować logikę przechowywania i zarządzania użytkownikami. Stwórzmy więc klasę o nazwie `UserRepository` w pliku `user.repository.ts`.

```ts
import { Inject, Injectable } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DrizzleProvider } from "src/drizzle/drizzle.provider";
import * as schema from "../drizzle/schema";
import { sql } from "drizzle-orm";

@Injectable()
export class UserRepository {
  constructor(
    @Inject(DrizzleProvider) private db: NodePgDatabase<typeof schema>,
  ) {}

  async findUserById(id: string) {
    return this.db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(sql`${schema.users.id} = ${id}`);
  }
  async findUserByGoogleId(googleId: string) {
    const foundUsers = await this.db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(sql`${schema.users.googleId} = ${googleId}`)
      .limit(1);

    return foundUsers[0];
  }

  async getAllUsers() {
    return this.db.select().from(schema.users);
  }
  async createUser({
    id: googleId,
    email,
    name,
  }: {
    id: string;
    email: string;
    name: string;
  }) {
    const result = await this.db
      .insert(schema.users)
      .values({ email, name, googleId })
      .returning({ id: schema.users.id });
    return result[0];
  }
}
```

W tej klasie mamy kilka metod zarządzających encją użytkownika. Ciekawa część dotyczy definicji konstruktora, gdzie przekazujemy token `DrizzleProvider` do dekoratora `@Inject()`, aby powiedzieć NestJS, aby wstrzyknął wartość do klasy. Wspominałem o tym wcześniej [w sekcji konfiguracji bazy danych](https://www.aboutjs.dev/pl/posts/building-authentication-in-nest-jswith-drizzle-and-passport-js#database-setup). Dzięki tej logice, nasz parametr `db` będzie przechowywał połączenie z bazą danych. Możliwe, że zauważyłeś, że nasz niestandardowy provider drizzle nie jest klasą. Gdyby nią był, nie musielibyśmy używać dekoratora `@Inject()`, ponieważ system DI NestJS wiedziałby, którą klasę wstrzyknąć, patrząc tylko na typ przypisany do parametru konstruktora.

Dodajmy naszą klasę repozytorium do tablicy exports w pliku module. Dodatkowo, musimy upewnić się, że nasz niestandardowy provider jest poprawnie zaimportowany.

```ts
//src/user/user.module.ts

import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { DrizzleModule } from "src/drizzle/drizzle.module";
import { UserRepository } from "./user.repository";
import { UserController } from "./user.controller";

@Module({
  exports: [UserRepository],
  imports: [DrizzleModule],
})
export class UserModule {}
```

## JWT Strategy

Zanim stworzymy usługę uwierzytelniania i dodamy kontrolery, dodajmy dodatkową strategię Passport, która będzie zarządzać sesją zalogowanego użytkownika.

Zainstalujmy wymagane zależności:

```console
npm i passport-jwt @nestjs/jwt
```

Dodaj sekret wymagany do tworzenia tokenu dostępu:

```md
JWT_SECRET = secret
```

Następnie zdefiniujmy strategię JWT.

```ts
// src/auth/auth.jwt.strategy.ts

import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { Request } from "express";
import { ConfigService } from "@nestjs/config";
import { UserRepository } from "src/user/user.repository";

type JWTPayload = { sub: string };

function extractTokenFromCookie(cookie: string | undefined): string | null {
  if (!cookie) return null;
  const match = cookie.match(/access_token=([^;]+)/);
  return match ? match[1] : null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    private configService: ConfigService,
    private userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const data = extractTokenFromCookie(request?.headers["cookie"]);
          if (!data) {
            return null;
          }
          return data;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get("JWT_SECRET"),
    });
  }

  async validate(payload: JWTPayload) {
    const user = await this.userRepository.findUserById(payload.sub);
    if (!user) {
      throw new UnauthorizedException("Login to continue");
    }
    return {
      userId: payload.sub,
    };
  }
}
```

Będziemy przechowywać token w cookie, więc w strategii musimy określić, w jaki sposób będziemy go wyciągać, używając `ConfigService` wstrzykniętego do strategii. Token będzie automatycznie przekształcany. W metodzie `validate` możemy wywołać jedną z metod `UserRepository`, aby przeprowadzić prostą walidację, sprawdzając, czy użytkownik przypisany do tokena istnieje w bazie danych.

Aby użyć naszej strategii, musimy zdefiniować auth guard, stosując ten sam wzorzec, co w przypadku uwierzytelniania Google.

```ts
// src/auth/auth.jwt-guard.ts

import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
```

Uaktualnijmy `auth.module.ts`

```ts
import { Module } from "@nestjs/common";
import { GoogleStrategy } from "./auth.google.strategy";
import { GoogleGuard } from "./auth.google-guard";
import { UserModule } from "src/user/user.module";
import { JwtStrategy } from "./auth.jwt.strategy";
import { JwtAuthGuard } from "./auth.jwt-guard";
import { JwtModule } from "@nestjs/jwt";

@Module({
  providers: [GoogleStrategy, GoogleGuard, JwtStrategy, JwtAuthGuard],
  exports: [],
  controllers: [],
  imports: [UserModule, JwtModule],
})
export class AuthModule {}
```

Wraz z klasą związaną z JWT musimy dodać nasz `UserModule` do tablicy `imports`, aby móc używać `UserRepository` w auth module.

## Logika uwierzytelnienia(AuthService)

Warstwa service zwykle zawiera logikę biznesową, więc powinniśmy umieścić tam całą logikę związaną z rejestracją użytkownika, logowaniem, wylogowywaniem, sprawdzaniem użytkownika i tworzeniem tokenów.

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

type AuthDTO = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  createAccessToken(userId: number) {
    return this.jwtService.sign(
      { sub: userId },
      { secret: this.configService.get("JWT_SECRET") },
    );
  }

  async signIn(user: AuthDTO) {
    if (!user) {
      throw new BadRequestException("Invalid credentials");
    }

    const existingDbUser = await this.userRepository.findUserByGoogleId(
      user.id || "", // in our db id that comes from google is is stored as google_id
    );
    if (existingDbUser) {
      return this.createAccessToken(existingDbUser.id);
    }

    const newUser = await this.createNewUser(user);
    console.log("newUser", newUser);
    if (!newUser) {
      throw new InternalServerErrorException("Could not create a user");
    }

    return this.createAccessToken(newUser.id);
  }

  async createNewUser(user: AuthDTO) {
    return this.userRepository.createUser({
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
    });
  }
}
```

`AuthService` wykorzystuje trzy wstrzykiwane klasy. Wzorce oferowane przez NestJS umożliwiają komponowanie kodu niczym klocki Lego.

## Tworzenia API(Controllers)

Teraz nadszedł czas, aby uczynić naszą aplikację funkcjonalną. Stworzymy dwa kontrolery:

- `AutController` - do uwierzytelnienia
- `UserController` - do zarządzania użytkownikami

Zacznijmy od `AuthController`.

```ts
// src/auth/auth.controller.ts

import { Controller, Get, Req, Res, UseGuards } from "@nestjs/common";
import { GoogleGuard } from "./auth.google-guard";
import { Response } from "express";
import { AuthService } from "./auth.service";

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

Aby zdefiniować kontroler, używamy dekoratora `@Controller()`, przekazując stringa, który reprezentuje nazwę ścieżki. Wstrzykujemy `AuthService` do kontrolera, ponieważ potrzebujemy go do obsługi logiki uwierzytelnienia. Następnie używamy dekoratora `@Get('google')`, aby zdefiniować punkt wejścia dla logowania. Poniżej dodajemy kolejny dekorator: `@UseGuards(GoogleGuard)`, aby zastosować wcześniej przygotowanego guarda. Informuje on NestJS o potrzebie uruchomienia logiki uwierzytelnienia. Następnie użytkownik jest przekierowywany na ekran logowania Google. Po pomyślnym zalogowaniu użytkownik jest przekierowywany do `google/callback`, gdzie guard obsługuje walidację i komunikację z Google IDP w celu pobrania informacji o profilu użytkownika. Po tym wszystkim możemy wywołać metodę `signIn`, aby wygenerować access token, a następnie przekierować użytkownika do chronionej ścieżki z tokenem w `cookies`.

Gdy nasz `AuthController` jest już skończony, musimy go zarejestrować i wyeksportować z modułu. Zaktualizujmy więc plik `auth.module.ts`. Warto także wyeksportować `JwtAuthGuard`, ponieważ będzie on wymagany w module użytkownika do zabezpieczenia endpointów.

```ts
import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { GoogleStrategy } from "./auth.google.strategy";
import { GoogleGuard } from "./auth.google-guard";
import { AuthController } from "./auth.controller";
import { UserModule } from "src/user/user.module";
import { JwtStrategy } from "./auth.jwt.strategy";
import { JwtAuthGuard } from "./auth.jwt-guard";
import { JwtModule } from "@nestjs/jwt";

@Module({
  providers: [
    AuthService,
    GoogleStrategy,
    GoogleGuard,
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [JwtAuthGuard],
  controllers: [AuthController],
  imports: [UserModule, JwtModule],
})
export class AuthModule {}
```

Podążając ścieżką użytkownika, tworzymy `UserController`, aby pobierać i zwracać użytkowników z chronionych endpointów.

```ts
// src/user/user.controller.ts

import { Controller, Get, Param, Res, UseGuards } from "@nestjs/common";

import { UserRepository } from "./user.repository";
import { Response } from "express";
import { JwtAuthGuard } from "src/auth/auth.jwt-guard";

@Controller("users")
export class UserController {
  constructor(private readonly userRepository: UserRepository) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll(@Res() res: Response) {
    const users = await this.userRepository.getAllUsers();

    return res.json(users);
  }
  @UseGuards(JwtAuthGuard)
  @Get(":id")
  async findOne(@Param("id") id: string, @Res() res: Response) {
    const user = this.userRepository.findUserById(id);
    return res.json(user);
  }
}
```

Podobnie jak w `AuthController`, tutaj również użyjemy guarda, tym razem nie do uwierzytelniania użytkownika, lecz do ochrony endpointów. Jeśli token jest nieprawidłowy, żadna z funkcji w kontrolerze nie zostanie uruchomiona, a zamiast tego zostanie wyrzucony błąd: `UnauthorizedException`.

## Ostatni krok

Gdy pokryjemy wszystkie przypadki i stworzymy wszystkie elementy składowe naszej aplikacji, musimy dodać `AuthModule` i `UserModule` do `app.module.ts`.

```ts
// src/app.module.ts

import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { DrizzleModule } from "./drizzle/drizzle.module";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "./user/user.module";

@Module({
  imports: [
    AuthModule,
    DrizzleModule,
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

## Wnioski

Na pierwszy rzut oka Nest.js może wydawać się nieco skomplikowany i trudny do zrozumienia, ale gdy zagłębimy się w jego podstawowe koncepcje, zobaczymy, jak łatwo można za jego pomocą budować aplikacje. W przypadkach, gdy potrzebujemy szybko uruchomić mały serwer, nie jest to najlepszy wybór, ale dla dużych projektów wymagających dobrej skalowalności ten framework jest doskonałym rozwiązaniem. Programiści zaznajomieni z Nest.js mogą szybko stać się produktywni po dołączeniu do projektu rozwijanego w tym frameworku. Nest.js zachęca do pisania dobrze ustrukturyzowanego kodu. Bez wątpienia jego popularność będzie nadal rosła, czyniąc go rozsądnym wyborem do tworzenia skalowalnych aplikacji backendowych w Node.js.

**Dzięki za przeczytanie, zpraszam do śledzenia kolejnych artykułów! 👋**

PS: Kod możesz znaleść [tutaj na GitHub`ie]('https://github.com/greg2012201/nest-auth')
