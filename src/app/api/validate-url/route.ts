import { NextResponse } from 'next/server';
import axios from 'axios';
import validator from 'validator';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;

    // URL形式チェック
    if (!validator.isURL(url)) {
      return NextResponse.json({ error: '無効なURLです' }, { status: 400 });
    }

    // Google Safe Browsing APIを使ってURLの安全性をチェック
    const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'APIキーが設定されていません' }, { status: 500 });
    }
    const safeBrowsingUrl = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;

    // API リクエスト用のリクエストボディ
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

    // Google Safe Browsing API へ POST リクエスト
    const safeResponse = await axios.post(safeBrowsingUrl, requestBody);
    const threatMatches = safeResponse.data.threatMatches;

    // 脅威が見つかった場合はエラーを返す
    if (threatMatches && threatMatches.length > 0) {
      return NextResponse.json({ error: '入力されたURLは安全ではありません' }, { status: 400 });
    }

    return NextResponse.json({ message: 'URLは有効です' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'サーバーエラーが発生しました。', err }, { status: 500 });
  }
}
