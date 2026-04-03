# Wants AI - Complete Platform Capabilities Reference

> **Version:** 2.0
> **Last Updated:** January 2025
> **Tagline:** Every AI talks. We render.

---

## Executive Summary

**Wants AI represents a paradigm shift in human-AI interaction.** It is the world's first intent-to-interface AI platform - while traditional chatbots generate text responses requiring users to read, copy, and take action elsewhere, Wants AI **detects user intent and dynamically renders fully functional user interfaces**.

### The Paradigm Shift: Intent → Interface

| Traditional AI (ChatGPT, etc.) | Wants AI |
|-------------------------------|----------|
| Intent → Text Response | Intent → Functional Interface |
| Read, copy, paste workflow | Direct interaction |
| Single-purpose chat | 1,100+ integrated tools |
| One AI model | 30+ selectable AI models |
| Text-only output | Rich UI components |
| Manual follow-up actions | Automated workflows |

### Platform at a Glance

| Metric | Count | Description |
|--------|-------|-------------|
| **Smart Tools** | 1,100+ | Fully functional, interactive UI components |
| **AI Models** | 30+ | Leading models from OpenAI, Anthropic, Google, Meta, Mistral |
| **Integrations** | 100+ | Third-party service connections |
| **Tool Categories** | 31+ | Spanning every industry and use case |
| **Industries Covered** | 50+ | From finance to healthcare to entertainment |

### Apps Wants AI Replaces

Wants AI consolidates functionality from 20+ standalone applications:
- **ChatGPT** - AI chat and generation
- **Canva** - Design and creative tools
- **Notion** - Notes and documentation
- **Zapier** - Workflow automation
- **Grammarly** - Writing assistance
- **QuickBooks** - Invoice generation
- **And 15+ more...**

---

## Table of Contents

