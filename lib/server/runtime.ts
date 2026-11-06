import {Pool, types} from 'pg';
import {createHash} from 'node:crypto';
import type {Env} from '../blog/types';
// All stored bigint values are millisecond timestamps or bounded counters.
types.setTypeParser(20,value=>{const n=Number(value);if(!Number.isSafeInteger(n))throw new Error('Integer outside safe range');return n});
let pool:Pool|undefined;
function connection(){
 if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL is required');
 return pool??=new Pool({connectionString:process.env.DATABASE_URL,max:3,idleTimeoutMillis:10000,connectionTimeoutMillis:10000});
}
export class Statement{
 constructor(readonly sql:string,readonly values:unknown[]=[]){ }
 bind(...values:unknown[]){return new Statement(this.sql,values)}
 query(){let n=0;return {text:this.sql.replace(/\?/g,()=>'$'+(++n)),values:this.values}}
 async first<T=Record<string,unknown>>():Promise<T|null>{return (await connection().query(this.query())).rows[0]??null}
 async all<T=Record<string,unknown>>():Promise<{results:T[]}>{return {results:(await connection().query(this.query())).rows}}
 async run(){const r=await connection().query(this.query());return {meta:{changes:r.rowCount??0}}}
}
export class Database{
 prepare(sql:string){return new Statement(sql)}
 async batch(statements:Statement[]){
  const client=await connection().connect();
  try{await client.query('BEGIN');const results=[];for(const s of statements){const r=await client.query(s.query());results.push({meta:{changes:r.rowCount??0},results:r.rows})}await client.query('COMMIT');return results}
  catch(error){await client.query('ROLLBACK');throw error}finally{client.release()}
 }
}
// Media lives in the same durable PostgreSQL database, never on ephemeral disk.
export class MediaStore{
 async put(key:string,data:Uint8Array,options:{httpMetadata:{contentType:string}}){await connection().query('INSERT INTO media_objects(object_key,data,mime) VALUES($1,$2,$3) ON CONFLICT(object_key) DO UPDATE SET data=EXCLUDED.data,mime=EXCLUDED.mime',[key,Buffer.from(data),options.httpMetadata.contentType])}
 async delete(key:string){await connection().query('DELETE FROM media_objects WHERE object_key=$1',[key])}
 async get(key:string){const r=await connection().query('SELECT data,mime FROM media_objects WHERE object_key=$1',[key]);const row=r.rows[0];if(!row)return null;const bytes=new Uint8Array(row.data);return {body:bytes,httpMetadata:{contentType:row.mime},httpEtag:'"'+createHash('sha256').update(bytes).digest('hex')+'"'}}
}
export function runtimeEnv():Env{return {DB:new Database(),BUCKET:new MediaStore(),databaseConfigured:!!process.env.DATABASE_URL,ADMIN_USERNAME:process.env.ADMIN_USERNAME||'',ADMIN_PASSWORD_HASH:process.env.ADMIN_PASSWORD_HASH||'',ADMIN_SECRET_KEY:process.env.ADMIN_SECRET_KEY||'',SITE_ORIGIN:process.env.SITE_ORIGIN||''}}
