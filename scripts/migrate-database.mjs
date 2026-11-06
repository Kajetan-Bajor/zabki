import {Pool} from 'pg';
import {readFileSync} from 'node:fs';
if(!process.env.DATABASE_URL)throw new Error('Ustaw DATABASE_URL przed uruchomieniem migracji.');
const pool=new Pool({connectionString:process.env.DATABASE_MIGRATION_URL||process.env.DATABASE_URL,max:1});
const client=await pool.connect();
try{
 await client.query('BEGIN');
 await client.query('SELECT pg_advisory_xact_lock(875341122)');
 await client.query('CREATE TABLE IF NOT EXISTS schema_migrations(version integer PRIMARY KEY,created_at timestamptz NOT NULL DEFAULT now())');
 const r=await client.query('SELECT version FROM schema_migrations WHERE version=1');
 if(!r.rowCount){await client.query(readFileSync(new URL('../migrations/001_initial.sql',import.meta.url),'utf8'));await client.query('INSERT INTO schema_migrations(version) VALUES(1)')}
 await client.query('COMMIT');console.log('Baza danych jest gotowa.');
}catch(error){await client.query('ROLLBACK');throw error}finally{client.release();await pool.end()}
