import type { APIRoute } from 'astro';

export const prerender = true;

const SITE_URL = 'https://mikeyshaw.work';

interface SitemapEntry {
	path: string;
	changefreq: 'weekly' | 'monthly';
	priority: string;
}

const ROUTES: SitemapEntry[] = [
	{ path: '/', changefreq: 'weekly', priority: '1.0' },
	{ path: '/fractional', changefreq: 'weekly', priority: '0.95' },
	{ path: '/starter-kit', changefreq: 'monthly', priority: '0.8' },
	{ path: '/assessment', changefreq: 'monthly', priority: '0.8' },
	{ path: '/fleet', changefreq: 'monthly', priority: '0.75' },
	{ path: '/resume', changefreq: 'monthly', priority: '0.75' },
];

export const GET: APIRoute = () => {
	const lastmod = new Date().toISOString().split('T')[0];

	const urls = ROUTES.map(
		({ path, changefreq, priority }) => `  <url>
    <loc>${new URL(path, SITE_URL).href}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
	).join('\n');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

	return new Response(xml, {
		status: 200,
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600',
		},
	});
};
