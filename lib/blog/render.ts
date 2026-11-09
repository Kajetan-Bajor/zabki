import templates from './templates.json';
import {resolveContent,parishName} from './content';
import { esc, richText } from './security';
import { categories, type Post, type Category } from './types';
const url=(post:Post)=>'/post/'+encodeURIComponent(post.slug)+'/';
const date=(time:number)=>new Intl.DateTimeFormat('pl-PL',{day:'numeric',month:'short',year:'numeric',timeZone:'Europe/Warsaw'}).format(new Date(time));
export function card(post:Post){const link=url(post),minutes=Math.max(1,Math.ceil(post.content.split(/\s+/).length/200));return `<article class="announcement${post.image?'':' no-image'}"><div class="announcement-copy"><div class="post-author">${templates.avatar}<div>${esc(post.author)}<br><span>${esc(date(post.published_at))} · ${minutes} min czytania</span></div></div><h3><a href="${link}">${esc(post.title)}</a></h3><a class="post-excerpt" href="${link}">${esc(post.excerpt)}</a><div class="post-bottom"><span>${esc(categories[post.category])}</span></div></div>${post.image?`<a class="announcement-image" href="${link}" tabindex="-1" aria-label="${esc(post.title)}"><img src="${esc(post.image)}" alt="${esc(post.title)}" loading="lazy"></a>`:''}</article>`}
const empty=(category?:Category)=>`<p class="blog-empty">${category==='ogloszenia'?'Nie ma jeszcze opublikowanych ogłoszeń parafialnych.':category?'Nie ma jeszcze opublikowanych wpisów w tej kategorii.':'Nie ma jeszcze opublikowanych wpisów.'}</p>`;
export function home(posts:Post[]){
 const announcements=posts.filter(post=>post.category==='ogloszenia').slice(0,3).map(card).join('');
 const word=posts.filter(post=>post.category==='slowo').slice(0,3).map(card).join('');
 return resolveContent(templates.home)
  .replace('{{ANNOUNCEMENTS}}',()=>announcements||empty('ogloszenia'))
  .replace('{{WORD_TAB}}',word?templates.wordTab:'')
  .replace('{{WORD_PANEL}}',()=>word?templates.wordPanel.replace('{{WORD}}',()=>word):'');
}
const categoryPath=(category?:Category)=>category==='ogloszenia'?'/ogloszenia-parafialne':category==='slowo'?'/slowo-na-dzis':'/wszystkie-posty';
function postBody(post:Post,heading:'h1'|'h2'){
 return `<${heading}>${esc(post.title)}</${heading}><div class="post-author">${templates.avatar}<div>${esc(post.author)}<br><time datetime="${new Date(post.published_at).toISOString()}">${esc(date(post.published_at))}</time></div></div>${post.image?`<img class="post-cover" src="${esc(post.image)}" alt="${esc(post.title)}">`:''}<div class="parish-post-content">${richText(post.content)}</div>`;
}
function metadata(template:string,title:string,description?:string){
 return template.replace('{{TITLE}}',()=>`${esc(title)} | ${parishName}`)
  .replace('{{META}}',()=>description?`<meta name="description" content="${esc(description)}">`:'');
}
export function blog(posts:Post[],category?:Category,page=1){
 const perPage=12,count=Math.max(1,Math.ceil(posts.length/perPage)),n=Math.min(page,count);
 const title=category?categories[category]:'Wszystkie posty';
 const visible=posts.slice((n-1)*perPage,n*perPage);
 const latest=category==='ogloszenia'&&n===1?visible.shift():undefined;
 const pages=count>1?`<nav class="blog-pagination" aria-label="Strony bloga">${Array.from({length:count},(_,i)=>`<a href="${categoryPath(category)}?page=${i+1}"${i+1===n?' aria-current="page"':''}>${i+1}</a>`).join('')}</nav>`:'';
 return metadata(templates.blog,title,latest?.excerpt)
  .replace('{{BLOG_TITLE}}',()=>esc(title))
  .replace('{{PAGINATION}}',()=>pages)
  .replace('{{POSTS}}',()=>posts.length?visible.map(card).join(''):empty(category))
  .replace('{{LATEST}}',()=>latest?`<article class="parish-post latest-announcement">${postBody(latest,'h2')}<a class="post-back" href="${url(latest)}">Link do tego ogłoszenia</a></article>`:'');
}
export function article(post:Post){
 return metadata(templates.article,post.title,post.excerpt)
  .replace('{{ARTICLE}}',()=>`<article class="parish-post"><a class="post-back" href="${categoryPath(post.category)}">← ${esc(categories[post.category])}</a>${postBody(post,'h1')}</article>`);
}
export {notFound} from './not-found';
