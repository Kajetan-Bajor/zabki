import {readFileSync,writeFileSync,mkdirSync,existsSync,chmodSync} from 'node:fs';
import {parseEnv} from 'node:util';
import {randomBytes,pbkdf2Sync} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

// Local preparation only. Publishing secrets requires the Sites environment tool.
export function prepareAdminEnvironment(values,previous={}){
 const username=(values.ADMIN_USERNAME||'').trim(),password=values.ADMIN_PASSWORD||'';
 if(username.length<3||username.length>120)throw Error('Uzupełnij ADMIN_USERNAME w .env (3–120 znaków).');
 if(password.length<16||password.length>1024||password.trim().length<16)throw Error('Uzupełnij ADMIN_PASSWORD w .env (co najmniej 16 znaków).');
 const origin=new URL(values.SITE_ORIGIN||previous.SITE_ORIGIN||'https://parafia-zabki.kaibajor.chatgpt.site');
 if(origin.protocol!=='https:'||origin.pathname!=='/'||origin.search||origin.hash||origin.username||origin.password)throw Error('SITE_ORIGIN musi być adresem HTTPS bez ścieżki.');
 if(previous.ADMIN_SECRET_KEY&&!/^[a-f0-9]{64}$/.test(previous.ADMIN_SECRET_KEY))throw Error('Istniejący klucz MFA ma nieprawidłowy format. Nie zmieniono konfiguracji.');
 const salt=randomBytes(16),digest=pbkdf2Sync(password,salt,600000,32,'sha256');
 return {ADMIN_USERNAME:username,ADMIN_PASSWORD_HASH:`pbkdf2-sha256$600000$${salt.toString('hex')}$${digest.toString('hex')}`,ADMIN_SECRET_KEY:previous.ADMIN_SECRET_KEY||randomBytes(32).toString('hex'),SITE_ORIGIN:origin.origin};
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  const values=parseEnv(readFileSync('.env','utf8'));
  const previous=existsSync('.dev.vars')?parseEnv(readFileSync('.dev.vars','utf8')):{};
  const prepared=prepareAdminEnvironment(values,previous);
  const local={...previous,...prepared};delete local.ADMIN_PASSWORD;
  writeFileSync('.dev.vars',Object.entries(local).map(([key,value])=>`${key}=${JSON.stringify(value)}`).join('\n')+'\n',{mode:0o600});chmodSync('.dev.vars',0o600);
  mkdirSync('.sites-runtime',{recursive:true});
  writeFileSync('.sites-runtime/admin-secrets.json',JSON.stringify({set_values:Object.entries(prepared).filter(([key])=>key!=='ADMIN_SECRET_KEY'||!previous.ADMIN_SECRET_KEY).map(([key,value])=>({key,value,is_secret:key!=='SITE_ORIGIN'}))},null,2)+'\n',{mode:0o600});chmodSync('.sites-runtime/admin-secrets.json',0o600);
  console.log('Przygotowano lokalne logowanie oraz poufną konfigurację dla Sites. Nie wypisano loginu, hasła ani sekretów.');
  console.log('Publiczna strona użyje nowych danych dopiero po zastosowaniu konfiguracji w Sites i publikacji. Klucz istniejącej konfiguracji MFA został zachowany.');
 }catch(error){console.error(error.code==='ENOENT'?'Brak .env. Skopiuj .env.example do .env i wpisz własny login oraz hasło.':error.message);process.exitCode=1}
}
