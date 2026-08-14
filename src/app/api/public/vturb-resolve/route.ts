import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Resolve um embed do VTurb/ConverteAI para o vídeo HLS + poster do CDN deles.
 *
 * Por quê: o player embutido (iframe) não deixa a gente controlar mudo/loop,
 * e mostra barra de progresso a cada repetição. Com a URL direta do main.m3u8
 * o app toca o vídeo com o PRÓPRIO <video> (mudo, loop perfeito, sem UI),
 * continuando a gastar a banda do CDN do VTurb — não a nossa.
 *
 * Segurança: só aceita URLs de hosts *.converteai.net / *.vturb.com (nada de
 * SSRF pra IP interno). Resultado fica em cache em memória por 12h — o embed
 * de um vídeo publicado não muda.
 */

type Resolved = { hls: string; poster?: string };
type Entry = { data: Resolved | null; ts: number };

const cache = new Map<string, Entry>();
const TTL_MS = 12 * 60 * 60 * 1000;
const MAX_CACHE = 500;

const ALLOWED_HOST = /(^|\.)converteai\.net$|(^|\.)vturb\.com$/i;

export async function GET(req: Request) {
  const target = new URL(req.url).searchParams.get('url')?.trim() ?? '';

  let host = '';
  try {
    const u = new URL(target);
    if (u.protocol !== 'https:') throw new Error('http');
    host = u.hostname;
  } catch {
    return NextResponse.json({ error: 'URL inválida.' }, { status: 400 });
  }
  if (!ALLOWED_HOST.test(host)) {
    return NextResponse.json({ error: 'Host não suportado.' }, { status: 400 });
  }

  const hit = cache.get(target);
  if (hit && Date.now() - hit.ts < TTL_MS) return respond(hit.data);

  let data: Resolved | null = null;
  try {
    const res = await fetch(target, {
      signal: AbortSignal.timeout(6000),
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; InfluencersLab/1.0)' },
    });
    if (res.ok) {
      const html = await res.text();
      const hls = html.match(/https:\/\/cdn\.converteai\.net\/[^"'\s\\<>]+\.m3u8/)?.[0];
      const poster =
        html.match(/https:\/\/cdn\.converteai\.net\/[^"'\s\\<>]+poster\.jpg/)?.[0] ??
        html.match(/https:\/\/images\.converteai\.net\/[^"'\s\\<>$]+(?:thumbnail|cover)\.jpg/)?.[0];
      if (hls) data = { hls, poster };
    }
  } catch {
    // rede/timeout → trata como não resolvido; o client cai pro iframe
  }

  if (cache.size >= MAX_CACHE) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(target, { data, ts: Date.now() });
  return respond(data);
}

function respond(data: Resolved | null) {
  if (!data) {
    return NextResponse.json({ error: 'Não foi possível resolver o vídeo.' }, { status: 404 });
  }
  return NextResponse.json(
    { data },
    { headers: { 'Cache-Control': 'public, max-age=43200' } },
  );
}
