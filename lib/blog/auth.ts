import QRCode from 'qrcode';
import { random, hash, equal, passwordOK, encrypt, decrypt, newTotpSecret, totpStep, signedLoginToken, validLoginToken } from './security';
import type { Env, Session } from './types';
export class HttpError extends Error{constructor(public status:number,message:string){super(message)}}
const now=()=>Date.now();
type Account={id:string;username:string;password_hash:string};
const ownerId='owner';
const ownerAccount=(env:Env):Account=>({id:ownerId,username:env.ADMIN_USERNAME,password_hash:env.ADMIN_PASSWORD_HASH});
const credentialVersion=(account:Account)=>hash(account.username+':'+account.password_hash);
const recoveryHash=(accountId:string,code:string)=>hash(accountId===ownerId?code:accountId+':'+code);
async function namedAccount(env:Env,column:'id'|'username',value:string){
 return env.DB.prepare(`SELECT id,username,password_hash FROM admin_accounts WHERE ${column}=? AND disabled_at IS NULL`).bind(value).first<Account>();
}
export function local(request:Request){const u=new URL(request.url);return process.env.NODE_ENV!=='production'&&u.protocol==='http:'&&['127.0.0.1','localhost'].includes(u.hostname)}
const cookieName=(r:Request)=>local(r)?'parafia_admin_dev':'__Host-parafia_admin';
const loginName=(r:Request)=>local(r)?'parafia_login_dev':'__Host-parafia_login';
export function cookie(request:Request,name:string){const values=(request.headers.get('cookie')||'').split(';').map(s=>s.trim()).filter(s=>s.startsWith(name+'='));return values.length===1?values[0].slice(name.length+1):''}
export function setCookie(request:Request,name:string,value:string,age:number){return `${name}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}${local(request)?'':'; Secure'}`}
export const sessionCookie=(r:Request,value:string,age=28800)=>setCookie(r,cookieName(r),value,age);
export function configured(env:Env){return typeof env.ADMIN_USERNAME==='string'&&env.ADMIN_USERNAME.length>0&&/^pbkdf2-sha256\$600000\$[a-f0-9]{32}\$[a-f0-9]{64}$/.test(env.ADMIN_PASSWORD_HASH||'')&&/^[a-f0-9]{64}$/.test(env.ADMIN_SECRET_KEY||'')&&env.databaseConfigured&&env.DB&&env.BUCKET}
export function checkOrigin(request:Request,env:Env){const expected=local(request)?new URL(request.url).origin:env.SITE_ORIGIN;if(!expected||new URL(request.url).origin!==expected||request.headers.get('origin')!==expected||request.headers.get('sec-fetch-site')==='cross-site')throw new HttpError(403,'Żądanie zostało odrzucone. Odśwież panel i spróbuj ponownie.')}
export async function readLimited(request:Request,max:number){if(Number(request.headers.get('content-length'))>max)throw new HttpError(413,'Przesłane dane są zbyt duże.');const reader=request.body?.getReader();if(!reader)return new Uint8Array();const chunks:Uint8Array[]=[];let size=0;while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>max){await reader.cancel();throw new HttpError(413,'Przesłane dane są zbyt duże.')}chunks.push(value)}const out=new Uint8Array(size);let offset=0;for(const chunk of chunks){out.set(chunk,offset);offset+=chunk.length}return out}
export async function readJSON(request:Request,max=100000){if(!request.headers.get('content-type')?.startsWith('application/json'))throw new HttpError(415,'Nieprawidłowy format żądania.');try{const data=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(await readLimited(request,max)));if(!data||typeof data!=='object'||Array.isArray(data))throw new HttpError(400,'Nieprawidłowe dane formularza.');return data}catch(error){if(error instanceof HttpError)throw error;throw new HttpError(400,'Nieprawidłowe dane formularza.')}}
export async function rate(env:Env,key:string,max:number,windowMs:number){const time=now(),bucket=Math.floor(time/windowMs);const id=hash(env.ADMIN_SECRET_KEY+':'+key+':'+bucket);const row=await env.DB.prepare('INSERT INTO rate_limits (key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=rate_limits.count+1 RETURNING count').bind(id,(bucket+1)*windowMs).first<{count:number}>();if(!row||row.count>max)throw new HttpError(429,'Zbyt wiele prób. Spróbuj ponownie po upływie 15 minut.')}
export async function authSession(request:Request,env:Env,required=false){
 const token=cookie(request,cookieName(request));
 if(!/^[a-f0-9]{64}$/.test(token)){
  if(required)throw new HttpError(401,'Zaloguj się ponownie.');
  return null;
 }
 const session=await env.DB.prepare('SELECT * FROM admin_sessions WHERE id=?').bind(hash(token)).first<Session>();
 const account=session&&(session.account_id===ownerId?ownerAccount(env):await namedAccount(env,'id',session.account_id));
 const time=now();
 if(!session||!account||session.expires_at<=time||session.last_seen<time-1800000||!equal(session.credential_version,credentialVersion(account))){
  if(session)await env.DB.prepare('DELETE FROM admin_sessions WHERE id=?').bind(session.id).run();
  if(required)throw new HttpError(401,'Sesja wygasła. Zaloguj się ponownie.');
  return null;
 }
 if(session.last_seen<time-60000)await env.DB.prepare('UPDATE admin_sessions SET last_seen=? WHERE id=?').bind(time,session.id).run();
 return {...session,username:account.username};
}
export async function requireAdmin(request:Request,env:Env,write=false){const s=await authSession(request,env,true);if(s!.role!=='admin')throw new HttpError(403,'Dokończ uwierzytelnianie dwuskładnikowe.');if(write){checkOrigin(request,env);if(!equal(request.headers.get('x-csrf-token')||'',s!.csrf))throw new HttpError(403,'Nieprawidłowy token formularza. Odśwież panel.')}return s!}
export async function audit(env:Env,action:string,postId:string|null=null){await env.DB.prepare('INSERT INTO admin_audit (id,action,post_id,created_at) VALUES (?,?,?,?)').bind(random(16),action,postId,now()).run()}
export async function context(request:Request,env:Env){if(!configured(env))throw new HttpError(503,'Panel jest chwilowo niedostępny.');const session=await authSession(request,env);if(!session){let csrf=cookie(request,loginName(request));let headers:Record<string,string>={};if(!validLoginToken(csrf,env.ADMIN_SECRET_KEY)){csrf=signedLoginToken(env.ADMIN_SECRET_KEY);headers['Set-Cookie']=setCookie(request,loginName(request),csrf,600)}return {body:{state:'login',csrf},headers}}if(session.role==='admin')return {body:{state:'admin',csrf:session.csrf,username:session.username},headers:{}};const mfa=await env.DB.prepare('SELECT id FROM admin_mfa WHERE account_id=?').bind(session.account_id).first();if(mfa)return {body:{state:'mfa',csrf:session.csrf},headers:{}};const secret=decrypt(session.pending_secret!,env.ADMIN_SECRET_KEY);const uri=`otpauth://totp/${encodeURIComponent('Parafia Ząbki:'+session.username)}?secret=${secret}&issuer=${encodeURIComponent('Parafia Ząbki')}&algorithm=SHA1&digits=6&period=30`;const svg=await QRCode.toString(uri,{type:'svg',errorCorrectionLevel:'M',margin:2,width:240});return {body:{state:'enroll',csrf:session.csrf,secret,qr:'data:image/svg+xml;base64,'+Buffer.from(svg).toString('base64')},headers:{}}}
export async function login(request:Request,env:Env){
 if(!configured(env))throw new HttpError(503,'Panel jest chwilowo niedostępny.');
 checkOrigin(request,env);
 const token=cookie(request,loginName(request));
 if(!validLoginToken(token,env.ADMIN_SECRET_KEY)||!equal(request.headers.get('x-csrf-token')||'',token))throw new HttpError(403,'Odśwież stronę logowania.');
 const ip=request.headers.get('x-real-ip')||'local';
 await rate(env,'login-ip:'+ip,8,900000);
 await rate(env,'login-global',80,900000);
 const data=await readJSON(request,4096);
 if(typeof data.username!=='string'||typeof data.password!=='string'||data.username.length>120||data.password.length>1024)throw new HttpError(400,'Nieprawidłowy login lub hasło.');
 const account=equal(data.username,env.ADMIN_USERNAME)?ownerAccount(env):await namedAccount(env,'username',data.username);
 const valid=passwordOK(data.password,account?.password_hash??env.ADMIN_PASSWORD_HASH);
 if(!valid||!account){
  await audit(env,'login_failed');
  throw new HttpError(401,'Nieprawidłowy login lub hasło.');
 }
 const time=now(),raw=random(),csrf=random();
 const mfa=await env.DB.prepare('SELECT id FROM admin_mfa WHERE account_id=?').bind(account.id).first();
 const previous=await authSession(request,env);
 await env.DB.batch([
  env.DB.prepare('DELETE FROM admin_sessions WHERE expires_at<? OR last_seen<?').bind(time,time-1800000),
  env.DB.prepare('DELETE FROM rate_limits WHERE expires_at<?').bind(time),
  ...(previous?[env.DB.prepare('DELETE FROM admin_sessions WHERE id=?').bind(previous.id)]:[]),
  env.DB.prepare('INSERT INTO admin_sessions (id,role,csrf,created_at,last_seen,expires_at,credential_version,pending_secret,account_id) VALUES (?,?,?,?,?,?,?,?,?)').bind(
   hash(raw),'pending',csrf,time,time,time+300000,credentialVersion(account),
   mfa?null:encrypt(newTotpSecret(),env.ADMIN_SECRET_KEY),account.id
  )
 ]);
 return {body:{ok:true},headers:{'Set-Cookie':sessionCookie(request,raw,300)}};
}

