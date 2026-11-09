import { randomBytes } from 'node:crypto';
import { Pool } from 'pg';
import { prepareAdminEnvironment } from './admin-environment.mjs';

const owner = process.env.ADMIN_USERNAME;
const username = process.env.ADMIN_ACCOUNT_USERNAME?.trim();
if (!process.env.DATABASE_URL || !owner || !username) {
  throw new Error('Ustaw DATABASE_URL, ADMIN_USERNAME i ADMIN_ACCOUNT_USERNAME.');
}
if (username === owner) throw new Error('Wybierz login różny od konta właściciela.');

const { ADMIN_PASSWORD_HASH: passwordHash } = prepareAdminEnvironment({
  ADMIN_USERNAME: username,
  ADMIN_PASSWORD: process.env.ADMIN_ACCOUNT_PASSWORD,
});
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
try {
  const result = await pool.query(
    'INSERT INTO admin_accounts (id, username, password_hash) VALUES ($1, $2, $3) ON CONFLICT (username) DO NOTHING',
    [randomBytes(16).toString('hex'), username, passwordHash],
  );
  if (!result.rowCount) throw new Error('Konto z tym loginem już istnieje.');
  console.log('Dodano konto panelu. Użytkownik skonfiguruje własne MFA przy pierwszym logowaniu.');
} finally {
  await pool.end();
}
