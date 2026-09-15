/**
 * Lets `node` run the project's TypeScript modules directly.
 *
 * Node 22 strips type annotations on its own; what it does not do is resolve
 * this project's `@/…` alias or extensionless relative imports. This hooks
 * only that resolution, so a script can import application code — the real
 * password hashing, the real Prisma client — instead of a second copy of it
 * written to be runnable.
 *
 * Development tooling only. Nothing in the application imports this.
 */
import { register } from "node:module";
register("./ts-resolve-hooks.mjs", import.meta.url);
