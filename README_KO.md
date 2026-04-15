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

  **그냥 채팅하지 마세요. 필요한 것을 만드세요.**

  *WantsChat은 당신의 아이디어, 작업, 심부름이 모두 처리되는 곳 — 친근한 한 곳에서, 단 하나의 간단한 요청으로.*

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

</div>

---

## 🎯 WantsChat이란?

**WantsChat**은 당신이 원하는 것을 이해하고 즉시 적합한 도구, 앱 또는 자동화를 제공하여 작업을 완료할 수 있게 하는 혁신적인 AI 기반 플랫폼입니다. 텍스트로만 응답하는 기존 챗봇과 달리, WantsChat은 당신의 의도를 감지하고 정확한 요구에 맞춘 **컨텍스트 사용자 인터페이스**를 렌더링합니다.

```
💬 당신: "I want to convert 500 USD to EUR"
✨ WantsChat: 실시간 환율이 포함된 아름다운 통화 변환기 UI를 즉시 표시

💬 당신: "I want to generate a logo for my startup"
✨ WantsChat: 로고 템플릿이 미리 로드된 AI 이미지 생성기 열기

💬 당신: "I want to track my project expenses"
✨ WantsChat: 통화, 카테고리 및 내보내기 옵션을 갖춘 비용 추적기 표시
```

### 🚀 우리가 해결하는 문제

2025년, 평균적인 지식 노동자는 매일 **50개 이상의 다른 앱**을 사용합니다:
- 계산기, 변환기, 생성기
- 프로젝트 관리 도구
- 디자인 소프트웨어
- 재무 추적기
- 건강 앱
- 그리고 수십 개 더...

**WantsChat은 이 모든 것을 하나의 지능적인 플랫폼으로 통합합니다.**

---

## 🚀 이 프로젝트가 중요한 이유

우리는 AI가 단지 말하는 것이 아니라 **행동해야** 한다고 믿습니다.

---

## 🏆 WantsChat을 독특하게 만드는 것

<table>
<tr>
<td width="50%">

### ❌ 기존 AI 챗봇
- 텍스트 응답만 생성
- 정적 대화 인터페이스
- 컨텍스트 도구 없음
- 앱을 만들 수 없음
- 단일 목적 디자인

</td>
<td width="50%">

### ✅ WantsChat
- **의도 감지** → 관련 UI 표시
- **1,100개 이상의 컨텍스트 도구** → 즉시 사용 가능
- **노코드 앱 빌더** → 풀스택 앱
- **워크플로우 자동화** → n8n 스타일 플로우
- **다중 모델 AI** → 8개 공급자에서 30개 이상의 모델

</td>
</tr>
</table>

### 🎯 혁신: 의도 → 컨텍스트 UI

