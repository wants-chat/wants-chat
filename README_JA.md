<div align="center">
  <a href="https://wants.chat">
    <img src="frontend/public/assets/logo.png" alt="WantsChat" width="80">
  </a>

  # WantsChat

  [![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-wants.chat-00D4AA?style=for-the-badge)](https://wants.chat)
  [![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue?style=for-the-badge)](LICENSE)
  [![GitHub Stars](https://img.shields.io/github/stars/wants-chat/wants-chat?style=for-the-badge)](https://github.com/wants-chat/wants-chat/stargazers)
  [![GitHub Forks](https://img.shields.io/github/forks/wants-chat/wants-chat?style=for-the-badge)](https://github.com/wants-chat/wants-chat/network/members)
  [![Contributors](https://img.shields.io/github/contributors/wants-chat/wants-chat?style=for-the-badge)](https://github.com/wants-chat/wants-chat/graphs/contributors)

  **ただチャットするだけじゃない。必要なものを作ろう。**

  *WantsChatは、あなたのアイデア、タスク、用事すべてが片付く場所 — ひとつの親しみやすい場所で、ひとつのシンプルなお願いで。*

  <p>
    <a href="./README.md">English</a> |
    <a href="./README_JA.md">日本語</a> |
    <a href="./README_ZH.md">中文</a> |
    <a href="./README_KO.md">한국어</a> |
    <a href="./README_ES.md">Español</a> |
    <a href="./README_FR.md">Français</a> |
    <a href="./README_DE.md">Deutsch</a> |
    <a href="./README_PT-BR.md">Português</a> |
    <a href="./README_RU.md">Русский</a> |
    <a href="./README_AR.md">العربية</a> |
    <a href="./README_IT.md">Italiano</a> |
    <a href="./README_HI.md">हिन्दी</a> |
    <a href="./README_TR.md">Türkçe</a> |
    <a href="./README_ID.md">Bahasa Indonesia</a> |
    <a href="./README_VI.md">Tiếng Việt</a> |
    <a href="./README_NL.md">Nederlands</a> |
    <a href="./README_UK.md">Українська</a>
  </p>
  <img src="docs/images/banner.png" alt="WantsChat — intent-driven AI platform" width="100%" />


</div>

---

## 🎯 WantsChatとは?

**WantsChat** は、あなたが望むことを理解し、それを達成するための適切なツール、アプリ、または自動化を即座に提供する革新的なAI駆動プラットフォームです。テキストでしか応答しない従来のチャットボットとは異なり、WantsChatはあなたの意図を検出し、ニーズに合わせた**コンテキスト型ユーザーインターフェース**を表示します。

```
💬 あなた:「500 USDをEURに変換したい」
✨ WantsChat: ライブレート付きの美しい通貨コンバーターUIを即座に表示

💬 あなた:「スタートアップのロゴを生成したい」
✨ WantsChat: ロゴテンプレートが事前に読み込まれたAI画像ジェネレーターを開く

💬 あなた:「プロジェクトの経費を追跡したい」
✨ WantsChat: あなたの通貨、カテゴリー、エクスポートオプションを備えた経費トラッカーを表示
```

### 🚀 私たちが解決する課題

2025年、平均的なナレッジワーカーは毎日**50以上の異なるアプリ**を使用しています:
- 計算機、コンバーター、ジェネレーター
- プロジェクト管理ツール
- デザインソフトウェア
- 財務トラッカー
- 健康アプリ
- そしてさらに数十個...

**WantsChatはそれら全てをひとつのインテリジェントなプラットフォームに統合します。**

---

## 🚀 このプロジェクトが重要な理由

私たちはAIは話すだけでなく、**実行する**べきだと信じています。

---

## 🏆 WantsChatをユニークにしているもの

<table>
<tr>
<td width="50%">

### ❌ 従来のAIチャットボット
- テキスト応答のみを生成
- 静的な会話インターフェース
- コンテキストツールなし
- アプリを構築できない
- 単一目的の設計

</td>
<td width="50%">

### ✅ WantsChat
- **意図検出** → 関連するUIを表示
- **1,100以上のコンテキストツール** → すぐに使える
- **ノーコードアプリビルダー** → フルスタックアプリ
- **ワークフロー自動化** → n8nスタイルのフロー
- **マルチモデルAI** → 8プロバイダーから30以上のモデル

</td>
</tr>
</table>

### 🎯 イノベーション: 意図 → コンテキストUI

```
┌─────────────────────────────────────────────────────────────────┐
│                  従来のチャットボット                            │
├─────────────────────────────────────────────────────────────────┤
│   ユーザー:「BMIを計算して」                                     │
│   ボット:「BMIを計算するには、体重を身長の二乗で割って...」      │
│   ユーザー: [まだ計算機を探す必要がある]                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        WantsChat                                │
├─────────────────────────────────────────────────────────────────┤
│   ユーザー:「BMIを計算して」                                     │
│                                                                 │
│   ┌─────────────────────────────────────┐                       │
│   │  BMI Calculator                     │                       │
│   │  ─────────────────────────          │                       │
│   │  身長: [175] cm                      │                       │
│   │  体重: [70] kg                       │                       │
│   │                                     │                       │
│   │  あなたのBMI: 22.9 (標準)            │                       │
│   │  ▓▓▓▓▓▓▓▓▓░░░░░░░░░░░               │                       │
│   │                                     │                       │
│   │  [PDFエクスポート] [履歴を追跡]       │                       │
│   └─────────────────────────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🌟 コア機能

### 1️⃣ **1,100以上のコンテキストツール**(毎日増加中)

<div align="center">
  <img src="docs/images/tools-panel.png" alt="WantsChat tools panel — 1,102 tools across 20+ categories" width="100%" />
</div>

<details>
<summary><b>📊 計算機とコンバーター (80+)</b></summary>

- Currency Converter (150以上の通貨、ライブレート)
- BMI Calculator
- Loan Calculator
- Compound Interest
- Unit Converters (長さ、重さ、温度など)
- Date Calculator
- Percentage Calculator
- Mortgage Calculator
- Tip Calculator
- Age Calculator
- Time Zone Converter
- そしてさらに70以上...
</details>

<details>
<summary><b>✍️ AIライティングツール (50+)</b></summary>

- Blog Post Generator
- Email Composer
- Cover Letter Writer
- Resume Builder
- Social Media Post Generator
- Product Description Writer
- SEO Meta Tag Generator
- Press Release Generator
- Speech Writer
- Story Generator
- そしてさらに40以上...
</details>

<details>
<summary><b>🎨 AIクリエイティブツール (40+)</b></summary>

- AI Image Generator (FLUX, SDXL)
- AI Logo Generator
- AI Video Generator
- Background Remover
- Image Upscaler
- Photo Enhancer
- Meme Generator
- Avatar Generator
- Banner Designer
- Icon Generator
- そしてさらに30以上...
</details>

<details>
<summary><b>💼 ビジネスツール (100+)</b></summary>

- Invoice Generator
- Contract Generator
- Proposal Builder
- Business Plan Writer
- Meeting Notes
- Project Timeline
- Kanban Board
- Quote Builder
- Expense Tracker
- Time Tracker
- そしてさらに90以上...
</details>

<details>
<summary><b>⚖️ リーガルツール (25+)</b></summary>

- Case Intake
- Client Agreement
- Court Calendar
- Deposition Scheduler
- Document Review
- Matter Management
- Time Entry (UTBMS/LEDES)
- Trust Account
- Conflict Check
- Witness List
- Legal Research
- Pleading Drafter
- その他...
</details>

<details>
<summary><b>🏥 ヘルスケアツール (30+)</b></summary>

- Patient Intake
- Medical History
- Lab Results Tracker
- Medication Reminder
- Insurance Verification
- Clinical Notes
- Surgery Scheduler
- Telehealth Scheduler
- HIPAA Compliance
- その他...
</details>

<details>
<summary><b>🏠 不動産ツール (30+)</b></summary>

- Property Listing
- Rental Application
- Lease Agreement
- Mortgage Pre-Qualification
- Home Valuation
- Open House Scheduler
- Rent Roll
- Security Deposit Tracker
- Property Inspection
- その他...
</details>

<details>
<summary><b>🍽️ レストランとホスピタリティ (20+)</b></summary>

- Table Management
- Waitlist Manager
- Kitchen Display
- Menu Engineering
- Recipe Costing
- Food Cost Calculator
- Temperature Log
- Tip Pool Calculator
- その他...
</details>

<details>
<summary><b>🏭 製造とロジスティクス (20+)</b></summary>

- BOM Manager
- Quality Inspection
- Machine Maintenance
- Production Scheduler
- Inventory Manager
- Fleet Manager
- Shipment Tracker
- その他...
</details>

<details>
<summary><b>🏫 教育と保育 (15+)</b></summary>

- Student Database
- Gradebook
- Lesson Planner
- Daily Report (Daycare)
- Child Profile
- Incident Report
- Tuition Tracker
- その他...
</details>

### 2️⃣ **ノーコードアプリビルダー**

<div align="center">
  <img src="docs/images/app-builder.png" alt="WantsChat generating a full app spec from a single prompt" width="100%" />
</div>

コードを書かずに完全なフルスタックアプリケーションを構築:

- **フロントエンド**: TailwindCSSを使ったReactコンポーネント
- **バックエンド**: PostgreSQLを使ったHono.js API
- **デプロイ**: ワンクリックデプロイ

```
📱 構築できるもの:
├── カスタマーポータル
├── 内部ダッシュボード
├── Eコマースストア
├── 予約システム
├── CRMアプリケーション
├── 在庫管理
└── そして文字通り想像できるあらゆるアプリ
```

### 3️⃣ **マルチモデルAIエンジン**

30以上のAIモデルから選択:

| プロバイダー | モデル |
|----------|--------|
| **OpenAI** | GPT-4o, GPT-4o Mini |
| **Anthropic** | Claude Opus 4.5, Claude Sonnet 4.5, Claude Haiku 4.5 |
| **Google** | Gemini 2.5 Pro, Gemini 2.5 Flash |
| **DeepSeek** | DeepSeek V3, DeepSeek R1 |
| **Meta** | Llama 3.3 70B |
| **画像 AI** | FLUX, SDXL, Juggernaut |
| **動画 AI** | Vidu, KlingAI, ByteDance |

### 4️⃣ **ワークフロー自動化** (FluxTurn統合)

n8n/Zapierのようなビジュアルワークフロービルダー:

- **500以上のコネクタ**: Google, Slack, GitHub, Notion, Salesforceなど
- **AIノード**: ワークフロー内でGPT、Claude、画像生成
- **トリガー**: Webhook、スケジュール、イベント
- **セルフホスト可能**: あなた自身のインフラで実行

### 5️⃣ **スマートコンテキストシステム**

あなたのデータが自動的に事前入力:

```
┌─────────────────────────────────────────────────────────────┐
│                 コンテキストの3つの柱                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. オンボーディングデータ                                    │
│     通貨、タイムゾーン、言語、業界の好み                       │
│                                                             │
│  2. コンテキストUI履歴                                       │
│     各ツールの最後の入力を記憶                                │
│                                                             │
│  3. チャットインテリジェンス                                  │
│     会話からエンティティを抽出                                │
│     「予算 $5000」→ 予算計算機に事前入力                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6️⃣ **すべてをエクスポート**

すべてのツールが包括的なエクスポートをサポート:

- 📄 **PDF** - プロフェッショナルなドキュメント
- 📊 **Excel** - フォーマット付きスプレッドシート
- 📋 **CSV** - 汎用データフォーマット
- 🔗 **JSON** - 開発者向け
- 🖨️ **印刷** - 最適化されたレイアウト

---

## 📊 競合分析

### WantsChatが置き換えるもの

_2025年12月時点の標準ティアの典型的な価格。実際の数値はプランやシート数によって異なります。_

<table>
<tr><th>カテゴリー</th><th>置き換えるアプリ</th><th>年間節約額</th></tr>
<tr><td>AIアシスタント</td><td>ChatGPT Plus, Claude Pro, Gemini Advanced</td><td>$720/年</td></tr>
<tr><td>デザインツール</td><td>Canva Pro, Adobe Express, Figma</td><td>$360/年</td></tr>
<tr><td>ライティングツール</td><td>Jasper, Copy.ai, Writesonic</td><td>$1,000/年</td></tr>
<tr><td>プロジェクト管理</td><td>Monday, Asana, Notion</td><td>$360/年</td></tr>
<tr><td>自動化</td><td>Zapier, Make, n8n Cloud</td><td>$480/年</td></tr>
<tr><td>アプリ構築</td><td>Bubble, Webflow, Retool</td><td>$750/年</td></tr>
<tr><td><b>合計</b></td><td>18個のアプリ</td><td><b>年間 $3,670 節約</b></td></tr>
</table>

### 機能比較 (2025年12月)

| 機能 | ChatGPT | Claude | Poe | 1min.AI | Manus | **WantsChat** |
|---------|---------|--------|-----|---------|-------|----------------|
| マルチモデルAI | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ **30以上のモデル** |
| AI画像生成 | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ **FLUX + SDXL** |
| AI動画生成 | ✅ Sora | ❌ | ✅ | ✅ | ❌ | ✅ **3エンジン** |
| コンテキストUIツール | ❌ | Artifacts | ❌ | ❌ | ❌ | ✅ **1,100以上のツール** |
| ノーコードアプリビルダー | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ **フルスタック** |
| ワークフロー自動化 | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ **500以上のコネクタ** |
| ブラウザ拡張機能 | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ **Chrome/Firefox** |
| セルフホスティング | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ **Docker対応** |

---

## 🔮 ロードマップ

### ✅ 実装済み

- [x] 1,100以上のコンテキストUIツール
- [x] マルチモデルAIチャット (30以上のモデル)
- [x] AI画像生成 (FLUX, SDXL)
- [x] AI動画生成 (Vidu, KlingAI)
- [x] ツールデータのバックエンド同期
- [x] エクスポート (PDF, Excel, CSV, JSON)
- [x] ユーザーオンボーディングフロー
- [x] ブラウザ拡張機能 (Chrome/Firefox)
- [x] 組織/チームサポート
- [x] ツールのベクトル検索 (Qdrant)
- [x] ダーク/ライトテーマ

### 🚧 進行中

- [ ] ワークフロー自動化 (FluxTurn)
- [ ] URL検出 + 自動要約
- [ ] スクリーンショットとページ分析
- [ ] リサーチモード (深層ウェブ検索)
- [ ] ノーコードアプリビルダー v2
- [ ] チャットボットデプロイ (WhatsApp, LINE, Telegram)

### 📋 計画中

- [ ] APIマーケットプレイス
- [ ] プラグインシステム
- [ ] リアルタイムコラボレーション
- [ ] AIエージェント (自律タスク)
- [ ] 音声インターフェース
- [ ] MCP統合

---

## 🛠️ 技術スタック

### フロントエンド
- **React 18** + TypeScript
- **Vite** ビルドツール
- **TailwindCSS** + shadcn/ui
- **Framer Motion** アニメーション用
- **TanStack Query** データ取得用
- **i18next** 国際化用

### バックエンド
- **NestJS** (Node.jsフレームワーク)
- **PostgreSQL** データベース (生の `pg` ドライバー)
- **Qdrant** ベクトルデータベース (オプション)
- **Redis** (BullMQキュー経由)
- **Socket.io** リアルタイム通信用
- **Swagger/OpenAPI** APIドキュメント用

### ブラウザ拡張機能
- **Vite** + **TypeScript**
- **Manifest V3** (Chrome, Edge, Firefox)
- ソースレベルのインポートでウェブアプリとReactコンポーネントを共有

### AI/ML
- **OpenRouter** 統合LLMゲートウェイ (30以上のモデル)
- **Runware** 画像生成用
- **OpenAI Embeddings** セマンティック検索用

### インフラストラクチャ
- **Docker** + Docker Compose
- **Cloudflare R2** ストレージ
- 任意のクラウドプロバイダーでセルフホスト可能

---

## 🚀 はじめに

最速のパス:

```bash
git clone https://github.com/wants-chat/wants-chat.git
cd wants-chat
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker compose up
```

その後、`http://localhost:5173` を開きます。

前提条件、環境変数、Dockerなしのパス、オプション機能、トラブルシューティングについては、コントリビューターオンボーディングの正規ガイドである **[`DEVELOPMENT.md`](DEVELOPMENT.md)** を参照してください。

---

## 🧩 ブラウザ拡張機能

Manifest V3ブラウザ拡張機能が [`extension/`](extension/) にあり、WantsChatをあらゆるタブに持ち込みます — ハイライトされたテキストでツールを呼び出し、スニペットを保存し、ページを離れずにチャットできます。

```bash
cd extension
npm install
npm run build
# その後、Chrome/Edge/Firefoxで extension/dist を展開された拡張機能としてロード
```

---

## 🤝 コントリビューション

コントリビューションを歓迎します! [コントリビューションガイド](CONTRIBUTING.md)と[行動規範](CODE_OF_CONDUCT.md)から始めてください。

- **[CONTRIBUTING.md](CONTRIBUTING.md)** — 変更の提案、ブランチ、PRのオープン方法
- **[DEVELOPMENT.md](DEVELOPMENT.md)** — ローカルセットアップとコントリビューターオンボーディング
- **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)** — コミュニティ基準
- **[SECURITY.md](SECURITY.md)** — 脆弱性の報告方法
- **[CHANGELOG.md](CHANGELOG.md)** — リリースノートとバージョン履歴

---

## コントリビューター

WantsChatに貢献してくださった素晴らしい皆さんに感謝します! 🎉

<a href="https://github.com/wants-chat/wants-chat/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=wants-chat/wants-chat&anon=1&max=100&columns=10" />
</a>

ここにあなたの顔を見たいですか? [コントリビューションガイド](CONTRIBUTING.md)をチェックして、今日からコントリビューションを始めましょう!

---

## 📄 ライセンス

このプロジェクトは **AGPL-3.0 License** の下でライセンスされています — 詳細は [LICENSE](LICENSE) ファイルを参照してください。

これは、このソフトウェアを自由に使用、変更、配布できることを意味しますが、変更も同じライセンスの下でオープンソース化する必要があります。

---

## 🙏 謝辞

- [OpenRouter](https://openrouter.ai) - LLM APIゲートウェイ
- [Runware](https://runware.ai) - 画像生成API
- [Qdrant](https://qdrant.tech) - ベクトルデータベース
- [shadcn/ui](https://ui.shadcn.com) - UIコンポーネント

---

<div align="center">

### 💬 つながりましょう

[![Website](https://img.shields.io/badge/Website-wants.chat-00D4AA?style=for-the-badge)](https://wants.chat)
[![X](https://img.shields.io/badge/X-@infoinletcom-000000?style=for-the-badge&logo=x)](https://x.com/infoinletcom)
[![Discord](https://img.shields.io/badge/Discord-Join_Community-5865F2?style=for-the-badge&logo=discord)](https://discord.com/invite/wantschat)
[![Email](https://img.shields.io/badge/Email-support@wants.chat-EA4335?style=for-the-badge&logo=gmail)](mailto:support@wants.chat)

---

**WantsChat コミュニティによって ❤️ で構築**

*このプロジェクトが役立つと思われた方は、ぜひスターを付けていただけますと幸いです!*

</div>
