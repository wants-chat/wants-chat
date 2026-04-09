<p align="center">
  <img src="public/assets/logo.png" alt="Wants AI Logo" width="120" height="120" />
</p>

<h1 align="center">Wants AI</h1>

<p align="center">
  <strong>Every AI talks. We render.</strong><br />
  The first AI platform where intent becomes interface.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
</p>

---

## What is Wants AI?

Wants AI is an **intent-driven AI platform** that goes beyond traditional chatbots. Instead of just generating text responses, Wants **detects your intent and dynamically renders contextual user interfaces** tailored to your specific needs.

### Why Wants AI?

| Traditional AI | Wants AI |
|----------------|----------|
| Generates text responses | Renders interactive UIs |
| You read, copy, paste | You interact directly |
| One-size-fits-all chat | Context-aware interfaces |
| Limited to conversation | Full application capabilities |

**Ask for a calculator → Get a working calculator**
**Ask for a form → Get an interactive form**
**Ask for data analysis → Get visual charts**

---

## Platform Stats

| Feature | Count |
|---------|-------|
| Smart Tools | 1100+ |
| AI Models | 30+ |
| Integrations | 100+ |
| Industries Covered | 50+ |

---

## Pricing Plans

| Plan | Price | AI Models | Key Features |
|------|-------|-----------|--------------|
| **Free** | $0 | Gemini 2.0 Flash only | 3 AI messages/day, 100+ tools, 3 pins |
| **Pro** | $19.99/mo | All 30+ models | 2,500 messages, 100 images, 10 videos |
| **Team** | $49.99/mo | All 30+ models | Unlimited AI, 5 team members, API |
| **Enterprise** | $149.99/mo | All + custom | Unlimited everything, SSO, dedicated support |

> Annual plans save up to 17%

---

## Key Features

### 1100+ Smart Tools
- **Text Tools** - Formatters, comparers, converters
- **Calculators** - Financial, health, scientific, engineering
- **Generators** - QR codes, passwords, content, images
- **Converters** - Units, currencies, formats, files
- **AI Writing** - Documents, emails, social content
- **Developer Tools** - JSON, regex, encoding, hashing
- **Business Tools** - Invoices, contracts, analytics
- **And much more...**

### 30+ AI Models
- OpenAI GPT-5 Mini, GPT-4o Mini
- Anthropic Claude 3.5 Haiku, Claude 3.5 Sonnet
- Google Gemini 2.0 Flash (free tier)
- DeepSeek V3
- Meta Llama 3
- Mistral, Mixtral
- And many more...

### 100+ Integrations
Connect with popular services and platforms to extend functionality and automate workflows.

### Additional Capabilities
- **App Builder** - Create custom applications from text descriptions
- **Data Analysis** - Charts, reports, insights
- **Deep Research** - AI-powered research with citations
- **File Processing** - PDF, images, documents
- **Workflow Automation** - Automate repetitive tasks

---

## Tech Stack

### Frontend
- **React 18** - Modern UI with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first CSS

### UI Components
- **shadcn/ui** - Beautiful, accessible components
- **Framer Motion** - Smooth animations
- **Lucide React** - Consistent icons
- **Recharts** - Data visualization

### State Management
- **TanStack React Query** - Data fetching and caching
- **React Context API** - Global state

### Backend
- **NestJS** - Scalable Node.js framework
- **Supabase** - Database and authentication
- **Socket.io** - Real-time communication

---

## Getting Started

### Prerequisites
- **Node.js** 18.x or higher
- **npm** 9.x or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/wants.git
cd wants/frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Start development server
npm run dev

# Open http://localhost:5173
```

### Building for Production

```bash
npm run build
```

---

## Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── landing/        # Landing page sections
│   │   ├── tools/          # 1100+ tool components
│   │   ├── chat/           # AI chat interface
│   │   └── ui/             # shadcn/ui components
│   ├── pages/              # Page components
│   ├── config/             # Configuration
│   │   ├── pricing.ts      # Centralized pricing config
│   │   └── seo.ts          # SEO configuration
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom hooks
│   ├── data/               # Static data (tools, categories)
│   ├── services/           # API services
│   ├── lib/                # Utilities
│   ├── i18n/               # Internationalization
│   └── types/              # TypeScript types
├── .env.example            # Environment template
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | Yes |
| `VITE_SOCKET_URL` | WebSocket server URL | Yes |
| `VITE_APP_NAME` | Application name | No |
| `VITE_SITE_URL` | Public site URL | No |

See `.env.example` for all available options.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit (`git commit -m "feat: add amazing feature"`)
5. Push (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Code Style
- Follow existing patterns
- Use TypeScript
- Follow patterns in `CLAUDE.md`
- Use [Conventional Commits](https://www.conventionalcommits.org/)

---

## Support

- **Email**: support@wants.chat
- **Documentation**: [docs.wants.chat](https://docs.wants.chat)

---

## License

This project is licensed under the MIT License.

---

<p align="center">
  Built with intent by the Wants AI Team
</p>