```
┌─────────────────────────────────────────────────────────────────┐
│                     기존 챗봇                                   │
├─────────────────────────────────────────────────────────────────┤
│   사용자: "Calculate my BMI"                                    │
│   봇: "BMI를 계산하려면 체중을 키의 제곱으로 나누세요..."       │
│   사용자: [여전히 계산기를 찾아야 함]                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        WantsChat                                │
├─────────────────────────────────────────────────────────────────┤
│   사용자: "Calculate my BMI"                                    │
│                                                                 │
│   ┌─────────────────────────────────────┐                       │
│   │  BMI Calculator                     │                       │
│   │  ─────────────────────────          │                       │
│   │  키: [175] cm                        │                       │
│   │  체중: [70] kg                       │                       │
│   │                                     │                       │
│   │  당신의 BMI: 22.9 (정상)             │                       │
│   │  ▓▓▓▓▓▓▓▓▓░░░░░░░░░░░               │                       │
│   │                                     │                       │
│   │  [PDF 내보내기] [기록 추적]           │                       │
│   └─────────────────────────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🌟 핵심 기능

### 1️⃣ **1,100개 이상의 컨텍스트 도구** (매일 증가 중)

<details>
<summary><b>📊 계산기 및 변환기 (80+)</b></summary>

- Currency Converter (150개 이상의 통화, 실시간 환율)
- BMI Calculator
- Loan Calculator
- Compound Interest
- Unit Converters (길이, 무게, 온도 등)
- Date Calculator
- Percentage Calculator
- Mortgage Calculator
- Tip Calculator
- Age Calculator
- Time Zone Converter
- 그리고 70개 이상 더...
</details>

<details>
<summary><b>✍️ AI 글쓰기 도구 (50+)</b></summary>

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
- 그리고 40개 이상 더...
</details>

<details>
<summary><b>🎨 AI 크리에이티브 도구 (40+)</b></summary>

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
- 그리고 30개 이상 더...
</details>

<details>
<summary><b>💼 비즈니스 도구 (100+)</b></summary>

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
- 그리고 90개 이상 더...
</details>

<details>
<summary><b>⚖️ 법률 도구 (25+)</b></summary>

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
- 더 많이...
</details>

<details>
<summary><b>🏥 의료 도구 (30+)</b></summary>

- Patient Intake
- Medical History
- Lab Results Tracker
- Medication Reminder
- Insurance Verification
- Clinical Notes
- Surgery Scheduler
- Telehealth Scheduler
- HIPAA Compliance
- 더 많이...
</details>

<details>
<summary><b>🏠 부동산 도구 (30+)</b></summary>

- Property Listing
- Rental Application
- Lease Agreement
- Mortgage Pre-Qualification
- Home Valuation
- Open House Scheduler
- Rent Roll
- Security Deposit Tracker
- Property Inspection
- 더 많이...
</details>

<details>
<summary><b>🍽️ 레스토랑 및 호스피탈리티 (20+)</b></summary>

- Table Management
- Waitlist Manager
- Kitchen Display
- Menu Engineering
- Recipe Costing
- Food Cost Calculator
- Temperature Log
- Tip Pool Calculator
- 더 많이...
</details>

<details>
<summary><b>🏭 제조 및 물류 (20+)</b></summary>

- BOM Manager
- Quality Inspection
- Machine Maintenance
- Production Scheduler
- Inventory Manager
- Fleet Manager
- Shipment Tracker
- 더 많이...
</details>

<details>
<summary><b>🏫 교육 및 보육 (15+)</b></summary>

- Student Database
- Gradebook
- Lesson Planner
- Daily Report (Daycare)
- Child Profile
- Incident Report
- Tuition Tracker
- 더 많이...
</details>

### 2️⃣ **노코드 앱 빌더**

코드를 작성하지 않고 완전한 풀스택 애플리케이션을 구축:

- **프론트엔드**: TailwindCSS를 사용한 React 컴포넌트
- **백엔드**: PostgreSQL을 사용한 Hono.js API
- **배포**: 원클릭 배포

```
📱 만들 수 있는 것:
├── 고객 포털
├── 내부 대시보드
├── 전자상거래 스토어
├── 예약 시스템
├── CRM 애플리케이션
├── 재고 관리
└── 그리고 상상할 수 있는 모든 앱
```

### 3️⃣ **다중 모델 AI 엔진**

30개 이상의 AI 모델 중에서 선택:

| 공급자 | 모델 |
|----------|--------|
| **OpenAI** | GPT-4o, GPT-4o Mini |
| **Anthropic** | Claude Opus 4.5, Claude Sonnet 4.5, Claude Haiku 4.5 |
| **Google** | Gemini 2.5 Pro, Gemini 2.5 Flash |
| **DeepSeek** | DeepSeek V3, DeepSeek R1 |
| **Meta** | Llama 3.3 70B |
| **이미지 AI** | FLUX, SDXL, Juggernaut |
| **비디오 AI** | Vidu, KlingAI, ByteDance |

### 4️⃣ **워크플로우 자동화** (FluxTurn 통합)

n8n/Zapier와 같은 시각적 워크플로우 빌더:

- **500개 이상의 커넥터**: Google, Slack, GitHub, Notion, Salesforce 등
- **AI 노드**: 워크플로우에서 GPT, Claude, 이미지 생성
- **트리거**: 웹훅, 일정, 이벤트
- **자체 호스팅 가능**: 자체 인프라에서 실행

### 5️⃣ **스마트 컨텍스트 시스템**

자동으로 미리 채워지는 데이터:

```
┌─────────────────────────────────────────────────────────────┐
│                컨텍스트의 3가지 기둥                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 온보딩 데이터                                            │
│     통화, 시간대, 언어, 산업 선호도                           │
│                                                             │
│  2. 컨텍스트 UI 기록                                         │
│     각 도구에 대한 마지막 입력 기억                           │
│                                                             │
│  3. 채팅 인텔리전스                                          │
│     대화에서 엔티티 추출                                     │
│     "Budget $5000" → 예산 계산기에 미리 채움                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6️⃣ **모든 것을 내보내기**

