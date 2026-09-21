import { getCloudflareContext } from "@opennextjs/cloudflare";
import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

type Database = DrizzleD1Database<typeof schema>;

const instances = new WeakMap<object, Database>();

function resolveDb(): Database {
  const { env } = getCloudflareContext();
  const cached = instances.get(env.DB);
  if (cached) return cached;
  const instance = drizzle(env.DB, { schema });
  instances.set(env.DB, instance);
  return instance;
}

export const db = new Proxy({} as Database, {
  get(_target, property) {
    const instance = resolveDb();
    const value = Reflect.get(instance, property, instance);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
