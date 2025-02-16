import { NextResponse } from 'next/server';
import { extractSubdirectoriesFromUrls, getUrlsFromSitemap } from '@/lib/url';

// URL のバリデーション
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch (error) {
    return false;
  }
}

/**
 * 指定されたURLのドメインのsitemap.xmlを取得し、
 * 各URLからサブディレクトリを抽出する
 * @param url
 * @returns
 */
async function fetchSitemapSubdirectories(url: string): Promise<string[]> {
  try {
    const { origin, pathname } = new URL(url);
    const sitemapUrl = `${origin}/sitemap.xml`;
    console.log('Sitemap:', origin, pathname, sitemapUrl);

    const res = await fetch(sitemapUrl);
    if (!res.ok) {
      console.warn('Failed to fetch sitemap:', res.statusText);
      return [];
    }
    const xmlText = await res.text();

    const urls: string[] = getUrlsFromSitemap(xmlText);

    const subdirectories = extractSubdirectoriesFromUrls(urls, pathname);
    return subdirectories;
  } catch (error) {
    console.error('Error fetching sitemap:', error);
    return [];
  }
}

// ダミー実装：入力された URL から PDF を生成する
async function generatePDF(url: string): Promise<Buffer> {
  const subdirectories = await fetchSitemapSubdirectories(url);

  // 本来はヘッドレスブラウザ等を利用した HTML → PDF 変換を実施
  const dummyContent = `PDF content generated from ${url}\nSubdirectories: ${subdirectories.join(', ')}`;
  return Buffer.from(dummyContent);
}

// ダミー実装：PDF からハンズオン教材を生成する
async function generateTutorial(pdfBuffer: Buffer): Promise<string> {
  const pdfContent = pdfBuffer.toString();
  return `ハンズオン教材: ${pdfContent}`;
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (!url || !isValidUrl(url)) {
      return NextResponse.json({ message: '無効なURLです' }, { status: 400 });
    }

    const pdfBuffer = await generatePDF(url);
    const tutorial = await generateTutorial(pdfBuffer);
    return NextResponse.json({ tutorial });
  } catch (error: any) {
    console.error('Error in /api/generate:', error);
    return NextResponse.json({ message: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
