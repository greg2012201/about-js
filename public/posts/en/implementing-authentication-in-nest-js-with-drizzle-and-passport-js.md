---
title: Implementing Authentication in NestJS with Drizzle and Passport.js
createdAt: 27-03-2025
tags: nest.js, authentication, drizzle, passport.js, node.js, jwt
description: NestJS is an opinionated JavaScript backend framework that is rapidly gaining popularity. Let’s explore how to implement authentication and experience some of NestJS’s magic in action.
---

# Implementing Authentication in NestJS with Drizzle and Passport.js

NestJS is a backend framework that stands out from other Node.js frameworks. Unlike Express or Hono, which offer complete freedom in structuring the application codebase, NestJS provides a more opinionated approach, explicitly guiding how your application should be organized. Despite mixed feelings among developers in the JavaScript community, NestJS continues to grow in popularity, securing second place in the backend frameworks category of the [State of JS 2024 survey](https://2024.stateofjs.com/en-US/other-tools/#backend_frameworks).

## A High-Level Overview of NestJS Core Concepts

NestJS enforces code organization using well-defined building blocks, typically structured into modules based on features or domains, such as users, authentication, or products. Each module directory generally consists of at least three key files: a service, a controller, and a module. The service handles business logic, the controller manages requests, and the module establishes boundaries and rules for how different parts of the feature interact.

One of NestJS’s most important features is dependency injection. Each reusable class, such as a service, is marked as injectable using the `@Injectable()` decorator. This allows NestJS’s DI system to inject it into another class’s constructor — for example, a service can be injected into a controller

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

The `@Injectable()` decorator acts as metadata that the DI system reads at runtime.

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

Magic, isn't it? In our controller, we only need to import the `UserService`, and NestJS will inject it into the `UserController`, making it available via the constructor.

However, there’s one more step to make it work. As mentioned earlier, we need to explicitly define rules and boundaries for the classes inside the `users` directory by creating a `users.module.ts` file.

```ts
import { Module } from "@nestjs/common";
import { UserService } from "./user.service";

@Module({
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
```

## Overview of the Example Project

Having gained a high-level understanding of how NestJS works, we can now begin building our mini authentication example.

We'll use Google as the identity provider (IdP), manage authentication strategies with `passport.js`, and store user data in `PostgreSQL`, drizzle will serve us as an ORM.

## Project setup

Install NestJS along with the required dependencies.

```console
npm i -g @nestjs/cli
nest new nest-auth
cd nest-auth
```

After installation, the initial project structure should be set up and configured.

For Google authentication, we need to store secrets in the `.env` file. These secrets can be obtained from the Google Developer Console.

```md
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

## Database setup

To store user data, we need to create a database and connect it to our application.

We'll use `docker-compose` for this.

Create a `docker-compose.yml` file in the root of the project.

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

Don't forget to add the database connection to your `.env` file.

```md
...

DATABASE_URL=postgres://<username>:<password>@<host>:<port>/<database>
```

As I mentioned earlier, we will use `drizzle` as our ORM. Since we are using `PostgreSQL`, we also need to install the `pg` package. Additionally, we can install `drizzle-kit` to get a nice GUI for managing the database.

```terminal
npm i drizzle-orm drizzle-kit pg
```

The next step is to configure Drizzle.

Create a `drizzle.config.ts` file in the root of the project and define the configuration. Set up the paths for the schema and migrations, and specify the database connection URL.

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

Now, create a directory called `drizzle` inside `src`, and add a `schema.ts` file to define the structure of our database data.

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

We also need to create a migration script.

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

Now, we can finally dive into some NestJS magic.

To use our `drizzle`-powered database connection, we need to define a provider called `drizzleProvider`. As far as I know, `drizzle` does not offer built-in NestJS integration that includes such a provider, so we have to create a custom one.

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

Custom providers in NestJS act like arguments passed to a constructor. At runtime, NestJS reads the token and injects the provider into any class where the `DrizzleProvider` token is explicitly added to the `@Inject()` decorator.

The role of the `useFactory` function is to create the value dynamically while having access to injected dependencies — in our case, the `ConfigService`.

We need to pass several properties to the object stored in the provider’s array:

- `provide` A string that acts as a token used by the DI system.
- `inject` An array of dependencies (classes) required within the provider. In our case, it's `ConfigService`, which provides access to environment variables.
- `useFactory` A function that generates the value to be injected into other classes, with access to the injected dependencies(via the`inject` array above). Here, we retrieve the database URL using `ConfigService`, use it to establish a connection, and return the `drizzle` database wrapper for interacting with our database.

The final step in setting up Drizzle is to create the `DrizzleModule`.

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

Once the provider is set up, we need to register it in `app.module.ts` and make it globally available in our application.

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

Since our authentication is built on top of Google’s service, we need to create a Passport Google strategy for it.

First, install the required dependencies, such as Passport, passport strategy for Google, and utilities for NestJS.

```console
npm i passport @nestjs/passport passport-google-oauth20
```

Our Google strategy is simply an injectable extension of the `PassportStrategy` class designed for NestJS.

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

Almost everything is handled out of the box for us here. We just need to pass the configuration with the Google auth credentials and define the `validate` method, which in this case extracts and formats the Google user data. While adding validation (e.g., using a library like Zod) might be a good idea, we'll leave it as-is to keep this example simple. We also take advantage of Dependency Injection to retrieve the credentials from the `ConfigService`.

To use our strategy in a controller, we need to define an extension of the class that enables us to do so, which is the `AuthGuard`.

```ts
// src/auth/google-guard.ts

import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class GoogleGuard extends AuthGuard("google") {}
```

This class acts as the trigger and encapsulates all the authentication logic. We don't need to implement any custom solution here, as we have the battery-included class exported from the `@nestjs/passport` utility package.

Once we have our strategy and guard prepared, we need to add them to the `auth.module.ts` file, within the `providers` array, to make them available for dependency injection within the auth module.

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

## The User module

To perform authentication, we need to implement logic for storing and managing users. So, let's create a class called `UserRepository` in the `user.repository.ts` file.

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

In this class, we have several methods that manage the user entity. The interesting part is in the constructor definition, where we pass the `DrizzleProvider` token to the `@Inject()` decorator to tell NestJS to inject the value into the class. I mentioned this earlier in the [database setup section](https://www.aboutjs.dev/en/posts/implementing-authentication-in-nest-js-with-drizzle-and-passport-js#database-setup). Once this is done, our `db` parameter will hold the database connection. You might have noticed that our custom drizzle provider is not a class. If it were, we wouldn’t need to use the `@Inject()` decorator, as NestJS DI system would know which class to inject by simply looking at the type assigned to the constructor's parameter.

Let’s add our repository class to the module exports. Additionally, we need to ensure that our custom provider is imported correctly.

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

Before we create the authentication service and add controllers, let's add an additional Passport strategy to manage the session of the logged-in user.

Install the required dependencies for this:

```console
npm i passport-jwt @nestjs/jwt
```

Add the secret required for access token creation:

```md
JWT_SECRET = secret
```

Next, define the JWT strategy.

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

We will save the token in a cookie, so in the strategy, we need to define how it can retrieve the token using the `ConfigService` injected into the strategy. The token will be transformed automatically. In the `validate` method, we can call one of the methods from `UserRepository` to perform a simple validation of the token by checking if the user assigned to the token exists in the database.

To use our strategy, we need to define an auth guard, following the same pattern as we did with Google authentication.

```ts
// src/auth/auth.jwt-guard.ts

import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
```

Update `auth.module.ts`

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

Along with the JWT-related class, we need to add our `UserModule` to the `imports` array to be able to use the `UserRepository` inside the auth module.

## Authentication logic(AuthService)

The service layer usually contains business logic, so we should place all the logic related to user registration, login, logout, user checks, and token creation there.

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

The `AuthService` utilizes three injected classes. The patterns that NestJS offers allow for composing code like Lego blocks.

## Creating API(Controllers)

Now it's time to make our application usable. We will create two controllers:

- `AutController` - for auth
- `UserController` - for managing users

Let's start with the `AuthController`.

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

To define a controller, we use the `@Controller()` decorator, passing a string that represents the route's name. We inject the `AuthService` into the controller as we need it to handle the authentication logic. Next, we use the `@Get('google')` decorator to define the entry point for login. Below that, we add another decorator: `@UseGuards(GoogleGuard)` to apply the guard prepared earlier. This tells NestJS to trigger the authentication logic. Afterward, the user is redirected to the Google sign-in screen. Upon successful login, the user is redirected to `google/callback`, where the guard handles the validation and communication with the Google IDP to retrieve the user's profile information. After this, we can call the signIn method to generate our application’s access token and then redirect the user to a protected route with the token assigned to the `cookies`.

Once we finish our `AuthController`, we need to register and export it from the module. So, update the `auth.module.ts` file. Let’s also export the `JwtAuthGuard`, as it will be required in the user module to protect routes.

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

Following the user's path, we create UserController to retrieve and return users from protected routes.

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

As in the `AuthController`, we will use guards here, but not for authenticating a user — rather, for protecting routes. If the token is invalid, none of the functions in the controller will run, and an `UnauthorizedException` will be thrown instead.

## Last step

Once we cover all cases and create all the building blocks of our application, we need to add the `AuthModule` and `UserModule` to `app.module.ts`.

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

## Conclusion

At first glance, Nest.js might seem a bit complex and difficult to grasp, but once we dive into its core concepts, we can see how easy it is to build with. For cases where we need to quickly spin up a small server, it may not be the best choice, but for large projects that need to scale well, this framework is an excellent solution. Developers familiar with Nest.js can quickly become productive when joining a project built with it. The framework also encourages a well-structured codebase. Without a doubt, Nest.js will continue to grow in popularity, making it a solid choice for kickstarting scalable Node.js backend applications.

**Thanks for reading, and stay tuned for more articles! 👋**

PS: You can find the project's code [here on GitHub](https://github.com/greg2012201/nest-auth/tree/only-google-auth)
