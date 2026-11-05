import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable, Writable } from 'node:stream';
import { handle } from '../api/vercel-proxy.js';

async function request({url='/api/vercel-proxy?__site_path=admin',method='GET',headers={},body=''}={}, fetcher=async()=>new Response('ok')) {
  const req = Readable.from(body ? [Buffer.from(body)] : []);
  Object.assign(req, {url, method, headers:{host:'example.vercel.app',...headers}});
  let chunks=[];
  const res = new Writable({write(chunk, encoding, callback){chunks.push(Buffer.from(chunk));callback()}});
  res.setHeader=(name,value)=>{res.headers[name.toLowerCase()]=value};res.headers={};
  await handle(req,res,fetcher);
  return {status:res.statusCode,headers:res.headers,body:Buffer.concat(chunks).toString()};
}

test('preserves path, query, redirects and secure cookies',async()=>{
 let target;
 const result=await request({url:'/api/vercel-proxy?__site_path=blog&category=slowo'},async(url)=>{target=url.toString();return new Response(null,{status:308,headers:{location:'https://parafia-zabki.kaibajor.chatgpt.site/slowo-na-dzis','set-cookie':'__Host-test=ok; Path=/; Secure; HttpOnly; SameSite=Strict'}})});
 assert.equal(target,'https://parafia-zabki.kaibajor.chatgpt.site/blog?category=slowo');assert.equal(result.status,308);assert.equal(result.headers.location,'/slowo-na-dzis');assert.match(result.headers['set-cookie'][0],/HttpOnly/);
});

test('rejects cross-site writes and upstream origin escapes',async()=>{
 let called=false;const fetcher=async()=>{called=true;return new Response('ok')};
 assert.equal((await request({method:'POST',headers:{origin:'https://attacker.test'}},fetcher)).status,403);
 assert.equal((await request({url:'/api/vercel-proxy?__site_path=%2F%2Fevil.test'},fetcher)).status,400);
 assert.equal((await request({method:'POST',headers:{origin:'https://example.vercel.app','sec-fetch-site':'cross-site'}},fetcher)).status,403);
 assert.equal(called,false);
});

test('forwards authenticated same-origin writes with CSRF and body',async()=>{
 let observed;const result=await request({method:'POST',headers:{origin:'https://example.vercel.app',cookie:'__Host-session=token','x-csrf-token':'csrf','content-type':'application/json'},body:'{"title":"test"}'},async(url,options)=>{observed={url:url.toString(),origin:options.headers.get('origin'),csrf:options.headers.get('x-csrf-token'),cookie:options.headers.get('cookie'),body:await new Response(options.body).text()};return new Response('{"ok":true}',{status:201,headers:{'content-type':'application/json'}})});
 assert.equal(result.status,201);assert.deepEqual(observed,{url:'https://parafia-zabki.kaibajor.chatgpt.site/admin',origin:'https://parafia-zabki.kaibajor.chatgpt.site',csrf:'csrf',cookie:'__Host-session=token',body:'{"title":"test"}'});
});

test('rejects duplicate path and returns 502 on upstream failure',async()=>{
 assert.equal((await request({url:'/api/vercel-proxy?__site_path=a&__site_path=b'})).status,400);
 assert.equal((await request({},async()=>{throw new Error('offline')})).status,502);
});
