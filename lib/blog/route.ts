import {runtimeEnv} from '../server/runtime';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
const adminHTML=readFileSync(join(process.cwd(),'lib/blog/admin.html'),'utf8');
import { context, login, finishMfa, logout, requireAdmin, readJSON, readLimited, HttpError, rate, audit, local } from './auth';
import { publicPosts, publicPost, adminPosts, savePost, deletePost, restorePost, importOriginal } from './posts';
import { publicPage, publicPath, response as siteResponse } from './public-route';
import { random, richText } from './security';
import type { Env, Category } from './types';
function response(request:Request,body:string|BodyInit|null,status=200,type='text/html; charset=utf-8',extra:Record<string,string>={}){
 return siteResponse(request,body,status,type,extra,new URL(request.url).pathname.startsWith('/admin'));
}
const json=(r:Request,data:unknown,status=200,headers:Record<string,string>={})=>response(r,JSON.stringify(data),status,'application/json; charset=utf-8',headers);
async function upload(request:Request,env:Env){await requireAdmin(request,env,true);await rate(env,'upload',60,3600000);if(!request.headers.get('content-type')?.startsWith('multipart/form-data;'))throw new HttpError(415,'Wybierz plik zdjęcia.');const bytes=await readLimited(request,3*1024*1024+20000);const form=await new Request(request.url,{method:'POST',headers:{'Content-Type':request.headers.get('content-type')!},body:bytes}).formData();const file=form.get('file');if(!(file instanceof File)||file.size<12||file.size>3*1024*1024)throw new HttpError(400,'Zdjęcie musi mieć do 3 MB.');const buffer=new Uint8Array(await file.arrayBuffer());let mime='';if(buffer[0]===255&&buffer[1]===216&&buffer[2]===255)mime='image/jpeg';else if([137,80,78,71,13,10,26,10].every((v,i)=>buffer[i]===v))mime='image/png';else if(String.fromCharCode(...buffer.slice(0,4))==='RIFF'&&String.fromCharCode(...buffer.slice(8,12))==='WEBP')mime='image/webp';if(!mime||file.type!==mime)throw new HttpError(400,'Wgraj prawidłowy plik JPG, PNG lub WebP.');const id=random(16),key='blog/'+id;await env.BUCKET.put(key,buffer,{httpMetadata:{contentType:mime}});try{await env.DB.prepare('INSERT INTO uploads (id,object_key,mime,size,created_at) VALUES (?,?,?,?,?)').bind(id,key,mime,file.size,Date.now()).run()}catch(e){await env.BUCKET.delete(key);throw e}await audit(env,'image_uploaded');return json(request,{url:'/media/'+id},201)}
async function handle(request:Request){const env=runtimeEnv();const url=new URL(request.url);let path:string;try{path=publicPath(url)}catch{return response(request,'Nieprawidłowy adres.',400,'text/plain; charset=utf-8')}
 try{
  if(path==='/admin'){if(!['GET','HEAD'].includes(request.method))throw new HttpError(405,'Niedozwolona metoda.');return response(request,adminHTML)}
  if(path.startsWith('/admin/api/')){
   if(path==='/admin/api/preview'&&request.method==='POST'){await requireAdmin(request,env,true);const data=await readJSON(request);if(typeof data.content!=='string'||data.content.length>60000)throw new HttpError(400,'Treść podglądu może mieć do 60 000 znaków.');return json(request,{html:richText(data.content)});}
   if(path==='/admin/api/auth/context'&&request.method==='GET'){const r=await context(request,env);return json(request,r.body,200,r.headers)}
   if(path==='/admin/api/auth/login'&&request.method==='POST'){const r=await login(request,env);return json(request,r.body,200,r.headers)}
   if(path==='/admin/api/auth/mfa'&&request.method==='POST'){const r=await finishMfa(request,env);await importOriginal(env);return json(request,r.body,200,r.headers)}
   if(path==='/admin/api/auth/logout'&&request.method==='POST'){const r=await logout(request,env);return json(request,r.body,200,r.headers)}
   if(path==='/admin/api/posts'&&request.method==='GET'){await requireAdmin(request,env);return json(request,{posts:await adminPosts(env)})}
   if(path==='/admin/api/posts'&&request.method==='POST'){await requireAdmin(request,env,true);await rate(env,'post-write',120,3600000);const id=await savePost(env,await readJSON(request));return json(request,{id},201)}
   const match=path.match(/^\/admin\/api\/posts\/([a-z0-9-]{1,80})(\/restore)?$/);
   if(match){await requireAdmin(request,env,true);await rate(env,'post-write',120,3600000);const data=await readJSON(request);if(match[2]&&request.method==='POST'){await restorePost(env,match[1],data.version);return json(request,{ok:true})}if(!match[2]&&request.method==='PUT'){await savePost(env,data,match[1]);return json(request,{ok:true})}if(!match[2]&&request.method==='DELETE'){await deletePost(env,match[1],data.version);return json(request,{ok:true})}throw new HttpError(405,'Niedozwolona metoda.')}
   if(path==='/admin/api/upload'&&request.method==='POST')return await upload(request,env);
   throw new HttpError(404,'Nie znaleziono zasobu.');
  }
  if(!['GET','HEAD'].includes(request.method))throw new HttpError(405,'Niedozwolona metoda.');
  if(path==='/api/blog'){const category=url.searchParams.get('category');if(category&&!['ogloszenia','slowo'].includes(category))throw new HttpError(400,'Nieprawidłowa kategoria.');const posts=await publicPosts(env,category as Category|undefined);return json(request,{posts})}
  if(path.startsWith('/media/')){const id=path.slice(7);if(!/^[a-f0-9]{32}$/.test(id))throw new HttpError(404,'Nie znaleziono zdjęcia.');const object=await env.BUCKET.get('blog/'+id);if(!object)throw new HttpError(404,'Nie znaleziono zdjęcia.');return response(request,object.body,200,object.httpMetadata?.contentType||'application/octet-stream',{'Cache-Control':'public, max-age=31536000, immutable','Content-Security-Policy':"default-src 'none'; sandbox",'ETag':object.httpEtag})}
  return await publicPage(request,path,{
   posts:category=>publicPosts(env,category),
   post:slug=>publicPost(env,slug),
   origin:env.SITE_ORIGIN,
  });
 }catch(error){if(error instanceof HttpError)return json(request,{error:error.message},error.status,error.status===429?{'Retry-After':'900'}:{});return json(request,{error:'Nie udało się wykonać operacji. Spróbuj ponownie później.'},500)}
}
export const GET=handle,HEAD=handle,POST=handle,PUT=handle,DELETE=handle,PATCH=handle;