모든 도구는 포괄적인 내보내기를 지원합니다:

- 📄 **PDF** - 전문 문서
- 📊 **Excel** - 형식이 지정된 스프레드시트
- 📋 **CSV** - 범용 데이터 형식
- 🔗 **JSON** - 개발자용
- 🖨️ **인쇄** - 최적화된 레이아웃

---

## 📊 경쟁 분석

### WantsChat이 대체하는 것

_2025년 12월 기준의 일반적인 표준 등급 가격; 실제 수치는 플랜 및 좌석 수에 따라 달라집니다._

<table>
<tr><th>카테고리</th><th>대체되는 앱</th><th>연간 절약</th></tr>
<tr><td>AI 어시스턴트</td><td>ChatGPT Plus, Claude Pro, Gemini Advanced</td><td>$720/년</td></tr>
<tr><td>디자인 도구</td><td>Canva Pro, Adobe Express, Figma</td><td>$360/년</td></tr>
<tr><td>글쓰기 도구</td><td>Jasper, Copy.ai, Writesonic</td><td>$1,000/년</td></tr>
<tr><td>프로젝트 관리</td><td>Monday, Asana, Notion</td><td>$360/년</td></tr>
<tr><td>자동화</td><td>Zapier, Make, n8n Cloud</td><td>$480/년</td></tr>
<tr><td>앱 빌딩</td><td>Bubble, Webflow, Retool</td><td>$750/년</td></tr>
<tr><td><b>합계</b></td><td>18개 앱</td><td><b>연간 $3,670 절약</b></td></tr>
</table>

### 기능 비교 (2025년 12월)

| 기능 | ChatGPT | Claude | Poe | 1min.AI | Manus | **WantsChat** |
|---------|---------|--------|-----|---------|-------|----------------|
| 다중 모델 AI | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ **30개 이상의 모델** |
| AI 이미지 생성 | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ **FLUX + SDXL** |
| AI 비디오 생성 | ✅ Sora | ❌ | ✅ | ✅ | ❌ | ✅ **3개 엔진** |
| 컨텍스트 UI 도구 | ❌ | Artifacts | ❌ | ❌ | ❌ | ✅ **1,100개 이상의 도구** |
| 노코드 앱 빌더 | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ **풀스택** |
| 워크플로우 자동화 | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ **500개 이상의 커넥터** |
| 브라우저 확장 | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ **Chrome/Firefox** |
| 자체 호스팅 | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ **Docker 준비 완료** |

---

## 🔮 로드맵

### ✅ 구현됨

- [x] 1,100개 이상의 컨텍스트 UI 도구
- [x] 다중 모델 AI 채팅 (30개 이상의 모델)
- [x] AI 이미지 생성 (FLUX, SDXL)
- [x] AI 비디오 생성 (Vidu, KlingAI)
- [x] 백엔드로의 도구 데이터 동기화
- [x] 내보내기 (PDF, Excel, CSV, JSON)
- [x] 사용자 온보딩 흐름
- [x] 브라우저 확장 (Chrome/Firefox)
- [x] 조직/팀 지원
- [x] 도구를 위한 벡터 검색 (Qdrant)
- [x] 다크/라이트 테마

### 🚧 진행 중

- [ ] 워크플로우 자동화 (FluxTurn)
- [ ] URL 감지 + 자동 요약
- [ ] 스크린샷 및 페이지 분석
- [ ] 리서치 모드 (심층 웹 검색)
- [ ] 노코드 앱 빌더 v2
- [ ] 챗봇 배포 (WhatsApp, LINE, Telegram)

### 📋 계획됨

- [ ] API 마켓플레이스
- [ ] 플러그인 시스템
- [ ] 실시간 협업
- [ ] AI 에이전트 (자율 작업)
- [ ] 음성 인터페이스
- [ ] MCP 통합

---

## 🛠️ 기술 스택

### 프론트엔드
- **React 18** + TypeScript
- **Vite** 빌드 도구
- **TailwindCSS** + shadcn/ui
- **Framer Motion** 애니메이션용
- **TanStack Query** 데이터 페칭용
- **i18next** 국제화용

### 백엔드
- **NestJS** (Node.js 프레임워크)
- **PostgreSQL** 데이터베이스 (원시 `pg` 드라이버)
- **Qdrant** 벡터 데이터베이스 (선택 사항)
- **Redis** (BullMQ 큐 경유)
- **Socket.io** 실시간 통신용
- **Swagger/OpenAPI** API 문서화용

