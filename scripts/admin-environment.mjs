import {readFileSync,writeFileSync,mkdirSync,existsSync,chmodSync} from 'node:fs';
import {parseEnv} from 'node:util';
import {randomBytes,pbkdf2Sync} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

// Prepare secrets locally; copy the resulting values to the hosting environment.
export function prepareAdminEnvironment(values,previous={}){
 const username=(values.ADMIN_USERNAME||'').trim(),password=values.ADMIN_PASSWORD||'';
 if(username.length<3||username.length>120)throw Error('Uzupełnij ADMIN_USERNAME w .env (3–120 znaków).');
 if(password.length<16||password.length>1024||password.trim().length<16)throw Error('Uzupełnij ADMIN_PASSWORD w .env (co najmniej 16 znaków).');
 const origin=new URL(values.SITE_ORIGIN||previous.SITE_ORIGIN||'https://zabki.vercel.app');
 if(origin.protocol!=='https:'||origin.pathname!=='/'||origin.search||origin.hash||origin.username||origin.password)throw Error('SITE_ORIGIN musi być adresem HTTPS bez ścieżki.');
 if(previous.ADMIN_SECRET_KEY&&!/^[a-f0-9]{64}$/.test(previous.ADMIN_SECRET_KEY))throw Error('Istniejący klucz MFA ma nieprawidłowy format. Nie zmieniono konfiguracji.');
 const salt=randomBytes(16),digest=pbkdf2Sync(password,salt,600000,32,'sha256');
 return {ADMIN_USERNAME:username,ADMIN_PASSWORD_HASH:`pbkdf2-sha256$600000$${salt.toString('hex')}$${digest.toString('hex')}`,ADMIN_SECRET_KEY:previous.ADMIN_SECRET_KEY||randomBytes(32).toString('hex'),SITE_ORIGIN:origin.origin};
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  const values=parseEnv(readFileSync('.env','utf8'));
  const previous=existsSync('.env.admin')?parseEnv(readFileSync('.env.admin','utf8')):{};
  const prepared=prepareAdminEnvironment(values,previous);
  writeFileSync('.env.admin',Object.entries(prepared).map(([key,value])=>`${key}=${JSON.stringify(value)}`).join('\n')+'\n',{mode:0o600});chmodSync('.env.admin',0o600);
  console.log('Przygotowano .env.admin. Przenieś jego wartości do zmiennych środowiskowych Vercela. Nie dodawaj pliku do Git.');
 }catch(error){console.error(error.code==='ENOENT'?'Brak .env. Skopiuj .env.example do .env i wpisz własny login oraz hasło.':error.message);process.exitCode=1}
}