export async function finishMfa(request:Request,env:Env){
 checkOrigin(request,env);
 const session=(await authSession(request,env,true))!;
 if(session.role!=='pending')throw new HttpError(409,'Odśwież panel.');
 if(!equal(request.headers.get('x-csrf-token')||'',session.csrf))throw new HttpError(403,'Nieprawidłowy token formularza.');
 await rate(env,'mfa-session:'+session.id,6,900000);
 await rate(env,'mfa-ip:'+(request.headers.get('x-real-ip')||'local'),12,900000);
 await rate(env,'mfa-global',100,900000);
 const data=await readJSON(request,4096);
 const code=String(data.code||'').replace(/[\s-]/g,'');
 const accountId=session.account_id;
 const existing=await env.DB.prepare('SELECT secret,last_step FROM admin_mfa WHERE account_id=?').bind(accountId).first<{secret:string;last_step:number}>();
 const raw=random(),csrf=random(),time=now();
 const activateSession=[
  env.DB.prepare('DELETE FROM admin_sessions WHERE id=?').bind(session.id),
  env.DB.prepare('INSERT INTO admin_sessions (id,role,csrf,created_at,last_seen,expires_at,credential_version,pending_secret,account_id) VALUES (?,?,?,?,?,?,?,NULL,?)').bind(
   hash(raw),'admin',csrf,time,time,time+28800000,session.credential_version,accountId
  ),
 ];
 let recoveryCodes:string[]|undefined;
 if(!existing){
  if(!session.pending_secret)throw new HttpError(403,'Rozpocznij logowanie ponownie.');
  const secret=decrypt(session.pending_secret,env.ADMIN_SECRET_KEY),step=totpStep(secret,code);
  if(step<0)throw new HttpError(401,'Nieprawidłowy kod. Sprawdź czas w telefonie.');
  recoveryCodes=Array.from({length:10},()=>random(10).toUpperCase().match(/.{1,5}/g)!.join('-'));
  const result=await env.DB.prepare(`
   WITH enrolled AS (
    INSERT INTO admin_mfa(id,account_id,secret,last_step,created_at)
    VALUES (CASE WHEN ?='owner' THEN 1 ELSE nextval('admin_mfa_account_id_seq') END,?,?,?,?)
    ON CONFLICT (account_id) DO NOTHING RETURNING account_id
   ), codes AS (
    INSERT INTO recovery_codes (hash,created_at,account_id)
    SELECT digest,?,account_id FROM enrolled CROSS JOIN unnest(?::text[]) AS hashes(digest)
   ), old_session AS (
    DELETE FROM admin_sessions WHERE id=? AND EXISTS (SELECT 1 FROM enrolled)
   )
   INSERT INTO admin_sessions (id,role,csrf,created_at,last_seen,expires_at,credential_version,account_id)
   SELECT ?,'admin',?,?,?,?,?,account_id FROM enrolled
  `).bind(accountId,accountId,encrypt(secret,env.ADMIN_SECRET_KEY),step,time,time,
   recoveryCodes.map(c=>recoveryHash(accountId,c.replace(/-/g,''))),session.id,
   hash(raw),csrf,time,time,time+28800000,session.credential_version).run();
  if(!result.meta.changes)throw new HttpError(409,'Konfiguracja została już zmieniona. Zaloguj się ponownie.');
 }else{
  const secret=decrypt(existing.secret,env.ADMIN_SECRET_KEY),step=totpStep(secret,code);
  if(step>=0){
   const result=await env.DB.prepare('UPDATE admin_mfa SET last_step=? WHERE account_id=? AND last_step<?').bind(step,accountId,step).run();
   if(!result.meta.changes)throw new HttpError(401,'Ten kod został już użyty. Poczekaj na następny.');
  }else if(/^[A-Fa-f0-9]{20}$/.test(code)){
   const result=await env.DB.prepare('DELETE FROM recovery_codes WHERE hash=? AND account_id=?').bind(recoveryHash(accountId,code.toUpperCase()),accountId).run();
   if(!result.meta.changes)throw new HttpError(401,'Nieprawidłowy kod uwierzytelniania.');
  }else throw new HttpError(401,'Nieprawidłowy kod uwierzytelniania.');
  await env.DB.batch(activateSession);
 }
 await audit(env,'login_success');
 return {body:{ok:true,recoveryCodes},headers:{'Set-Cookie':sessionCookie(request,raw)}};
}

export async function logout(request:Request,env:Env){checkOrigin(request,env);const s=await authSession(request,env,true);if(!equal(request.headers.get('x-csrf-token')||'',s!.csrf))throw new HttpError(403,'Nieprawidłowy token formularza.');await env.DB.prepare('DELETE FROM admin_sessions WHERE id=?').bind(s!.id).run();return {body:{ok:true},headers:{'Set-Cookie':sessionCookie(request,'',0)}}}
