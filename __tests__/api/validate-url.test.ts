import axios from 'axios';
import { POST } from '@/app/api/validate-url/route';

// axiosをモック化
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('validate-url API', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // 環境変数をセットアップ
    process.env = { ...originalEnv };
    process.env.GOOGLE_SAFE_BROWSING_API_KEY = 'test-api-key';

    // axiosのモックをリセット
    jest.clearAllMocks();
  });

  afterEach(() => {
    // テスト後に環境変数を元に戻す
    process.env = originalEnv;
  });

  it('有効なURLの場合、成功レスポンスを返す', async () => {
    // Safe Browsing APIのモックレスポンス（脅威なし）
    mockedAxios.post.mockResolvedValueOnce({ data: { threatMatches: [] } });

    const request = new Request('http://localhost/api/validate-url', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://example.com' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ message: 'URLは有効です' });
  });

  it('無効なURLの場合、400エラーを返す', async () => {
    const request = new Request('http://localhost/api/validate-url', {
      method: 'POST',
      body: JSON.stringify({ url: 'invalid-url' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: '無効なURLです' });
  });

  it('Safe Browsing APIで脅威が検出された場合、400エラーを返す', async () => {
    // Safe Browsing APIのモックレスポンス（脅威あり）
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        threatMatches: [
          {
            threatType: 'MALWARE',
            platformType: 'ANY_PLATFORM',
            threat: { url: 'https://malicious-example.com' },
          },
        ],
      },
    });

    const request = new Request('http://localhost/api/validate-url', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://malicious-example.com' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: '入力されたURLは安全ではありません' });
  });

  it('APIキーが設定されていない場合、500エラーを返す', async () => {
    // APIキーを削除
    delete process.env.GOOGLE_SAFE_BROWSING_API_KEY;

    const request = new Request('http://localhost/api/validate-url', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://example.com' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'APIキーが設定されていません' });
  });
});
