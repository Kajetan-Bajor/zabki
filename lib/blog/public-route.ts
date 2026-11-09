import { home, blog, article, notFound } from './render';
import { withChrome } from './chrome';
import { directory } from './directory';
import { page, pages, aliases, eventICS } from './pages';
import { parishName } from './content';
import { esc } from './security';
import type { Category, Post } from './types';

const publicCSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'";
const adminCSP = "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'";

export function response(
  request: Request,
  body: BodyInit | null,
  status = 200,
  type = 'text/html; charset=utf-8',
  extra: Record<string, string> = {},
  isAdmin = false,
) {
  const headers = new Headers({
    'Content-Type': type,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'DENY',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': isAdmin ? adminCSP : publicCSP,
    ...extra,
  });
  if (new URL(request.url).protocol === 'https:') {
    headers.set('Strict-Transport-Security', 'max-age=31536000');
  }
  if (isAdmin) headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  return new Response(request.method === 'HEAD' ? null : body, { status, headers });
}

function decorate(html: string, url: URL) {
  const canonical = esc(url.origin + url.pathname);
  const organization = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: parishName,
    telephone: '+48608186185',
  }).replace(/</g, '\\u003c');
  return withChrome(html, url.pathname)
    .replace(/<script[^>]+type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<link[^>]+rel="canonical"[^>]*>/gi, '')
    .replace(/<meta[^>]+property="og:(?:url|title|description|image)"[^>]*>/gi, '')
    .replace('</head>', `<link rel="canonical" href="${canonical}"><script type="application/ld+json">${organization}</script></head>`);
}

type PublicData = {
  posts: (category?: Category) => Promise<Post[]>;
  post: (slug: string) => Promise<Post | null>;
  origin?: string;
};

const blogCategories: Record<string, Category | undefined> = {
  '/wszystkie-posty': undefined,
  '/ogloszenia-parafialne': 'ogloszenia',
  '/slowo-na-dzis': 'slowo',
};
const canonicalPaths = new Set(['/', '/lista-podstron', ...Object.keys(blogCategories), ...pages.map(page => page.path)]);

export function publicPath(url: URL) {
  return decodeURIComponent(url.pathname).replace(/\/+$/, '') || '/';
}

export async function publicPage(request: Request, path: string, data: PublicData) {
  const url = new URL(request.url);
  const html = (body: string, status = 200) => response(request, decorate(body, url), status);
  const redirect = (target: string) => response(request, null, 308, 'text/plain; charset=utf-8', {
    Location: target + url.search,
  });
  const oldBlog:Record<string,string>={'/blog':'/wszystkie-posty','/blog/categories/ogloszenia':'/ogloszenia-parafialne','/blog/categories/ogłoszenia':'/ogloszenia-parafialne','/blog/categories/slowo':'/slowo-na-dzis'};
  if(oldBlog[path])return redirect(oldBlog[path]);
  const legacyPath = (path.replace(/^\/parafia-zabki(?=\/|$)/, '') || '/').toLowerCase();
  const canonical = aliases[legacyPath] ?? (canonicalPaths.has(legacyPath) ? legacyPath : null);
  if (canonical && canonical !== path) return redirect(canonical);
  if (url.pathname.endsWith('/') && path !== '/' && canonicalPaths.has(path)) return redirect(path);

  if (path.endsWith('.ics')) {
    const ics = eventICS(path.slice(0, -4));
    if (ics) return response(request, ics, 200, 'text/calendar; charset=utf-8', {
      'Content-Disposition': 'attachment; filename=wydarzenie.ics',
    });
  }
  if (path === '/lista-podstron') return html(directory(await data.posts()));
  const content = page(path);
  if (content) return html(content);
  if (Object.hasOwn(blogCategories, path)) {
    const category = blogCategories[path];
    const index = Math.max(1, Math.min(10000, parseInt(url.searchParams.get('page') || '1') || 1));
    return html(blog(await data.posts(category), category, index));
  }
  if (path === '/') return html(home(await data.posts()));
  if (path.startsWith('/post/')) {
    const post = await data.post(path.slice(6));
    return post ? html(article(post)) : html(notFound(), 404);
  }
  const origin = data.origin || url.origin;
  if (path === '/sitemap.xml') {
    const posts = await data.posts();
    const visiblePaths = new Set(canonicalPaths);
    if (!posts.length) visiblePaths.delete('/wszystkie-posty');
    if (!posts.some(post => post.category === 'slowo')) visiblePaths.delete('/slowo-na-dzis');
    const paths = [...visiblePaths, ...posts.map(post => '/post/' + encodeURIComponent(post.slug) + '/')];
    const locations = [...new Set(paths)].map(path => '<url><loc>' + esc(origin + path) + '</loc></url>').join('');
    return response(request, '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + locations + '</urlset>', 200, 'application/xml; charset=utf-8');
  }
  if (path === '/robots.txt') {
    return response(request, 'User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ' + origin + '/sitemap.xml\n', 200, 'text/plain; charset=utf-8');
  }
  return html(notFound(), 404);
}

