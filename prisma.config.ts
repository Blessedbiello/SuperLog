// Prisma configuration file.
// Requires: npm install --save-dev prisma dotenv
//
// DATABASE_URL must be defined in .env (or in the shell environment).
// See .env.example for all required environment variables.
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
