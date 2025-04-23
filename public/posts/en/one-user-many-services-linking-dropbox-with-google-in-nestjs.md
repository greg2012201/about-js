---
title: "One User, Many Services: Linking Dropbox with Google in NestJS"
createdAt: 23-04-2025
tags: nestjs, node, javascript, typescript, oauth
description: There are many useful applications that orchestrate our workflow by managing multiple services. Sometimes, our job is to build such an application, and if so, it is good to know the patterns that allow for effortlessly linking multiple services.
---

# One User, Many Services: Linking Dropbox with Google in NestJS

In an era where we have plenty of services for almost everything, there is often a need to automate them or gain clear insight into the resources stored within them. From a developer’s perspective, there is a need to build abstractions that allow users to connect those services to their account in the application you're building. Fortunately, we have OAuth, a well-established standard on the web. Let’s dive into an example and build a feature that allows users to connect a Dropbox account to an account created via Google.

## Introduction

We will build this example on top of a project that already implements a Google authentication flow. I covered this use case in the [previous post](https://www.aboutjs.dev/en/posts/implementing-authentication-in-nest-js-with-drizzle-and-passport-js), of which this post is a continuation. To start coding, you can clone [this repo](https://github.com/greg2012201/nest-auth) and switch to the branch called `only-google-auth`.

Our goal is to allow users to connect multiple Dropbox accounts. To achieve this, we need to set up:

- Dropbox OAuth
- Database updates to store Dropbox offline credentials (tokens)
- Controller updates to allow users to initiate the Dropbox OAuth flow

After implementing the account-connecting pattern, we’ll have a solid foundation for a service that can support additional features — for example, collecting and organizing files from Dropbox and Google Drive, or allowing AI agents to access users’ resources stored across both services. Alternatively, it could simply act as an auth/proxy service for another application that requires account linking.

## Encryption

We are going to store the access and refresh tokens returned from the Dropbox auth service in the database, so we can request users' resources on their behalf. To ensure these credentials are securely stored in our database, we need to encrypt them.
To do this, we will create a basic `EncryptionModule` that includes the `EncryptionService`.

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

We use `AES-256-GCM` for symmetric encryption. Remember to add the `ENCRYPTION_KEY` to your `.env` file.

## Update the database schema

We need to update our database schema to store the Dropbox data and maintain relationships. The application uses Drizzle to handle database operations, so this task will be easy and straightforward. We’ll create two new tables:

- `dropbox_accounts` for storing Dropbox credentials along with the Dropbox account ID.

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

- `users_to_dropbox_accounts` to maintain a many-to-many relationship between `users` and `dropbox_accounts` tables.

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

Additionally, we add a column named `is_connected_to_dropbox` to the user table to mark users who have their Dropbox accounts connected.

Choosing a many-to-many relationship between `users` and `dropbox_accounts` allows our users to connect multiple Dropbox accounts to their accounts in our application. This approach is flexible and scalable.

## Dropbox OAuth

To connect a Dropbox account to the account created via Google, we need to provide users with a way to authenticate their Dropbox account. This process will be almost identical to the standard OAuth flow. We need to send the ID of the user to the Dropbox auth service and receive it back. To handle this, we can pass a JWT token with the `userId` in the payload to the `state` parameter of the authorization URL.

To pass the user ID to the `state` parameter, we need to make it available in the context of our Dropbox authentication. To achieve this, we must extract the user object from the execution context and pass the user ID as the `state`. We can accomplish this in the `DropboxGuard`.

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

Once we have the `userId` returned from the guard, we can use it in the `DropboxStrategy`, which is a Passport.js-powered authentication strategy.

Let's install `passport-dropbox-oauth2`:

```terminal
npm i passport-dropbox-oauth2
```

and define the strategy:

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

Now we can clearly see where we send the state and when we get it back.

To send the state, we get the `userId` (returned from the guard) from the context and then create a short-lived JWT token that contains the `userId`.

```ts
// src/auth/auth.service.ts

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

Then, include the token in the state parameter of the authorization URL that is generated for the user after they hit the `auth/dropbox` endpoint.

The `state` will be available when the auth service redirects the user to our `auth/dropbox/callback` endpoint. To access the `state` in the `validate` method of the Dropbox auth strategy, which runs during the auth callback, we need to set the `passReqToCallback: true` flag in the constructor's configuration object. Inside the mentioned `validate` method, we can read the `state` parameter and extract the user ID from the JWT token using the `validateStateToken` from the `AuthService`.

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

After validation, the Dropbox account data will be passed to the `done` callback, making it available for further processing.

## Controllers setup

Now we will add our Dropbox auth logic to the controllers module.

We already have the main authentication and token flow implemented, so we just need to connect our Dropbox auth logic to it.

The starting point looks like this:

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

The first thing we need to add is an endpoint to initiate authentication, along with middleware that acts as a guard to ensure only authenticated users can connect Dropbox account to their existing accounts in the application.

```ts
  @Get('dropbox')
  @UseGuards(JwtAuthGuard, DropboxGuard)
  async connectDropbox() {}
```

The important thing here is that we combine `JwtAuthGuard` and `DropboxGuard`, passing them to `@UseGuards`. Guards act as an authorization layer, and passing them one after another tells NestJS to first execute the code for checking the user's access to the application, and then activate the Dropbox authentication.

The DropboxGuard also retrieves the `userId` from the execution context and passes it to the `DropboxStrategy`, as we covered in [the previous section of this article](https://www.aboutjs.dev/en/posts/one-user-many-services-linking-dropbox-with-google-in-nestjs#dropbox-oauth).

After the initial authentication, the Dropbox IdP provider will redirect the user to the authentication callback endpoint.

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

At this point, we use the `DropboxGuard` again to activate the `validate` method form the `DropboxStrategy`, along with the state we sent earlier. With all the data required for the connection, we can trigger the Dropbox connection logic handled by the `AuthService`.

## Account linking logic

The last steps we need to undertake are:

- data validation
- updating the corresponding records in the database

We need to add the following logic to our existing `AuthService`:

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

First, we need to check if the received data fits our schema, parse it, and infer the type from it. For this task, `zod` is a perfect choice. If something is wrong with the data shape, we should throw an error early. The next step is to check if the `userId` corresponds to the target user's ID already stored in our database (the `userId` came from the `state` parameter). If not, we should also throw an error.

Once all checks pass, we can update the records in the database to reflect the account's connection.

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

We use our `EncryptionService`, created earlier, to encrypt Dropbox tokens. When it comes to the `dropbox_accounts` table, we update the database using the upsert pattern (`ON CONFLICT DO UPDATE ...`) in case of reconnecting, e.g., when the refresh token is not valid and the user reconnects. Additionally, it is good to wrap all queries in a transaction to ensure consistency. If any errors occur while executing the queries, the entire transaction will be rolled back to the state before the transaction.

## Conclusions

We returned to NestJS to add a new feature, and it was surprisingly seamless. We could safely add new authentication as if it were another brick in the wall. Even in such a complex case, we were able to break down the authentication process into manageable steps. We can even connect accounts from more providers in a similar way, gaining access to more user resources distributed across different services. In my opinion, NestJS is definitely a technology to be aware of if you're into JavaScript web development. The best way to grasp a concept and learn new things is by building. So, clone the [repo](https://github.com/greg2012201/nest-auth), add some features (for example, pulling users' resources from Google and Dropbox or handling Dropbox token refresh), and NestJS will never seem complex to you again (if it ever was).

**Thanks for exploring this topic with me 🙌**
