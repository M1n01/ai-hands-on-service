function getUrlsFromSitemap(xmlText: string): string[] {
  const regex = /<loc>(.*?)<\/loc>/g;
  let match;
  const urls: string[] = [];
  while ((match = regex.exec(xmlText)) !== null) {
    urls.push(match[1]);
  }

  return urls;
}

function extractSubdirectoriesFromUrls(urls: string[], pathname: string): string[] {
  const subdirectories = new Set<string>();
  urls.forEach((u) => {
    try {
      const urlPathname = new URL(u).pathname;
      // urlPathname が pathname のサブディレクトリであるかを判定
      if (urlPathname.startsWith(pathname) && urlPathname !== pathname) {
        subdirectories.add(urlPathname);
      }
    } catch (error) {
      console.warn('Failed to parse URL:', u);
      return null;
    }
  });
  return Array.from(subdirectories);
}

export { getUrlsFromSitemap, extractSubdirectoriesFromUrls };
