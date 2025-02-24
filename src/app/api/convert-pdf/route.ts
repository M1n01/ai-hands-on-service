import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(request: Request) {
  try {
    const { urls } = await request.json();
    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'URLリストが必要です' }, { status: 400 });
    }

    const browser = await puppeteer.launch({ headless: true });
    const pdfs: Buffer[] = [];

    try {
      for (const url of urls) {
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle0' });
        const pdf = await page.pdf({ format: 'A4' });
        pdfs.push(Buffer.from(pdf));
        await page.close();
      }
    } finally {
      await browser.close();
    }

    // PDFをマージする処理は後ほど実装
    const combinedPdf = Buffer.concat(pdfs);

    return new NextResponse(combinedPdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=combined.pdf',
      },
    });
  } catch (error) {
    console.error('PDF生成エラー:', error);
    return NextResponse.json({ error: '予期せぬエラーが発生しました' }, { status: 500 });
  }
}
