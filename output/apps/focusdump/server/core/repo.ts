// FELLES KJERNE – lik i alle apper. Endre bare via felles mal.
// Hjelpere for eierkontroll, revisjon, arkiv og sletting. Tabeller som brukes her
// må ha kolonnene: id, owner_id, revision, archived_at, created_at, updated_at.
import { ApiError } from './http.js';
import { type Db, type Row, type SqlValue, now, newId } from './db.js';
import { isUuid } from './validate.js';

const IDENT = /^[a-z_][a-z0-9_]*$/;
function ident(name: string) {
  if (!IDENT.test(name)) throw new Error(`Ugyldig identifikator: ${name}`);
  return name;
}

export function getOwned(db: Db, table: string, id: string, ownerId: string): Row {
  const row = db.prepare(`SELECT * FROM ${ident(table)} WHERE id = ? AND owner_id = ?`).get(id, ownerId) as
    | Row
    | undefined;
  if (!row) throw new ApiError(404, 'finnes_ikke', 'Fant ikke posten. Den kan være slettet.');
  return row;
}

export function listOwned(
  db: Db,
  table: string,
  ownerId: string,
  opts: { archived?: boolean; orderBy?: string } = {}
): Row[] {
  const archived = opts.archived ? 'archived_at IS NOT NULL' : 'archived_at IS NULL';
  const order = opts.orderBy ?? 'created_at DESC';
  if (!/^[a-z_, ]+( (ASC|DESC))?(, ?[a-z_]+( (ASC|DESC))?)*$/i.test(order)) throw new Error('Ugyldig sortering');
  return db
    .prepare(`SELECT * FROM ${ident(table)} WHERE owner_id = ? AND ${archived} ORDER BY ${order}`)
    .all(ownerId) as Row[];
}

/** Setter inn en eid post. Klienten kan sende egen UUID (offline-oppretting). */
export function insertOwned(db: Db, table: string, ownerId: string, fields: Record<string, SqlValue>, clientId?: unknown): Row {
  let id = newId();
  if (clientId !== undefined && clientId !== null) {
    if (!isUuid(clientId)) throw new ApiError(400, 'ugyldig', 'Ugyldig id.');
    const taken = db.prepare(`SELECT owner_id FROM ${ident(table)} WHERE id = ?`).get(clientId) as Row | undefined;
    if (taken) {
      if (taken.owner_id === ownerId) return getOwned(db, table, clientId, ownerId);
      throw new ApiError(409, 'id_brukt', 'Id er allerede i bruk.');
    }
    id = clientId;
  }
  const t = now();
  const all: Record<string, SqlValue> = { ...fields, id, owner_id: ownerId, revision: 1, created_at: t, updated_at: t };
  const cols = Object.keys(all).map(ident);
  db.prepare(`INSERT INTO ${ident(table)} (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`).run(
    ...cols.map((c) => all[c])
  );
  return getOwned(db, table, id, ownerId);
}

/**
 * Optimistisk samtidighetskontroll: oppdaterer bare hvis revisjonen stemmer.
 * Gammel revisjon gir 409 med gjeldende versjon i details.current.
 */
export function updateOwned(
  db: Db,
  table: string,
  id: string,
  ownerId: string,
  revision: number,
  fields: Record<string, SqlValue>
): Row {
  const cols = Object.keys(fields).map(ident);
  const sets = [...cols.map((c) => `${c} = ?`), 'revision = revision + 1', 'updated_at = ?'];
  const res = db
    .prepare(`UPDATE ${ident(table)} SET ${sets.join(', ')} WHERE id = ? AND owner_id = ? AND revision = ?`)
    .run(...cols.map((c) => fields[c]), now(), id, ownerId, revision);
  if (Number(res.changes) === 0) {
    const current = getOwned(db, table, id, ownerId);
    throw new ApiError(
      409,
      'konflikt',
      'Posten er endret et annet sted. Hent ny versjon før du lagrer.',
      { current }
    );
  }
  return getOwned(db, table, id, ownerId);
}

/** Øker revisjon uten feltendring – brukes når barnetabeller endres. */
export function touchOwned(db: Db, table: string, id: string, ownerId: string, revision: number): Row {
  return updateOwned(db, table, id, ownerId, revision, {});
}

export function setArchived(db: Db, table: string, id: string, ownerId: string, revision: number, archived: boolean) {
  return updateOwned(db, table, id, ownerId, revision, { archived_at: archived ? now() : null });
}

/** Permanent sletting krever at posten er arkivert og at klienten bekrefter. */
export function deleteOwned(db: Db, table: string, id: string, ownerId: string, body: any) {
  const row = getOwned(db, table, id, ownerId);
  if (body?.confirm !== true)
    throw new ApiError(400, 'bekreft', 'Sletting må bekreftes. Send confirm: true.');
  if (row.archived_at === null) throw new ApiError(409, 'ikke_arkivert', 'Arkiver posten før permanent sletting.');
  db.prepare(`DELETE FROM ${ident(table)} WHERE id = ? AND owner_id = ?`).run(id, ownerId);
  return { ok: true, deleted: id };
}
