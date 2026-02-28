import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { createClient, type Client } from "@libsql/client";
import * as schema from "./schema";

const DATABASE_URL =
  process.env.DATABASE_URL ?? "file:./alteran.db";

// Singleton pattern to prevent multiple clients during HMR in development
const globalForDb = globalThis as unknown as {
  sqliteClient: Client | undefined;
  drizzleDb: LibSQLDatabase<typeof schema> | undefined;
};

/**
 * Lazily initialized Drizzle ORM database instance backed by a local SQLite file.
 * Defers client creation to first access, avoiding errors during `next build`.
 */
export const db: LibSQLDatabase<typeof schema> = new Proxy(
  {} as LibSQLDatabase<typeof schema>,
  {
    get(_target, prop, receiver) {
      if (!globalForDb.drizzleDb) {
        const client =
          globalForDb.sqliteClient ??
          createClient({ url: DATABASE_URL });
        if (process.env.NODE_ENV !== "production") {
          globalForDb.sqliteClient = client;
        }
        globalForDb.drizzleDb = drizzle(client, { schema });
      }
      return Reflect.get(globalForDb.drizzleDb, prop, receiver);
    },
  }
);
