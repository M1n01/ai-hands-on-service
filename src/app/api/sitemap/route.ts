import { NextResponse } from 'next/server';
import { getSubdirectoriesFromSitemap, isAllowedHost, isValidUrl } from '@/lib/sitemapParser';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (typeof url !== 'string' || !isValidUrl(url)) {
      throw new Error('無効なURLです');
    }
    const urlObj = new URL(url);
    if (!isAllowedHost(urlObj.hostname)) {
      throw new Error('アクセス禁止のホストです');
    }

    const subdirectories = await getSubdirectoriesFromSitemap(urlObj);
    return NextResponse.json({ subdirectories });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '不明なエラーが発生しました';
    return NextResponse.json(
      { message: `サーバーエラーが発生しました: ${message}` },
      { status: 500 }
    );
  }
}
