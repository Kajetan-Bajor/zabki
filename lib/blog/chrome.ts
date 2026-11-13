import brandData from './brand.json';
import {esc} from './security';
import {formattedBankAccount,officeSchedule,parishAddress,parishName} from './content';
import {pages,standardsPath} from './pages';
const caret='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
const faithful=[['/sakramenty','Sakramenty i posługi'],['/wspolnoty','Wspólnoty i inicjatywy'],['/harmonogram','Harmonogram'],['/o-naszej-parafii','O naszej parafii'],['/duszpasterze','Duszpasterze']];
const news=[['/ogloszenia-parafialne','Ogłoszenia parafialne'],['/nadchodzace-wydarzenia','Kalendarium'],['/#comp-mj68kcor','Galeria zdjęć']];
const privacyPath='/prywatnosc-i-cookies';
const documents=[
 [privacyPath,'Polityka prywatności i cookies'],
 [standardsPath,'Standardy ochrony małoletnich'],
];
const menuGroups=[
 {id:'dla-wiernych',label:'Dla wiernych',items:faithful},
 {id:'aktualnosci',label:'Aktualności',items:news},
 {id:'dokumenty',label:'Dokumenty',items:documents},
];
function brand(){return `<a class="site-brand" href="/" aria-label="${parishName} — strona główna">${brandData.logo}<span>Parafia pw. Świętej Trójcy<strong>w Ząbkach</strong></span></a>`}
const links=(items:string[][],path:string)=>items.map(([href,label])=>`<a href="${href}"${path===href?' aria-current="page"':''}>${esc(label)}</a>`).join('');
export function header(path:string){return `<header class="site-header"><div class="site-header-inner">${brand()}<nav class="parish-nav" aria-label="Menu główne"><ul class="parish-menu"><li><a class="nav-item" href="/"${path==='/'?' aria-current="page"':''}>Str. Główna</a></li>${menuGroups.map(({id,label,items})=>`<li class="nav-group${id==='dokumenty'?' nav-documents':''}"><button class="nav-item nav-toggle" type="button" aria-expanded="false" aria-controls="site-dropdown-${id}">${label}${caret}</button><div id="site-dropdown-${id}" class="nav-dropdown" aria-hidden="true" inert>${links(items,path)}</div></li>`).join('')}<li><a class="nav-item" href="/kontakt"${path==='/kontakt'?' aria-current="page"':''}>Kontakt</a></li></ul></nav><button class="site-menu-toggle" aria-label="Menu" aria-expanded="false" aria-controls="site-mobile-menu" type="button"><span></span><span></span><span></span></button></div></header>`}
export function footer(){
 const standards=pages.find(page=>page.path===standardsPath);
 return `<footer class="site-footer"><div class="site-footer-inner"><div class="site-footer-main"><div class="site-footer-brand">${brand()}</div><section><h2>Informacje</h2>${officeSchedule}<p><strong>Rachunek bankowy parafii</strong><br><span class="parish-account">${formattedBankAccount}</span></p></section><nav aria-label="Struktura witryny"><h2>Struktura</h2>${links([['/','Strona główna'],['/sakramenty','Sakramenty i posługi'],['/wspolnoty','Wspólnoty i inicjatywy'],['/nadchodzace-wydarzenia','Kalendarium'],['/lista-podstron','Lista podstron']],'')}</nav><section><h2>Jak dojechać</h2><p><strong>Adres:</strong><br><a href="https://www.google.com/maps/search/?api=1&amp;query=Parafia+Swietej+Trojcy+Pilsudskiego+46+Zabki" target="_blank" rel="noopener">${parishAddress}</a></p></section></div><div class="site-footer-bottom"><div class="site-footer-legal"><a href="/kontakt">Kontakt</a><a href="/prywatnosc-i-cookies">Prywatność i cookies</a>${standards?`<a href="${standardsPath}">${esc(standards.title)}</a>`:''}</div><p>© ${new Date().getFullYear()} ${parishName}</p><p class="site-footer-credit">Projekt strony: <a href="https://nemeris.pl/" target="_blank" rel="noopener">Nemeris.pl</a><span aria-hidden="true">|</span><a href="https://koscioly.eu/" target="_blank" rel="noopener">Koscioly.eu</a></p></div></div></footer>`}
export function menu(path:string){return `<div class="menu-overlay" hidden><div class="menu-shade"></div><nav class="menu-drawer" id="site-mobile-menu" aria-label="Menu mobilne"><button class="menu-close" aria-label="Zamknij menu" type="button">×</button><a class="drawer-item${path==='/'?' current':''}" href="/">Str. Główna</a>${menuGroups.map(({id,label,items})=>`<details${id==='dokumenty'?' class="nav-documents"':''}><summary aria-expanded="false">${label}</summary><div class="drawer-submenu">${links(items,path)}</div></details>`).join('')}<a class="drawer-item" href="/kontakt">Kontakt</a></nav></div>`}
export function withChrome(html:string,path:string){return html.replace('{{SITE_HEADER}}',header(path)).replace('{{SITE_FOOTER}}',footer()).replace('{{SITE_MENU}}',menu(path)).replace('</head>','<link rel="stylesheet" href="/chrome.css"></head>')}
