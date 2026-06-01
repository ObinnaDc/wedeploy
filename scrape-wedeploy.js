const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const rootUrl = new URL('https://wedeploy.studio/');
const outDir = path.resolve('scraped-site');
const seenPages = new Set();
const queuedPages = [rootUrl.href];
const assetMap = new Map();
const maxPages = 80;

async function ensureDir(p){ await fs.mkdir(p, {recursive:true}); }
function sanitizeSegment(s){ return decodeURIComponent(s || '').replace(/[<>:"\\|?*\x00-\x1F]/g,'-').replace(/\s+/g,'-') || 'index'; }
function pageFileFor(urlStr){
  const u = new URL(urlStr);
  const parts = u.pathname.split('/').filter(Boolean).map(sanitizeSegment);
  if (parts.length === 0) return path.join(outDir, 'index.html');
  if (/\.[a-z0-9]{1,8}$/i.test(parts[parts.length-1])) return path.join(outDir, ...parts);
  return path.join(outDir, ...parts, 'index.html');
}
function assetFileFor(urlStr, contentType=''){
  if (assetMap.has(urlStr)) return assetMap.get(urlStr);
  const u = new URL(urlStr);
  let ext = path.extname(u.pathname).split('?')[0];
  if (!ext) {
    if (contentType.includes('css')) ext = '.css';
    else if (contentType.includes('javascript')) ext = '.js';
    else if (contentType.includes('svg')) ext = '.svg';
    else if (contentType.includes('png')) ext = '.png';
    else if (contentType.includes('jpeg')) ext = '.jpg';
    else if (contentType.includes('webp')) ext = '.webp';
    else if (contentType.includes('gif')) ext = '.gif';
    else if (contentType.includes('font/woff2')) ext = '.woff2';
    else ext = '.bin';
  }
  const host = u.hostname.replace(/^www\./,'');
  const hash = crypto.createHash('sha1').update(urlStr).digest('hex').slice(0,8);
  const baseRaw = path.basename(u.pathname) || 'asset';
  const base = sanitizeSegment(baseRaw.replace(path.extname(baseRaw), ''));
  const folder = contentType.includes('css') || ext === '.css' ? 'css' : contentType.includes('javascript') || ext === '.js' ? 'js' : contentType.startsWith('image/') || ['.svg','.png','.jpg','.jpeg','.webp','.gif','.ico'].includes(ext.toLowerCase()) ? 'images' : contentType.includes('font') || ['.woff','.woff2','.ttf','.otf'].includes(ext.toLowerCase()) ? 'fonts' : 'media';
  const rel = path.posix.join('assets', folder, host, `${base}-${hash}${ext}`);
  assetMap.set(urlStr, rel);
  return rel;
}
function isSameSite(u){ return u.hostname === rootUrl.hostname || u.hostname === 'www.' + rootUrl.hostname || 'www.' + u.hostname === rootUrl.hostname; }
function absolute(raw, base){ try { if (!raw || raw.startsWith('data:') || raw.startsWith('mailto:') || raw.startsWith('tel:') || raw.startsWith('#')) return null; return new URL(raw, base).href; } catch { return null; } }
function attrs(html, attr){ const out=[]; const re = new RegExp(`${attr}\\s*=\\s*(["'])(.*?)\\1`, 'gi'); let m; while((m=re.exec(html))) out.push(m[2]); return out; }
function srcsetUrls(value){ return value.split(',').map(x => x.trim().split(/\s+/)[0]).filter(Boolean); }
function cssUrls(text){ const out=[]; const re=/url\((?!['"]?data:)(['"]?)(.*?)\1\)/gi; let m; while((m=re.exec(text))) out.push(m[2]); return out; }
function relPath(fromFile, relAsset){ return path.relative(path.dirname(fromFile), path.join(outDir, relAsset)).replace(/\\/g,'/'); }
async function fetchBuf(url){ const res = await fetch(url, {redirect:'follow'}); if(!res.ok) throw new Error(`${res.status} ${res.statusText}`); const type = res.headers.get('content-type') || ''; return {buf: Buffer.from(await res.arrayBuffer()), type, finalUrl: res.url}; }
async function saveAsset(url, refererFile){
  if (assetMap.has(url)) return assetMap.get(url);
  try {
    const {buf,type} = await fetchBuf(url);
    const rel = assetFileFor(url,type);
    const file = path.join(outDir, rel);
    await ensureDir(path.dirname(file));
    let data = buf;
    if (type.includes('css')) {
      let css = buf.toString('utf8');
      for (const raw of cssUrls(css)) {
        const au = absolute(raw, url);
        if (!au) continue;
        const childRel = await saveAsset(au, file);
        const replacement = path.relative(path.dirname(file), path.join(outDir, childRel)).replace(/\\/g,'/');
        css = css.split(raw).join(replacement);
      }
      data = Buffer.from(css, 'utf8');
    }
    await fs.writeFile(file, data);
    console.log(`asset ${url} -> ${rel}`);
    return rel;
  } catch(e) { console.warn(`asset failed ${url}: ${e.message}`); return null; }
}
function discoverPages(html, base){
  for (const href of attrs(html,'href')) {
    const u = absolute(href, base);
    if (!u) continue;
    const parsed = new URL(u);
    parsed.hash = '';
    if (isSameSite(parsed) && !/\.(png|jpe?g|webp|gif|svg|css|js|pdf|zip|woff2?|ttf|otf)$/i.test(parsed.pathname) && !seenPages.has(parsed.href) && !queuedPages.includes(parsed.href)) queuedPages.push(parsed.href);
  }
}
async function processPage(url){
  const file = pageFileFor(url);
  const {buf,type,finalUrl} = await fetchBuf(url);
  let html = buf.toString('utf8');
  discoverPages(html, finalUrl);
  const assetCandidates = [];
  for (const a of attrs(html,'src')) assetCandidates.push(a);
  for (const a of attrs(html,'href')) if (/\.(css|ico|png|jpe?g|webp|gif|svg|woff2?|ttf|otf)(\?|$)/i.test(a)) assetCandidates.push(a);
  for (const a of attrs(html,'poster')) assetCandidates.push(a);
  for (const ss of attrs(html,'srcset')) for (const a of srcsetUrls(ss)) assetCandidates.push(a);
  for (const a of cssUrls(html)) assetCandidates.push(a);
  const unique = [...new Set(assetCandidates.map(a => absolute(a, finalUrl)).filter(Boolean))];
  for (const au of unique) {
    const rel = await saveAsset(au, file);
    if (rel) {
      const rp = relPath(file, rel);
      html = html.split(au).join(rp);
      const originalPath = new URL(au).pathname;
      html = html.split(originalPath).join(rp);
    }
  }
  await ensureDir(path.dirname(file));
  await fs.writeFile(file, html);
  console.log(`page ${url} -> ${path.relative(outDir,file)}`);
}
async function main() {
  await ensureDir(outDir);
  while (queuedPages.length && seenPages.size < maxPages) {
    const url = queuedPages.shift();
    if (seenPages.has(url)) continue;
    seenPages.add(url);
    try { await processPage(url); } catch(e) { console.warn(`page failed ${url}: ${e.message}`); }
  }
  await fs.writeFile(path.join(outDir,'scrape-manifest.json'), JSON.stringify({root:rootUrl.href,pages:[...seenPages],assets:[...assetMap.entries()].map(([url,rel])=>({url,rel}))}, null, 2));
  console.log(`done pages=${seenPages.size} assets=${assetMap.size} out=${outDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
