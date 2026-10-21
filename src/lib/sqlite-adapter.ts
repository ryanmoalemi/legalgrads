/**
 * Production stub. The pitch demo never opens SQLite.
 *
 * The live demo stores the same records described in `prisma/schema.prisma`
 * in the browser: a synchronous localStorage snapshot (`legalgrads-db`) and
 * IndexedDB (`legalgrads-demo` / object store `kv` / key `state`).
 * localStorage is what keeps a write visible across a full page load.
 * Acceptance test 12 is met by that browser persistence, not by a server.
 * Authorization checks live in `src/lib/db.ts` and must be reimplemented on
 * the server before any real deployment. Do not trust the browser.
 *
 * To move to a server:
 * 1. `npm install prisma @prisma/client`
 * 2. Set `DATABASE_URL=file:./dev.db` (or a hosted Postgres URL and change the provider).
 * 3. `npx prisma migrate dev` and seed from `buildSeed()` in `src/lib/seed.ts`.
 * 4. Replace each function in `src/lib/db.ts` with a server action or route that
 *    uses Prisma and the signed-in user. Keep the same access rules:
 *    a client may read only their own inquiries, matters, messages, and reviews.
 */
export interface ServerRepository {
  getInquiry(actorId: string, inquiryId: string): Promise<unknown>;
}

export function createSqliteAdapter(): ServerRepository {
  throw new Error(
    'SQLite adapter is a stub. This static demo uses IndexedDB in the browser. See README.md for the production migration.',
  );
}
