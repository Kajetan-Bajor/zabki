import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

// Reuse the running Sites backend so the Vercel deployment shares its blog,
// media and administrator account. The upstream is intentionally fixed.
const UPSTREAM = 'https://parafia-zabki.kaibajor.chatgpt.site';
const allowedMethods = new Set(['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE']);
const forwardedHeaders = ['accept', 'accept-language', 'content-type', 'cookie', 'user-agent', 'x-csrf-token', 'sec-fetch-site'];
const blockedResponseHeaders = new Set(['connection', 'content-length', 'content-encoding', 'transfer-encoding', 'set-cookie', 'keep-alive', 'upgrade', 'proxy-authenticate', 'proxy-authorization', 'trailer']);

export const config = { api: { bodyParser: false } };

export async function handle(req, res, fetcher = fetch) {
  const method = (req.method || 'GET').toUpperCase();
  if (!allowedMethods.has(method)) { res.statusCode = 405; res.end('Niedozwolona metoda.'); return; }
  const host = req.headers.host;
  if (!host || /[\s/\\@]/.test(host)) { res.statusCode = 400; res.end('Nieprawidłowe żądanie.'); return; }
  const incoming = new URL(req.url || '/', `https://${host}`);
  const paths = incoming.searchParams.getAll('__site_path');
  if (paths.length !== 1 || paths[0].startsWith('/') || paths[0].includes('\\')) { res.statusCode = 400; res.end('Nieprawidłowy adres.'); return; }
  incoming.searchParams.delete('__site_path');
  const target = new URL('/' + paths[0], UPSTREAM);
  if (target.origin !== UPSTREAM) { res.statusCode = 400; res.end('Nieprawidłowy adres.'); return; }
  target.search = incoming.searchParams.toString();

  const modifying = !['GET', 'HEAD'].includes(method);
  if (modifying) {
    // The backend accepts the Sites origin; validate the browser's actual
    // Vercel origin first rather than weakening its existing CSRF checks.
    const origin = req.headers.origin;
    if (typeof origin !== 'string' || origin !== `https://${host}` || req.headers['sec-fetch-site'] === 'cross-site') {
      res.statusCode = 403; res.end('Żądanie zostało odrzucone.'); return;
    }
  }
  const headers = new Headers();
  for (const name of forwardedHeaders) {
    const value = req.headers[name];
    if (typeof value === 'string') headers.set(name, value);
  }
  if (modifying) headers.set('origin', UPSTREAM);
  try {
    const options = { method, headers, redirect: 'manual' };
    if (modifying) { options.body = Readable.toWeb(req); options.duplex = 'half'; }
    const response = await fetcher(target, options);
    res.statusCode = response.status;
    for (const [name, value] of response.headers) {
      if (!blockedResponseHeaders.has(name.toLowerCase())) {
        res.setHeader(name, name.toLowerCase() === 'location' && value.startsWith(UPSTREAM + '/') ? value.slice(UPSTREAM.length) : value);
      }
    }
    const cookies = response.headers.getSetCookie();
    if (cookies.length) res.setHeader('Set-Cookie', cookies);
    if (method === 'HEAD' || !response.body) { res.end(); return; }
    await pipeline(Readable.fromWeb(response.body), res);
  } catch {
    if (!res.headersSent) { res.statusCode = 502; res.end('Nie można połączyć się ze stroną parafii. Spróbuj ponownie.'); }
    else res.destroy();
  }
}

export default handle;
