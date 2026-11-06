import { publicPage, publicPath, response } from '../lib/blog/public-route';
import type { Category, Post } from '../lib/blog/types';

const blogApi = 'https://parafia-zabki.kaibajor.chatgpt.site/api/blog';

export async function renderSite(request: Request, fetcher: typeof fetch = fetch) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return response(request, 'Niedozwolona metoda.', 405, 'text/plain; charset=utf-8', { Allow: 'GET, HEAD' });
  }
  const url = new URL(request.url);
  const paths = url.searchParams.getAll('__site_path');
  if (paths.length !== 1 || paths[0].startsWith('/') || paths[0].includes('\\')) {
    return response(request, 'Nieprawidłowy adres.', 400, 'text/plain; charset=utf-8');
  }
  url.pathname = '/' + paths[0];
  url.searchParams.delete('__site_path');
  const pageRequest = new Request(url, { method: request.method });
  let path: string;
  try {
    path = publicPath(url);
  } catch {
    return response(pageRequest, 'Nieprawidłowy adres.', 400, 'text/plain; charset=utf-8');
  }

  async function posts(category?: Category): Promise<Post[]> {
    const endpoint = new URL(blogApi);
    if (category) endpoint.searchParams.set('category', category);
    try {
      const result = await fetcher(endpoint, { redirect: 'error', signal: AbortSignal.timeout(5000) });
      if (!result.ok) throw new Error('Blog request failed');
      const payload = await result.json() as { posts?: unknown };
      if (!Array.isArray(payload?.posts)) throw new Error('Invalid blog response');
      return payload.posts;
    } catch (error) {
      if (path === '/' || path === '/lista-podstron' || path === '/sitemap.xml') return [];
      throw error;
    }
  }

  try {
    return await publicPage(pageRequest, path, {
      posts,
      post: async slug => (await posts()).find(post => post.slug === slug) ?? null,
    });
  } catch {
    return response(pageRequest, 'Nie można pobrać wpisów. Spróbuj ponownie.', 502, 'text/plain; charset=utf-8');
  }
}

export default { fetch: (request: Request) => renderSite(request) };
