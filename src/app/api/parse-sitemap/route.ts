import { NextResponse } from 'next/server';
import { getSubdirectories, isAllowedHost, isValidUrl } from '@/lib/sitemapParser';

export const runtime = 'edge';

async function checkUrlSafety(url: string, apiKey: string | undefined) {
  if (!apiKey) {
    return { isSafe: true }; // APIキーがない場合は安全とみなす
  }

  const safeBrowsingUrl = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;
  const requestBody = {
    client: {
      clientId: 'nextjs-secure-url-checker',
      clientVersion: '1.0.0',
    },
    threatInfo: {
      threatTypes: [
        'MALWARE',
        'SOCIAL_ENGINEERING',
        'UNWANTED_SOFTWARE',
        'THREAT_TYPE_UNSPECIFIED',
        'POTENTIALLY_HARMFUL_APPLICATION',
      ],
      platformTypes: ['PLATFORM_TYPE_UNSPECIFIED', 'ANY_PLATFORM'],
      threatEntryTypes: ['URL'],
      threatEntries: [{ url }],
    },
  };

  try {
    const response = await fetch(safeBrowsingUrl, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
    const data = await response.json();
    return { isSafe: !data.threatMatches || data.threatMatches.length === 0 };
  } catch (error) {
    console.error('Safe Browsing API error:', error);
    return { isSafe: true }; // エラー時は安全とみなす
  }
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (typeof url !== 'string' || !isValidUrl(url)) {
      return NextResponse.json({ error: '無効なURLです' }, { status: 400 });
    }

    const urlObj = new URL(url);
    if (!isAllowedHost(urlObj.hostname)) {
      return NextResponse.json({ error: 'アクセス禁止のホストです' }, { status: 400 });
    }

    // 並列で処理を実行
    const [subdirectories, safetyCheck] = await Promise.all([
      getSubdirectories(urlObj),
      checkUrlSafety(url, process.env.GOOGLE_SAFE_BROWSING_API_KEY),
    ]);

    if (!safetyCheck.isSafe) {
      return NextResponse.json({ error: '入力されたURLは安全ではありません' }, { status: 400 });
    }

    return NextResponse.json({
      subdirectories,
      isSafe: true,
      message: 'URLは有効で安全です',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '不明なエラーが発生しました';
    return NextResponse.json(
      { error: `サーバーエラーが発生しました: ${message}` },
      { status: 500 }
    );
  }
}
