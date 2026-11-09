import seeds from './seeds.json';
import type { Env, Post, Category } from './types';
import { HttpError, audit } from './auth';
import { random } from './security';
export async function initialized(env:Env){if(!env.databaseConfigured)return false;return !!await env.DB.prepare("SELECT value FROM settings WHERE key='posts_imported'").first()}
const retiredImports=new Set(['original-1','original-2','original-3']);
const isRetiredImport=(p:Post)=>retiredImports.has(p.id)&&p.version===1;
const approvedSeeds=(seeds as Post[]).filter(p=>!isRetiredImport(p));
const approvedIds=approvedSeeds.map(p=>p.id);
const approvedSlugs=approvedSeeds.map(p=>p.slug);
const published=(p:Post,now:number)=>p.status==='published'&&!p.deleted_at&&p.published_at<=now&&!isRetiredImport(p);
async function retireOriginal(env:Env){await env.DB.prepare("UPDATE posts SET status='draft',deleted_at=?,updated_at=?,version=version+1 WHERE id IN ('original-1','original-2','original-3') AND version=1 AND deleted_at IS NULL").bind(Date.now(),Date.now()).run()}
export async function importOriginal(env:Env){
 const columns='id,slug,title,excerpt,content,category,author,image,status,published_at,created_at,updated_at,version,deleted_at';
 const insert=(p:Post)=>env.DB.prepare(`INSERT INTO posts (${columns}) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT DO NOTHING`).bind(...columns.split(',').map(k=>p[k as keyof Post]));
 if(await initialized(env)){
  await retireOriginal(env);
  if(approvedSeeds.length)await env.DB.batch(approvedSeeds.map(insert));
  return;
 }
 await env.DB.batch([...(seeds as Post[]).map(insert),env.DB.prepare("INSERT INTO settings (key,value) VALUES ('posts_imported','1') ON CONFLICT(key) DO NOTHING")]);
}
export async function publicPosts(env:Env,category?:Category){
 const now=Date.now(),visible=(p:Post)=>published(p,now)&&(!category||p.category===category);
 if(!await initialized(env))return approvedSeeds.filter(visible).sort(byDate);
 // A database record wins even when an editor has renamed, unpublished or deleted it.
 const {results}=await env.DB.prepare(`SELECT * FROM posts WHERE (status='published' AND deleted_at IS NULL AND published_at<=? ${category?'AND category=?':''}) OR id=ANY(?::text[]) OR slug=ANY(?::text[])`)
  .bind(now,...(category?[category]:[]),approvedIds,approvedSlugs).all<Post>();
 const ids=new Set(results.map(p=>p.id)),slugs=new Set(results.map(p=>p.slug));
 return [...results,...approvedSeeds.filter(p=>!ids.has(p.id)&&!slugs.has(p.slug))].filter(visible).sort(byDate);
}
const byDate=(a:Post,b:Post)=>b.published_at-a.published_at||b.created_at-a.created_at;
export async function publicPost(env:Env,slug:string){
 const now=Date.now(),seed=approvedSeeds.find(p=>p.slug===slug);
 const fallback=seed&&published(seed,now)?seed:null;
 if(!await initialized(env))return fallback;
 const post=await env.DB.prepare("SELECT * FROM posts WHERE slug=? OR id=? ORDER BY (slug=?) DESC LIMIT 1").bind(slug,seed?.id??null,slug).first<Post>();
 return post?(post.slug===slug&&published(post,now)?post:null):fallback;
}
export async function adminPosts(env:Env){await importOriginal(env);return (await env.DB.prepare('SELECT * FROM posts ORDER BY updated_at DESC').all<Post>()).results}
export async function validatedPost(env:Env,data:any){if(!data||typeof data!=='object'||Array.isArray(data))throw new HttpError(400,'Nieprawidłowe dane wpisu.');const field=(name:string,max:number,min=0)=>{if(typeof data[name]!=='string')throw new HttpError(400,`Uzupełnij pole: ${name}.`);const value=data[name].trim();if(value.length<min||value.length>max)throw new HttpError(400,`Nieprawidłowa długość pola: ${name}.`);return value};const title=field('title',180,1),slug=field('slug',120,1),content=field('content',60000,1),excerpt=field('excerpt',600),author=field('author',100,1),image=field('image',200);if(!/^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u.test(slug))throw new HttpError(400,'Adres wpisu może zawierać litery, cyfry i łączniki.');if(!['ogloszenia','slowo'].includes(data.category)||!['draft','published'].includes(data.status))throw new HttpError(400,'Wybierz poprawną kategorię i stan publikacji.');if(image){if(/^\/assets\/[a-f0-9]+\.(webp|png|jpg|jpeg|avif)$/.test(image)){
 // Existing locally hosted images are preserved; arbitrary origins are rejected.
 }else if(/^\/media\/[a-f0-9]{32}$/.test(image)){if(!await env.DB.prepare('SELECT id FROM uploads WHERE id=?').bind(image.slice(7)).first())throw new HttpError(400,'Zdjęcie nie istnieje.')}else throw new HttpError(400,'Wgraj zdjęcie przez panel.');}
 let publishedAt=Date.parse(field('publishedAt',40,1));if(!Number.isFinite(publishedAt)||publishedAt<0||publishedAt>Date.now()+366*86400000)throw new HttpError(400,'Nieprawidłowa data publikacji.');return {title,slug,content,excerpt:excerpt||content.replace(/[#*]/g,'').slice(0,250),author,image,category:data.category,status:data.status,publishedAt}}
export async function savePost(env:Env,data:any,id?:string){const p=await validatedPost(env,data),time=Date.now();const duplicate=await env.DB.prepare('SELECT id FROM posts WHERE slug=? AND id<>?').bind(p.slug,id||'').first();if(duplicate)throw new HttpError(409,'Ten adres wpisu jest już zajęty.');if(id){if(!Number.isInteger(data.version)||data.version<1)throw new HttpError(400,'Odśwież wpis przed zapisaniem.');const result=await env.DB.prepare('UPDATE posts SET slug=?,title=?,excerpt=?,content=?,category=?,author=?,image=?,status=?,published_at=?,updated_at=?,version=version+1 WHERE id=? AND version=? AND deleted_at IS NULL').bind(p.slug,p.title,p.excerpt,p.content,p.category,p.author,p.image,p.status,p.publishedAt,time,id,data.version).run();if(!result.meta.changes)throw new HttpError(409,'Wpis został zmieniony lub usunięty. Odśwież listę przed edycją.');await audit(env,'post_updated',id);return id;}const newId=random(16);await env.DB.prepare('INSERT INTO posts (id,slug,title,excerpt,content,category,author,image,status,published_at,created_at,updated_at,version,deleted_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,1,NULL)').bind(newId,p.slug,p.title,p.excerpt,p.content,p.category,p.author,p.image,p.status,p.publishedAt,time,time).run();await audit(env,'post_created',newId);return newId}
export async function deletePost(env:Env,id:string,version:number){if(!Number.isInteger(version))throw new HttpError(400,'Odśwież wpis.');const r=await env.DB.prepare("UPDATE posts SET deleted_at=?,updated_at=?,version=version+1 WHERE id=? AND version=? AND deleted_at IS NULL").bind(Date.now(),Date.now(),id,version).run();if(!r.meta.changes)throw new HttpError(409,'Wpis został już zmieniony. Odśwież listę.');await audit(env,'post_deleted',id)}
export async function restorePost(env:Env,id:string,version:number){if(!Number.isInteger(version)||version<1)throw new HttpError(400,'Odśwież wpis.');const r=await env.DB.prepare("UPDATE posts SET deleted_at=NULL,status='draft',updated_at=?,version=version+1 WHERE id=? AND version=? AND deleted_at IS NOT NULL").bind(Date.now(),id,version).run();if(!r.meta.changes)throw new HttpError(409,'Wpis został już zmieniony.');await audit(env,'post_restored',id)}