### 브라우저 확장
- **Vite** + **TypeScript**
- **Manifest V3** (Chrome, Edge, Firefox)
- 소스 레벨 가져오기를 통해 웹 앱과 React 컴포넌트 공유

### AI/ML
- **OpenRouter** 통합 LLM 게이트웨이 (30개 이상의 모델)
- **Runware** 이미지 생성용
- **OpenAI Embeddings** 의미 검색용

### 인프라
- **Docker** + Docker Compose
- **Cloudflare R2** 스토리지
- 모든 클라우드 공급자에서 자체 호스팅 가능

---

## 🚀 시작하기

가장 빠른 경로:

```bash
git clone https://github.com/wants-chat/wants-chat.git
cd wants-chat
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker compose up
```

그런 다음 `http://localhost:5173`을 엽니다.

전제 조건, 환경 변수, Docker 없이 실행하는 방법, 선택적 기능 및 문제 해결에 대해서는 기여자 온보딩에 대한 정식 가이드인 **[`DEVELOPMENT.md`](DEVELOPMENT.md)**를 참조하세요.

---

## 🧩 브라우저 확장

Manifest V3 브라우저 확장이 [`extension/`](extension/)에 있으며, WantsChat을 모든 탭으로 가져옵니다 — 강조 표시된 텍스트에서 도구를 호출하고, 스니펫을 저장하고, 페이지를 떠나지 않고 채팅할 수 있습니다.

```bash
cd extension
npm install
npm run build
# 그런 다음 Chrome/Edge/Firefox에서 extension/dist를 압축되지 않은 확장으로 로드합니다
```

---

## 🤝 기여

기여를 환영합니다! [기여 가이드](CONTRIBUTING.md)와 [행동 강령](CODE_OF_CONDUCT.md)으로 시작하세요.

- **[CONTRIBUTING.md](CONTRIBUTING.md)** — 변경 사항 제안, 분기 및 PR 열기 방법
- **[DEVELOPMENT.md](DEVELOPMENT.md)** — 로컬 설정 및 기여자 온보딩
- **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)** — 커뮤니티 표준
- **[SECURITY.md](SECURITY.md)** — 취약점 보고 방법
- **[CHANGELOG.md](CHANGELOG.md)** — 릴리스 노트 및 버전 히스토리

---

## 기여자

WantsChat에 기여한 모든 멋진 분들에게 감사드립니다! 🎉

<a href="https://github.com/wants-chat/wants-chat/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=wants-chat/wants-chat&anon=1&max=100&columns=10" />
</a>

여기에서 자신의 얼굴을 보고 싶으신가요? [기여 가이드](CONTRIBUTING.md)를 확인하고 오늘 기여를 시작하세요!

---

## 📄 라이선스

이 프로젝트는 **AGPL-3.0 License**에 따라 라이선스가 부여됩니다 — 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

이는 이 소프트웨어를 자유롭게 사용, 수정 및 배포할 수 있지만, 모든 수정 사항도 동일한 라이선스에 따라 오픈 소스로 공개되어야 함을 의미합니다.

---

## 🙏 감사의 말

- [OpenRouter](https://openrouter.ai) - LLM API 게이트웨이
- [Runware](https://runware.ai) - 이미지 생성 API
- [Qdrant](https://qdrant.tech) - 벡터 데이터베이스
- [shadcn/ui](https://ui.shadcn.com) - UI 컴포넌트

---

<div align="center">

### 💬 우리와 연결하기

[![Website](https://img.shields.io/badge/Website-wants.chat-00D4AA?style=for-the-badge)](https://wants.chat)
[![Twitter](https://img.shields.io/badge/Twitter-@wantschat-1DA1F2?style=for-the-badge&logo=twitter)](https://twitter.com/wantschat)
[![Discord](https://img.shields.io/badge/Discord-Join_Community-5865F2?style=for-the-badge&logo=discord)](https://discord.gg/wantschat)
[![Email](https://img.shields.io/badge/Email-hello@wants.chat-EA4335?style=for-the-badge&logo=gmail)](mailto:hello@wants.chat)

---

**WantsChat 커뮤니티가 ❤️로 제작**

*이 프로젝트가 유용하다고 생각되시면 별표를 부탁드립니다!*

</div>
