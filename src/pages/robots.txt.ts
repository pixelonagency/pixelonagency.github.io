import type { APIRoute } from 'astro';
import { buildRobotsTxt } from '../lib/robots';

// Statik build sırasında dosyaya dönüşür: dist/robots.txt
export const GET: APIRoute = ({ site }) =>
  new Response(buildRobotsTxt(site?.toString() ?? 'https://pixelon.com.tr'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
