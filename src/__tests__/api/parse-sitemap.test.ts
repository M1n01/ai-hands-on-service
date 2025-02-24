import { POST } from '@/app/api/parse-sitemap/route';
import * as sitemapParser from '@/lib/sitemapParser';

jest.mock('@/lib/sitemapParser', () => ({
  isValidUrl: jest.fn(),
  isAllowedHost: jest.fn(),
  getSubdirectories: jest.fn(),
}));

// グローバルfetchのモック
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('parse-sitemap API', () => {
  beforeEach(() => {
    // 各テスト前にモックをリセット
    jest.clearAllMocks();
    process.env.GOOGLE_SAFE_BROWSING_API_KEY = 'test-api-key';
  });

  it('有効なURLとsitemapを正しく処理できること', async () => {
    const testUrl = 'https://example.com';
    const testSubdirectories = ['/path1', '/path2'];

    // モックの設定
    (sitemapParser.isValidUrl as jest.Mock).mockReturnValue(true);
    (sitemapParser.isAllowedHost as jest.Mock).mockReturnValue(true);
    (sitemapParser.getSubdirectories as jest.Mock).mockResolvedValue(testSubdirectories);
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ threatMatches: [] }),
    });

    const response = await POST(
      new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ url: testUrl }),
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      subdirectories: testSubdirectories,
      isSafe: true,
      message: 'URLは有効で安全です',
    });
  });

  it('無効なURLの場合はエラーを返すこと', async () => {
    (sitemapParser.isValidUrl as jest.Mock).mockReturnValue(false);

    const response = await POST(
      new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ url: 'invalid-url' }),
      })
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: '無効なURLです' });
  });

  it('許可されていないホストの場合はエラーを返すこと', async () => {
    (sitemapParser.isValidUrl as jest.Mock).mockReturnValue(true);
    (sitemapParser.isAllowedHost as jest.Mock).mockReturnValue(false);

    const response = await POST(
      new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ url: 'http://localhost' }),
      })
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'アクセス禁止のホストです' });
  });

  it('Safe Browsing APIで危険と判定されたURLの場合はエラーを返すこと', async () => {
    (sitemapParser.isValidUrl as jest.Mock).mockReturnValue(true);
    (sitemapParser.isAllowedHost as jest.Mock).mockReturnValue(true);
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ threatMatches: [{ threatType: 'MALWARE' }] }),
    });

    const response = await POST(
      new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ url: 'http://example.com' }),
      })
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: '入力されたURLは安全ではありません' });
  });

  it('sitemapの取得に失敗した場合はエラーを返すこと', async () => {
    (sitemapParser.isValidUrl as jest.Mock).mockReturnValue(true);
    (sitemapParser.isAllowedHost as jest.Mock).mockReturnValue(true);
    (sitemapParser.getSubdirectories as jest.Mock).mockRejectedValue(
      new Error('サイトマップの取得に失敗')
    );
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ threatMatches: [] }),
    });

    const response = await POST(
      new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ url: 'http://example.com' }),
      })
    );
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('サーバーエラーが発生しました');
  });
});
