# ハンズオン学習アプリ自動生成システム

## 概要
公式ドキュメントのURL入力から、サイトマップ解析・PDF変換を経て、選択したAIエンジンでハンズオン教材（例：TodoアプリのガイドやRFCに基づく実装手順）を自動生成するシステムです。

## 機能要件
- **URL入力・検証:** ユーザーが入力したURLの妥当性と安全性を確認
- **サイトマップ解析:**  
  - `fast-xml-parser` を用い、XMLサイトマップから全サブディレクトリ（ページURL）を抽出
- **PDF変換:**  
  - 静的なページコンテンツをPDF化（動的・インタラクティブ要素は除外）
  - PDFはユーザーがダウンロード可能
- **教材生成:**  
  - AIエンジン選択（{ 4o, claude 3.5 Sonnet, gemini2.0 }）  
  - ドキュメント種別に応じた教材生成  
    - **フレームワーク/ライブラリ:** アプリ名称、概要、バージョンに基づくステップバイステップガイド  
    - **RFC等:** 選択言語に応じた実装手順
- **ユーザー・履歴管理:**  
  - Supabase Auth（サブスクリプション対応）で認証  
  - 教材生成履歴や利用データを管理

## 非機能要件
- **技術スタック:**  
  - フロントエンド: Next.js v15 (AppRouter, Typescript), Mantine  
  - バックエンド: fast-xml-parser, PDF変換、AI教材生成  
  - データベース: Supabase  
  - デプロイ: Cloudflare Pages
- **セキュリティ:** URLサニタイズ、CSRF、レートリミット、Supabase Auth
- **設計:**  
  - Unix思想に基づいた小さなモジュール設計  
  - エラー時はHTTP 4XX/5XXで対応
- **ログ・モニタリング:** Sentryによる管理
- **スケーラビリティ:** 将来的な拡張を視野に入れた設計

## ユーザーインターフェースとフロー
- **ドキュメント種別分岐:**  
  - フレームワーク/ライブラリ: アプリ名称、概要、バージョン入力 → ハンズオンガイド生成  
  - RFC等: プログラミング言語選択 → 実装手順提示
- **PDFダウンロード:** 生成されたPDFをユーザーに提供