1. [Overview](#overview)
2. [Intent Classification System](#intent-classification-system)
3. [App Creation](#1-app-creation)
4. [Web Actions](#2-web-actions)
5. [Data Analysis & Visualization](#3-data-analysis--visualization)
6. [Deep Research](#4-deep-research)
7. [Learning & Tutoring](#5-learning--tutoring)
8. [Writing Assistance](#6-writing-assistance)
9. [Planning & Organization](#7-planning--organization)
10. [Summarization](#8-summarization)
11. [Contextual UI Tools](#9-contextual-ui-tools)
12. [File Actions](#10-file-actions)
13. [Workflow Automation](#11-workflow-automation)
14. [General Chat](#12-general-chat)
15. [WebSocket Events](#websocket-events-reference)
16. [UI Types](#supported-ui-types)
17. [Credit System](#credit-system)
18. [Tool Categories](#complete-tool-categories)

---

## Overview

Wants AI is an AI-powered assistant platform that can:
- **Create** full-stack applications from natural language
- **Analyze** data from CSV, Excel, and databases
- **Research** topics with multi-source fact-checking
- **Learn** through tutoring and explanations
- **Write** emails, essays, reports with assistance
- **Plan** schedules, goals, and timelines
- **Automate** workflows and browser tasks

The system uses a unified LLM-based intent classifier that works in **any language** and understands context from the conversation history.

---

## Intent Classification System

All user messages are processed through a unified classifier that determines:

| Intent Category | Confidence Threshold | Description |
|-----------------|---------------------|-------------|
| `app_creation` | >= 0.7 | User wants to create/build an app |
| `web_action` | >= 0.7 | Screenshot, summarize, or research a URL |
| `contextual_ui` | N/A | User needs a utility tool |
| `workflow` | N/A | Create AI workflow/automation |
| `existing_app` | N/A | Open/show an existing app |
| `file_action` | N/A | Process an uploaded file |
| `learning_productivity` | >= 0.7 | Learning, planning, or writing help |
| `data_analysis` | N/A | Analyze data, create charts, run queries |
| `research` | N/A | Deep multi-source research |
| `chat` | Default | General conversation (fallback) |

---

## 1. App Creation

### Description
Create full-stack web and mobile applications from natural language descriptions.

### Requirements
- **File Upload:** Not required
- **Metadata:** None required

### Example Prompts

```
"create a time tracker app"
"build me an e-commerce website"
"I need a booking system for my salon"
"make a fitness app with calorie tracking"
"generate a restaurant ordering app"
"build a todo app with dark mode"
"create an invoice generator for freelancers"
"make a project management dashboard"
"build a social media scheduler"
"create a customer feedback form"
```

### What Gets Extracted
| Field | Description | Example |
|-------|-------------|---------|
| `appDescription` | Full description of the app | "time tracker for freelancers" |
| `appType` | Category of app | ecommerce, booking, fitness, etc. |
| `appFeatures` | Features mentioned | ["dark mode", "notifications"] |
| `appVariant` | Platform type | web, mobile, desktop, fullstack |
| `appColors` | Brand colors if mentioned | ["#3B82F6", "#10B981"] |

### Response Includes
- Live deployment URLs
- Feature list generated
- Preview/screenshot
- App ID for future reference
- Stats (files generated, lines of code)

### WebSocket Events
```
app-builder:started    → Generation begins
app-builder:progress   → Step-by-step updates
app-builder:completed  → Deployment URLs ready
app-builder:error      → If generation fails
```

### UI Type
`app-builder`

---

## 2. Web Actions

### Description
Interact with web pages - take screenshots, summarize content, or research topics.

### Requirements
- **File Upload:** Not required
- **URL:** Required (in message or metadata)

### 2.1 Screenshot

#### Example Prompts
```
"take a screenshot of google.com"
"capture this website for me"
"show me what reddit.com looks like"
"screenshot https://example.com"
"take a snapshot of this page"
"capture the homepage of amazon.com"
```

#### Response Includes
- Screenshot image
- Page title
- URL captured
- Timestamp

---

### 2.2 Summarize Website

#### Example Prompts
```
"summarize this website for me"
"what does this page say"
"give me a TLDR of this article"
"browse this link and summarize it"
"can you browse and summarize https://..."
"what's on this webpage"
"extract the main points from this URL"
```

#### Response Includes
- Summary text
- Key points
- Main topics
- Word count of original

---

### 2.3 Web Research

#### Example Prompts
```
"research this topic from the web"
"find information about this online"
"search the web for latest news on..."
```

### UI Type
`web-action`

---

## 3. Data Analysis & Visualization

### Description
Analyze datasets, create visualizations, run natural language queries, and perform financial analysis.

### Requirements
- **File Upload:** Required for file-based analysis (CSV, Excel)
- **Supported Formats:** CSV, XLSX, XLS, JSON

### 3.1 Natural Language to SQL Query

#### Example Prompts
```
"show me sales by region"
"what were the top 5 products last month"
"find customers who spent over $1000"
"calculate average order value by category"
"list all orders from California"
"which products have low inventory"
"show revenue trends by quarter"
```

#### Requirements
- **File Upload:** Yes - CSV or Excel with data
- **Or:** Connect to existing dataset

#### Response Includes
- Generated SQL query
- Query explanation
- Results table
- Suggested visualizations

---

### 3.2 Chart & Visualization

#### Example Prompts
```
"create a chart of monthly revenue"
"visualize this data"
"suggest a graph for this dataset"
"build a pie chart of expenses"
"show me a line chart of growth"
"create a bar chart comparing sales"
"make a scatter plot of price vs quantity"
```

#### Requirements
- **File Upload:** Yes - CSV or Excel with data

#### Supported Chart Types
- Line chart
- Bar chart
- Pie chart
- Doughnut chart
- Scatter plot
- Area chart
- Radar chart
- Histogram
- Heatmap
- Treemap

#### Response Includes
- Chart suggestions with confidence scores
- Chart.js compatible data
- Recommended chart type with reasoning
- Chart options/configuration

---

### 3.3 Financial Analysis

#### Example Prompts
```
"analyze this P&L statement"
"calculate profit margins"
"give me financial insights"
"compare budget vs actual"
"show me revenue breakdown"
"calculate financial ratios"
"forecast next quarter revenue"
```

#### Requirements
- **File Upload:** Yes - Financial data (CSV/Excel)
- Expected columns: revenue, costs, date/period

#### Response Includes
- P&L summary
- Revenue analysis (total, growth, trend)
- Cost breakdown (COGS, operating)
- Margin calculations (gross, operating, net)
- Financial ratios (if data available)
- Forecasts (linear, exponential, moving average)
- Insights and recommendations
- Warnings for concerning trends

---

### 3.4 Data Summary & Statistics

#### Example Prompts
```
"summarize this CSV"
"what patterns are in this data"
"give me data quality metrics"
"analyze this spreadsheet"
"describe this dataset"
"find outliers in this data"
"show column statistics"
```

#### Requirements
- **File Upload:** Yes - CSV or Excel

#### Response Includes
- Row and column count
- Data quality score (0-100)
- Column details:
  - Data type (string, number, date, boolean)
  - Null count
  - Unique values
  - For numbers: min, max, mean, median, std dev
  - For strings: most common values
- Sample rows
- Pattern detection
- Correlation analysis

---

## 4. Deep Research

### Description
Multi-source research with fact-checking, citations, and comprehensive reports.

### Requirements
- **File Upload:** Not required
- **Topic:** Required in message

### Example Prompts
```
"research about renewable energy trends"
"do deep research on cryptocurrency regulations"
"find information about AI in healthcare from multiple sources"
"compile a research report on electric vehicles"
"investigate the impact of remote work"
"research market trends in fintech"
"find academic sources on climate change"
```

### Research Depth Options
| Depth | Estimated Time | Sources |
|-------|---------------|---------|
| Quick | ~1 minute | 3-5 sources |
| Standard | ~3 minutes | 5-10 sources |
| Deep | ~7 minutes | 10-20 sources |
| Exhaustive | ~15 minutes | 20+ sources |

### Research Workflow Steps
1. **Planning** - Query analysis and search strategy
2. **Searching** - Multi-source web search
3. **Extraction** - Content extraction from sources
4. **Analysis** - Finding analysis and synthesis
5. **Fact-Checking** - Verify claims across sources
6. **Report Generation** - Compile final report

### Response Includes
- Executive summary
- Sources with credibility scores
- Key findings with evidence
- Synthesized analysis
- Fact-check results
- Citations (APA, MLA, Chicago)
- Confidence levels per claim

### Output Formats
- Markdown
- JSON
- PDF (via document generation)

---

## 5. Learning & Tutoring

### Description
Get explanations, learn concepts, and practice with interactive questions.

### Requirements
- **File Upload:** Optional (for analyzing learning materials)
- **Topic:** Required in message

### Example Prompts
```
"explain quantum physics"
"teach me about React hooks"
"how does photosynthesis work"
"what is machine learning"
"help me understand calculus"
"break down the theory of relativity"
"explain blockchain in simple terms"
"teach me Python basics"
"how do neural networks learn"
"explain the water cycle to a 10 year old"
```

### Response Includes
- **Main Explanation:** Detailed, clear explanation
- **Practice Questions:** Multiple choice with answers
  ```json
  {
    "question": "What is the main function of...",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "correctAnswer": "B",
    "explanation": "This is correct because..."
  }
  ```
- **Related Topics:** Suggestions for further learning
- **Difficulty Level:** Adapted to user's level

### Learning Features
- Adaptive difficulty
- Follow-up questions encouraged
- Visual explanations when helpful
- Real-world examples
- Step-by-step breakdowns

---

## 6. Writing Assistance

### Description
Get help writing emails, essays, reports, or improving existing text.

### Requirements
- **File Upload:** Optional (for proofreading/editing existing documents)
- **Context:** What you want to write or improve

### 6.1 Email Writing

#### Example Prompts
```
"write an email to my boss asking for time off"
"draft a thank you email to a client"
"compose a follow-up email after an interview"
"write a professional rejection email"
"create an introduction email to a new team"
```

#### Response Includes
- Subject line
- Email body
- Sign-off
- Tone analysis
- Alternative versions

---

### 6.2 Essay/Report Writing

#### Example Prompts
```
"write an essay about climate change"
"create a report for Q3 sales performance"
"draft a blog post about productivity tips"
"write a case study on our latest project"
"create a whitepaper on AI trends"
```

#### Response Includes
- Full document
- Outline structure
- Key arguments
- Supporting points
- Conclusion

---

### 6.3 Proofreading & Editing

#### Example Prompts
```
"proofread my letter"
"check this for grammar mistakes"
"improve this paragraph"
"fix the errors in this text"
"edit this for clarity"
```

#### Requirements
- **File Upload:** Yes - Document to proofread
- **Or:** Paste text in message

#### Response Includes
- Corrected text
- List of changes made
- Grammar issues found
- Style suggestions

---

### 6.4 Tone Adjustment

#### Example Prompts
```
"make this more formal"
"adjust the tone to be professional"
"rewrite this in a friendly way"
"make this sound more confident"
"convert to casual tone"
```

#### Response Includes
- Rewritten text
- Tone analysis (before/after)
- Key changes highlighted

---

## 7. Planning & Organization

### Description
Create schedules, set goals, plan projects, and organize your time.

### Requirements
- **File Upload:** Not required
- **Context:** What you want to plan

### Example Prompts
```
"plan my week"
"create a study schedule for finals"
"set goals for Q1"
"make a project timeline"
"organize my time this month"
"build a workout plan for the week"
"help me plan my vacation to Japan"
"create a meal prep schedule"
"plan a product launch"
"organize my job search"
```

### Plan Types Detected
| Type | Trigger Words | Output |
|------|--------------|--------|
| `schedule` | week, daily, routine | Day-by-day breakdown |
| `study` | exam, finals, learn | Study sessions with breaks |
| `project` | project, launch, build | Timeline with milestones |
| `goals` | goals, objectives, targets | SMART goals with actions |
| `fitness` | workout, exercise, training | Exercise schedule |
| `travel` | vacation, trip, travel | Itinerary with activities |

### Response Includes
- **Milestones:** Key dates and deliverables
- **Daily Actions:** Specific tasks per day
- **Suggestions:** Tips for success
- **Adjustments:** Flexible alternatives
- **Reminders:** Important deadlines

---

## 8. Summarization

### Description
Summarize documents, articles, or any text content.

### Requirements
- **File Upload:** Optional (for documents)
- **URL:** Optional (for web articles)
- **Or:** Paste text directly

### Example Prompts
```
"summarize this document"
"give me the key points"
"TLDR of this article"
"extract the main ideas"
"condense this text for me"
"what's the gist of this report"
"summarize in 3 bullet points"
"give me an executive summary"
```

### Supported Input Types
| Input | How to Provide |
|-------|---------------|
| Text | Paste in message |
| URL | Include link in message |
| PDF | Upload file |
| Word Doc | Upload file |
| Article | Provide URL |

### Response Includes
- **Summary:** Concise overview
- **Key Points:** Bulleted main ideas
- **Themes:** Major topics identified
- **Action Items:** If applicable
- **Statistics:**
  - Original word count
  - Summary word count
  - Reading time saved
  - Compression ratio

---

## 9. Contextual UI Tools

### Description
Access specialized tools through natural language.

### Requirements
- Varies by tool (see below)

### 9.1 Calculator

#### Example Prompts
```
"calculate 15% tip on $85"
"what's 25 * 37"
"calculate my BMI (height: 5'10, weight: 170lbs)"
"compound interest on $10000 at 5% for 10 years"
"convert 100 USD to EUR"
"calculate mortgage payment"
"what's the square root of 144"
```

#### UI Type
`calculator`

---

### 9.2 Converter

#### Example Prompts
```
"convert 100 USD to EUR"
"convert this PDF to Word"
"change 50 miles to kilometers"
"convert Celsius to Fahrenheit"
"convert this image to PNG"
"change MP4 to MP3"
```

#### File Conversion Requirements
- **File Upload:** Yes - The file to convert

#### UI Type
`converter`

---

### 9.3 Generator

#### Example Prompts
```
"generate a QR code for my website"
"create a random password"
"generate a color palette"
"make a UUID"
"create a barcode"
"generate Lorem Ipsum text"
"create a random name"
```

#### UI Type
`generator`

---

### 9.4 Image Tools

#### Example Prompts
```
"resize this image to 500x500"
"compress this image"
"convert to JPEG"
"remove background from this image"
"crop this photo"
```

#### Requirements
- **File Upload:** Yes - Image file

#### UI Type
`editor`

---

## 10. File Actions

### Description
Process uploaded files with various actions.

### Supported File Types

| Category | Extensions | Actions |
|----------|-----------|---------|
| **Data** | .csv, .xlsx, .xls, .json | Analyze, visualize, query |
| **Documents** | .pdf, .docx, .doc, .txt | Summarize, convert, extract |
| **Images** | .png, .jpg, .jpeg, .gif, .webp | Resize, convert, compress, OCR |
| **Audio** | .mp3, .wav, .m4a | Transcribe, convert |
| **Video** | .mp4, .mov, .avi | Extract audio, compress |

### Example Prompts with File Upload

```
"analyze this CSV file"           → Data analysis
"summarize this PDF"              → Document summary
"convert this Excel to JSON"      → File conversion
"extract text from this image"    → OCR
"resize this image to 800x600"    → Image editing
"transcribe this audio"           → Speech to text
"what's in this document"         → Content extraction
```

### How to Upload Files
1. Attach file to message
2. File is uploaded to R2 storage
3. Reference in metadata:
```json
{
  "attachments": [{
    "url": "https://...",
    "name": "data.csv",
    "type": "text/csv",
    "size": 1024
  }]
}
```

---

## 11. Workflow Automation

### Description
Create automated workflows and multi-step processes.

### Requirements
- **File Upload:** Not required
- **Description:** What to automate

### Example Prompts
```
"create a workflow to process invoices"
"automate my email responses"
"build a data pipeline"
"set up scheduled reports"
"create an automation for new leads"
"build a workflow for content approval"
```

### Workflow Capabilities
- Multi-step execution
- Conditional branching
- Scheduled triggers
- API integrations
- File processing
- Email notifications

### Response Includes
- Workflow diagram
- Step-by-step breakdown
- Trigger configuration
- Action definitions

---

## 12. General Chat

### Description
General conversation, Q&A, and assistance for anything not covered above.

### Example Prompts
```
"hello"
"how are you"
"tell me a joke"
"what can you do"
"help me with something"
"I have a question"
"let's chat"
```

### Features
- Context-aware responses
- Conversation memory
- Multi-turn dialogue
- Personality consistent
- Helpful and informative

---

## WebSocket Events Reference

### Session Management

| Event | Direction | Description |
|-------|-----------|-------------|
| `session:start` | Client → Server | Start new chat session |
| `session:started` | Server → Client | Session created with ID |
| `session:change-model` | Client → Server | Switch AI model |
| `session:end` | Client → Server | End current session |
| `models:list` | Client → Server | Get available models |
| `models:available` | Server → Client | List of models |

### Messaging

| Event | Direction | Description |
|-------|-----------|-------------|
| `message:send` | Client → Server | Send user message |
| `message:received` | Server → Client | Message acknowledged |
| `message:typing` | Client → Server | User typing indicator |
| `message:edit` | Client → Server | Edit previous message |
| `messages:history` | Client → Server | Request chat history |

### Streaming

| Event | Direction | Description |
|-------|-----------|-------------|
| `message:stream:start` | Server → Client | Streaming begins |
| `message:stream:chunk` | Server → Client | Token chunk received |
| `message:stream:end` | Server → Client | Streaming complete |

### Intent Detection

| Event | Direction | Description |
|-------|-----------|-------------|
| `intent:detected` | Server → Client | Intent classified |

**Payload:**
```json
{
  "intent": "app_creation",
  "confidence": 0.92,
  "uiConfig": {
    "type": "app-builder",
    "title": "App Builder",
    "description": "Creating your app..."
  },
  "extractedData": {
    "appType": "ecommerce",
    "appFeatures": ["cart", "checkout"]
  }
}
```

### App Builder

| Event | Direction | Description |
|-------|-----------|-------------|
| `app-builder:started` | Server → Client | Generation started |
| `app-builder:progress` | Server → Client | Progress update |
| `app-builder:completed` | Server → Client | App deployed |
| `app-builder:error` | Server → Client | Generation failed |

**Progress Payload:**
```json
{
  "step": "generating_frontend",
  "status": "in_progress",
  "message": "Creating React components...",
  "progress": 45
}
```

### Credits

| Event | Direction | Description |
|-------|-----------|-------------|
| `credits:balance` | Client → Server | Check balance |
| `credits:current` | Server → Client | Current balance |
| `credits:updated` | Server → Client | Balance after usage |
| `credits:insufficient` | Server → Client | Not enough credits |

### Errors

| Event | Direction | Description |
|-------|-----------|-------------|
| `message:error` | Server → Client | Message processing error |
| `session:error` | Server → Client | Session error |

---

## Supported UI Types

| UI Type | Use Case | Example Trigger |
|---------|----------|-----------------|
| `chat` | General conversation | "hello", "help me" |
| `app-builder` | App creation | "create an app" |
| `web-action` | Web interactions | "screenshot this site" |
| `converter` | File/unit conversion | "convert PDF to Word" |
| `generator` | Create content | "generate QR code" |
| `calculator` | Computations | "calculate 15% of 200" |
| `editor` | Content editing | "resize this image" |
| `chart` | Data visualization | "create a pie chart" |
| `table` | Data display | "show as table" |
| `form` | Structured input | "fill out this form" |
| `dashboard` | Analytics view | "show my dashboard" |
| `quiz` | Interactive learning | "test my knowledge" |
| `timeline` | Sequential display | "show project timeline" |
| `canvas` | Freeform creation | "draw a diagram" |

---

## Credit System

### How Credits Work
- Each AI interaction costs credits
- Cost varies by model and tokens used
- File processing may cost additional credits

### Credit Events
```javascript
// Check balance
socket.emit('credits:balance');

// Receive balance
socket.on('credits:current', (data) => {
  console.log(`Balance: ${data.balance} credits`);
});

// After message processed
socket.on('credits:updated', (data) => {
  console.log(`Used: ${data.used}, Remaining: ${data.balance}`);
});

// Insufficient credits
socket.on('credits:insufficient', (data) => {
  console.log(`Need ${data.required}, have ${data.balance}`);
});
```

---

## Quick Reference Card

### Most Common Prompts

| Want To... | Say This |
|------------|----------|
| Create an app | "create a [type] app" |
| Screenshot website | "screenshot [url]" |
| Summarize content | "summarize this" + attach file/URL |
| Analyze data | "analyze this" + attach CSV/Excel |
| Create chart | "create a chart of [data]" |
| Research topic | "research [topic]" |
| Learn something | "explain [topic]" |
| Write email | "write an email to [person] about [topic]" |
| Plan schedule | "plan my [timeframe]" |
| Convert file | "convert [file] to [format]" |
| Get help | "help me with [task]" |

---

## Architecture Overview

```
User Message
     ↓
┌─────────────────┐
│ Intent Classifier│ (LLM-based, any language)
└────────┬────────┘
         ↓
┌─────────────────┐
│ Route to Handler │
└────────┬────────┘
         ↓
    ┌────┴────┬────────┬─────────┬──────────┐
    ↓         ↓        ↓         ↓          ↓
┌──────┐ ┌───────┐ ┌───────┐ ┌────────┐ ┌──────┐
│ App  │ │ Data  │ │Research│ │Learning│ │ Chat │
│Builder│ │Analysis│ │ Agent │ │ Agent  │ │ AI   │
└──────┘ └───────┘ └───────┘ └────────┘ └──────┘
    ↓         ↓        ↓         ↓          ↓
┌─────────────────────────────────────────────┐
│              Response + UI Config            │
└─────────────────────────────────────────────┘
         ↓
    Frontend renders appropriate UI
```

---

## Support

For issues or feature requests, please contact the development team or create an issue in the repository.

---

## Complete Tool Categories

### 1. Financial Tools (150+)
- Mortgage Calculator, Loan Calculator, ROI Calculator
- Budget Planner, Expense Tracker, Savings Goal Calculator
- Invoice Generator, Receipt Scanner, Tax Estimator
- Currency Converter, Compound Interest Calculator
- Retirement Planner, Investment Portfolio Analyzer

### 2. Health & Wellness Tools (80+)
- BMI Calculator, Calorie Counter, Macro Tracker
- Pregnancy Due Date Calculator, Ovulation Tracker
- Water Intake Calculator, Sleep Tracker
- Heart Rate Zones Calculator, Body Fat Percentage
- Medication Reminder, Symptom Checker

### 3. Business & Productivity Tools (120+)
- Invoice Generator, Quote Creator, Contract Builder
- Project Timeline Generator, Meeting Agenda Builder
- Business Plan Template, SWOT Analysis Tool
- KPI Dashboard, Sales Forecast Calculator

### 4. Legal & Compliance Tools (60+)
- NDA Generator, Contract Template Builder
- Privacy Policy Generator, Terms of Service Creator
- GDPR Compliance Checker, Disclaimer Generator

### 5. Creative & Design Tools (100+)
- Color Palette Generator, Gradient Creator
- Image Resizer, Background Remover
- Logo Maker, Banner Designer, Mockup Generator

### 6. Developer Tools (90+)
- JSON Formatter/Validator, XML Converter
- Regex Tester, Code Beautifier
- API Response Viewer, Base64 Encoder/Decoder
- Hash Generator, UUID Generator

### 7. Text & Writing Tools (80+)
- Grammar Checker, Plagiarism Detector
- Word Counter, Character Counter
- Case Converter, Text Diff Comparer

### 8. AI Writing & Content (70+)
- Email Writer, Blog Post Generator
- Social Media Caption Writer
- Product Description Generator
- SEO Content Optimizer, Headline Generator

### 9. Education Tools (60+)
- Flashcard Generator, Quiz Maker
- GPA Calculator, Grade Calculator
- Study Timer (Pomodoro), Citation Generator

### 10. Real Estate Tools (40+)
- Property Value Estimator, Rent vs Buy Calculator
- Square Footage Calculator, Mortgage Comparison Tool

### 11. Automotive Tools (35+)
- Car Loan Calculator, Fuel Cost Calculator
- MPG Calculator, EV Range Estimator

### 12. Home & Garden Tools (50+)
- Paint Calculator, Flooring Calculator
- Fence Cost Estimator, Plant Care Guide

### 13. Travel & Lifestyle Tools (45+)
- Trip Budget Calculator, Packing List Generator
- Time Zone Converter, Travel Itinerary Builder

### 14. Food & Nutrition Tools (40+)
- Recipe Scaler, Unit Converter (cooking)
- Meal Planner, Nutrition Calculator

### 15. Fitness Tools (45+)
- Workout Planner, Exercise Library
- One Rep Max Calculator, Pace Calculator

### 16. Social Media Tools (35+)
- Post Scheduler, Hashtag Generator
- Engagement Rate Calculator

### 17. E-commerce Tools (40+)
- Profit Margin Calculator, Pricing Calculator
- SKU Generator, Shipping Cost Calculator

### 18. Manufacturing & Logistics (30+)
- Production Cost Calculator, Lead Time Calculator
- Inventory Turnover Calculator

### 19. Energy & Utilities (25+)
- Electricity Cost Calculator, Solar Panel Calculator
- Carbon Footprint Calculator

### 20-31. Additional Categories
- Event Planning (35+)
- Photography & Media (30+)
- Audio & Music (25+)
- Security (20+)
- Data & Analytics (35+)
- HR & Recruitment (30+)
- Marketing (40+)
- Science & Engineering (35+)
- Childcare & Parenting (25+)
- Pet Care (20+)
- Religious & Cultural (15+)
- Miscellaneous Utilities (50+)

---

## AI Models Available (30+)

### OpenAI Models
- **GPT-5 Mini** - Latest compact model
- **GPT-4o Mini** - Optimized multimodal
- **GPT-4 Turbo** - High capability

### Anthropic Models
- **Claude 3.5 Sonnet** - Best for nuanced content
- **Claude 3.5 Haiku** - Fast, efficient

### Google Models
- **Gemini 2.0 Flash** - Free tier, fast multimodal
- **Gemini 2.0 Pro** - Advanced reasoning

### Open Source
- **DeepSeek V3** - Excellent code generation
- **Meta Llama 3.1** - Versatile open model
- **Mistral Large** - European AI excellence
- **Mixtral 8x7B** - Mixture of experts

---

## Subscription Tiers

| Feature | Free | Pro | Team | Enterprise |
|---------|------|-----|------|------------|
| **AI Messages** | 3/day | 2,500/mo | Unlimited | Unlimited |
| **AI Model** | Gemini 2.0 Flash | All 30+ | All 30+ | All + Custom |
| **Tools Access** | 100+ (3 pins) | All 1,100+ | All 1,100+ | All + Custom |
| **Image Generation** | 3/mo | 100/mo | Unlimited | Unlimited |
| **Video Generation** | - | 10/mo | 100/mo | Unlimited |
| **Team Members** | 1 | 1 | 5 | Unlimited |
| **API Access** | - | - | Yes | Yes |
| **Price** | $0 | $19.99/mo | $49.99/mo | $149.99/mo |

---

*Last Updated: January 2025 | Version 2.0*
*Contact: support@wants.chat | Website: https://wants.chat*
