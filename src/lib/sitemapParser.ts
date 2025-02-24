import { XMLParser } from 'fast-xml-parser';

/**
 * 入力された文字列が有効なURLかどうかを検証する
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * 内部ネットワークなど不正なホストへのアクセスを防ぐため、許可するホストかどうかを検証する
 */
export function isAllowedHost(hostname: string): boolean {
  const forbiddenHosts = ['localhost', '127.0.0.1'];
  return !forbiddenHosts.includes(hostname);
}

/**
 * 指定された入力URLのドメインから sitemap.xml を取得し、
 * サブディレクトリ一覧（第一階層のみ）を抽出する
 */
export async function getSubdirectories(urlObj: URL): Promise<string[]> {
  // sitemap.xml の URL を構築
  const sitemapUrl = `${urlObj.protocol}//${urlObj.hostname}/sitemap.xml`;

  // タイムアウト付きのフェッチ（AbortController 使用）
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000); // 5秒タイムアウト

  let response;
  try {
    response = await fetch(sitemapUrl, { signal: controller.signal });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '不明なエラーが発生しました';
    throw new Error(`sitemapの取得に失敗しました: ${message}`);
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`sitemapの取得に失敗しました: HTTP ${response.status}`);
  }

  // レスポンスが XML であることを確認
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('xml')) {
    throw new Error('sitemapのコンテンツタイプが無効です');
  }

  const xmlData = await response.text();

  // XMLパースの設定
  const parser = new XMLParser({
    ignoreAttributes: true,
    isArray: (tagName) => tagName === 'url' || tagName === 'loc',
  });

  // 安全な XML パース
  let parsed;
  try {
    parsed = parser.parse(xmlData);
  } catch (err) {
    throw new Error('sitemap XML のパースに失敗しました');
  }

  // サブディレクトリ抽出：<urlset><url><loc>...</loc></url></urlset> を前提とする
  const subdirectories = new Set<string>();
  if (parsed.urlset && parsed.urlset.url) {
    const urls = parsed.urlset.url;
    urls.forEach((urlEntry: any) => {
      try {
        const loc = urlEntry.loc[0]; // fast-xml-parserではarrayModeを使用するため配列となる
        if (typeof loc === 'string') {
          const locUrl = new URL(loc);
          if (locUrl.pathname.startsWith(urlObj.pathname) && locUrl.pathname !== urlObj.pathname) {
            subdirectories.add(locUrl.pathname);
          }
        }
      } catch {
        // 無効な loc はスキップ
      }
    });
  }
  return Array.from(subdirectories);
}
