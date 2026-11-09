import shell from './page-shell.json';
import {pages} from './pages';
import {esc} from './security';
import type {Post} from './types';
type Link={title:string;path:string};
const arrow='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
function section(title:string,items:Link[],id:string){return `<section class="directory-group" id="${id}"><div class="directory-group-heading"><h2>${esc(title)}</h2><span>${items.length}</span></div><ul>${items.map(p=>`<li><a href="${esc(p.path)}"><span>${esc(p.title)}</span>${arrow}</a></li>`).join('')}</ul></section>`}
export function directory(posts:Post[]){
 const main=[{title:'Strona główna',path:'/'},{title:'Lista podstron',path:'/lista-podstron'},...pages.filter(p=>p.kind==='information'&&p.special!=='about')];
 const parish=pages.filter(p=>p.special==='about');
 // Keep parish information alongside the general pages; details have their own groups.
 main.push(...parish);
 const sacraments=pages.filter(p=>p.path==='/sakramenty'||p.kind==='detail'&&p.group==='sakramenty');
 const communities=pages.filter(p=>p.path==='/wspolnoty'||p.kind==='detail'&&p.group==='wspolnoty');
 const blog:Link[]=[{title:'Ogłoszenia parafialne',path:'/ogloszenia-parafialne'}];
 if(posts.length)blog.unshift({title:'Wszystkie posty',path:'/wszystkie-posty'});
 if(posts.some(post=>post.category==='slowo'))blog.push({title:'Słowo na dziś',path:'/slowo-na-dzis'});
 blog.push(...posts.map(post=>({title:post.title,path:'/post/'+encodeURIComponent(post.slug)+'/'})));
 const events=pages.filter(p=>p.event).sort((a,b)=>a.event!.start.localeCompare(b.event!.start)).map(p=>({path:p.path,title:p.title+' — '+new Intl.DateTimeFormat('pl-PL',{day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit',timeZone:'Europe/Warsaw'}).format(new Date(p.event!.start))}));
 const count=main.length+sacraments.length+communities.length+blog.length+events.length;
 const content=`<div class="template-page production-page directory-page"><section class="template-list-hero"><div class="template-wrap"><div class="template-crumb"><a href="/">Strona główna</a><span aria-hidden="true">/</span><span>Lista podstron</span></div><div class="template-centered"><span class="template-eyebrow">ODKRYJ NASZĄ WITRYNĘ</span><h1>Lista podstron</h1><p>Informacje, sakramenty, wspólnoty, ogłoszenia i wydarzenia w jednym miejscu.</p></div></div></section><div class="template-wrap directory-body"><nav class="directory-shortcuts" aria-label="Przejdź do kategorii"><a href="#informacje">Informacje</a><a href="#sakramenty">Sakramenty</a><a href="#wspolnoty">Wspólnoty</a><a href="#blog">Blog</a>${events.length?'<a href="#wydarzenia">Wydarzenia</a>':''}</nav><p class="directory-count">Liczba stron: ${count}</p><div class="directory-grid">${section('Informacje',main,'informacje')}${section('Sakramenty i posługi',sacraments,'sakramenty')}${section('Wspólnoty i inicjatywy',communities,'wspolnoty')}${section('Blog parafialny',blog,'blog')}</div>${events.length?section('Archiwum wydarzeń',events,'wydarzenia'):''}</div></div>`;
 return shell.shell.replace('{{PREVIEW_CONTENT}}',content).replace(/<meta[^>]+name="robots"[^>]*>/gi,'').replace(/<title>[^<]*<\/title>/,'<title>Lista podstron | Parafia pw. Świętej Trójcy w Ząbkach</title>').replace(/<meta name="description"[^>]*>/,'<meta name="description" content="Pełna lista podstron parafii Świętej Trójcy w Ząbkach: informacje, sakramenty, wspólnoty, blog i wydarzenia.">').replace('</head>','<link rel="stylesheet" href="/pages.css"><link rel="stylesheet" href="/directory.css"></head>');
}
