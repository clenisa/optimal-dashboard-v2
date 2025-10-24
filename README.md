# Optimal Dashboard V2

A modern, desktop-style financial management platform built with Next.js 14, featuring AI-powered insights, advanced data visualization, and comprehensive financial tools in a unique desktop-like interface.

## 🚀 What is Optimal Dashboard V2?

Optimal Dashboard V2 is a sophisticated financial management application that combines the power of modern web technologies with a desktop-like user experience. The platform provides users with powerful tools to analyze, manage, and understand their financial data through an intuitive interface that mimics a traditional desktop operating system with windowed applications.

### 🎯 Core Purpose

This application serves as a comprehensive financial command center, allowing users to:
- Import and validate financial data from various sources
- Visualize spending patterns and account balances through interactive charts
- Interact with AI-powered financial assistants for insights and recommendations
- Manage multiple financial accounts and categories in a unified interface
- Calculate mortgages and other financial scenarios
- Combine and process multiple data sources seamlessly

## ✨ Current Features & Applications

### 🏦 Financial Management Suite
- **Transaction Manager** - Advanced transaction viewing, filtering, and categorization with auto-categorization features
- **Category Trends** - Interactive line charts showing spending patterns over time with category breakdowns
- **Account Balances** - Real-time payment source balance monitoring with customizable threshold controls
- **Mortgage Calculator** - Comprehensive mortgage payment calculator with tax and insurance considerations

### 🤖 AI-Powered Analytics
- **AI Chat Console** - Multi-provider AI system supporting both local Ollama models and OpenAI ChatGPT
- **Financial Context Integration** - AI can analyze your spending patterns and provide personalized insights
- **Credits Manager** - Sophisticated credit system for AI usage tracking with daily bonuses and purchasing options
- **Multi-Model Support** - Seamlessly switch between different AI models based on your needs
- **Model Pricing Overview** - Built-in pricing table clarifies per-model costs, usage recommendations, and credit impact

### 🛠️ Data Processing Tools
- **CSV Parser** - Intelligent CSV import with validation, error reporting, and automatic data cleaning
- **CSV Combiner** - Merge multiple CSV files with conflict resolution and data normalization
- **Data Validation** - Advanced validation rules for transaction data with error reporting and suggestions

### 🎨 User Experience
- **Desktop Interface** - Unique windowed application system with drag-and-drop, minimize, maximize functionality
- **Theme Management** - Comprehensive light/dark mode with system preference detection
- **Window Management** - Multi-window environment with taskbar, focus management, and window stacking
- **Authentication System** - Secure Supabase-based authentication with password recovery
- **Design System Tokens** - Unified surface, typography, and spacing tokens applied across the dashboard for consistent light/dark themes
- **Accessible Interactions** - Keyboard navigation, ARIA labelling, and screen reader support standardised across menus, dropzones, and controls
- **Responsive Defaults** - Mobile-first layouts for category analysis, CSV tools, and header controls prevent UI cramping on smaller breakpoints

## 🔧 Current Integrations

### 🗄️ Database & Storage
- **Supabase** - Primary database for user data, transactions, AI conversations, and credit management
- **PostgreSQL** - Advanced relational database features with Row Level Security (RLS)
- **Real-time Subscriptions** - Live data updates across the application

### 💳 Payment Processing
- **Stripe Integration** - Credit purchasing system with webhook support for real-time payment processing
- **Subscription Management** - Foundation for premium features and recurring billing
- **Secure Payment Flow** - PCI-compliant payment processing with detailed transaction tracking

### 🧠 AI & Machine Learning
- **Ollama Provider** - Local AI model integration via ElectronConsole for privacy-focused processing
- **OpenAI Integration** - Cloud-based ChatGPT models with usage-based billing
- **Multi-Provider Architecture** - Extensible system supporting additional AI providers
- **Context-Aware Processing** - AI responses enhanced with user's financial data when relevant

### 🔐 Authentication & Security
- **Supabase Auth** - Complete authentication system with social logins
- **Row Level Security** - Database-level security ensuring users only access their own data
- **JWT Tokens** - Secure session management with automatic refresh
- **Password Recovery** - Comprehensive password reset and recovery flows

### 📊 Visualization & Charts
- **Chart.js Integration** - Professional-grade charts with interactive features
- **React Chart Components** - Responsive charts that work across devices
- **Real-time Updates** - Charts update automatically when underlying data changes

## 🆕 Last 10 Major Features & Improvements

### 1. **Design System Token Foundation** (Latest)
- **What**: Introduced shared surface, typography, and spacing tokens in `lib/design-tokens.ts`
- **Impact**: Consistent styling and theming across light/dark modes with easier future expansions
- **Touchpoints**: Credits manager, AI chat console, transaction manager, category matrix, menu bar

### 2. **Accessibility & Interaction Standardization**
- **What**: Added accessible button primitives, ARIA-compliant menu bar, and keyboard friendly CSV dropzones
- **Impact**: Screen reader parity and full keyboard navigation throughout the desktop shell
- **Extras**: Voice control toggle labels, aria-live messaging, and improved focus management

### 3. **AI Chat Console Refresh**
- **What**: Responsive layout with mobile history sheet, "New Chat" workflow, default OpenAI provider, and pricing table dialog
- **Impact**: Faster context switching, clearer cost visibility, and better small-screen usability
- **Bonus**: Header actions wrap gracefully with history, pricing, and chat controls

### 4. **Unified Loading & Error Handling**
- **What**: Shared `LoadingSkeleton` component and standardized alert patterns with retry support
- **Impact**: No more zero-value flashes; users get actionable retry paths with consistent messaging
- **Coverage**: Credits, transactions, category matrix, and AI chat history

### 5. **Category Matrix Responsive Upgrade**
- **What**: Sticky category column, scroll indicators, and mobile card layout for monthly totals
- **Impact**: Better readability on tablets/phones and clearer understanding of sortable columns via `aria-sort`
- **Enhancement**: Gradient scroll hints signal additional data off-screen

### 6. **Credits Manager UX Enhancements**
- **What**: Balance skeletons, surface token adoption, and error retry button
- **Impact**: Eliminates loading flickers, keeps alerts on-brand, and lets users resync without refreshing
- **Status Messages**: Daily claim guidance and billing sync attempts surfaced consistently

### 7. **Volume Control Settings Modal**
- **What**: Added audio device selection, volume presets, and mute keyboard shortcuts with dialog UI
- **Impact**: Converts placeholder alert into actionable controls aligned with the design system
- **Integration**: Dropdown trigger now respects theme hover tokens and aria labels

### 8. **Payment Sources Notes Feature**
- **What**: Added notes field to payment sources/accounts for better organization
- **Impact**: Users can now add custom notes and descriptions to their accounts
- **Database**: New migration adds `notes` column to sources table

### 9. **Multi-Provider AI System**
- **What**: Complete overhaul of AI system to support multiple providers (Ollama + OpenAI)
- **Impact**: Users can choose between local privacy-focused AI and cloud-based powerful models
- **Features**: Provider switching, model selection, usage tracking, and cost management

### 10. **Comprehensive Mortgage Calculator**
- **What**: Full-featured mortgage calculator with taxes, insurance, and detailed breakdowns
- **Impact**: Advanced financial planning tool with multiple calculation scenarios
- **API**: New backend API for complex mortgage calculations

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router and server components
- **TypeScript** - Type-safe development with strict typing
- **Tailwind CSS** - Utility-first styling with design tokens
- **Shadcn/UI** - High-quality component library with Radix UI primitives
- **Zustand** - Lightweight state management for complex application state

### Backend & Database
- **Supabase** - Backend-as-a-Service with PostgreSQL database
- **PostgreSQL** - Advanced relational database with full-text search
- **Row Level Security** - Database-level security policies
- **Real-time Subscriptions** - Live data updates via WebSockets

### AI & Machine Learning
- **Ollama** - Local AI model serving via ElectronConsole
- **OpenAI API** - Cloud-based AI with GPT models
- **Multi-Provider Architecture** - Extensible AI provider system
- **Usage Tracking** - Sophisticated credit and cost management

### Data Visualization
- **Chart.js** - Canvas-based charts with excellent performance
- **React ChartJS 2** - React integration for Chart.js
- **Responsive Design** - Charts adapt to different screen sizes
- **Interactive Features** - Hover states, tooltips, and drill-down capabilities

### Payment & Billing
- **Stripe** - Payment processing with webhooks
- **Subscription Management** - Recurring billing foundation
- **Usage-Based Billing** - AI credit consumption tracking

### Development Tools
- **ESLint** - Code linting with Next.js recommended rules
- **Prettier** - Code formatting (via ESLint integration)
- **TypeScript Strict Mode** - Maximum type safety
- **Git Hooks** - Pre-commit validation and formatting

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (recommended: 20+)
- pnpm (recommended) or npm
- Supabase account and project
- Playwright browsers for testing (run `npm run test:install`)
- Stripe account (for payment features)
- ElectronConsole (for local AI features)

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd optimal-dashboard-v2
   pnpm install
   ```

2. **Environment configuration**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual credentials
   ```

3. **Database setup**
   ```bash
   # Run the SQL scripts in the database/ folder
   # Import sample data if needed
   ```

4. **Start development**
   ```bash
   pnpm dev
   ```

## 📚 Documentation

- [Design System](DESIGN_SYSTEM.md) – Surface, typography, and spacing tokens with application patterns.
- [Accessibility Playbook](ACCESSIBILITY.md) – Keyboard, ARIA, and screen reader conventions.
- [Mobile Guidelines](MOBILE_GUIDELINES.md) – Responsive behaviours for key applications.
- [Component Reference](docs/component-reference.md) – Props, styling notes, and interaction details for refreshed components.

### Required Environment Variables

```env
# Core Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# AI Provider Configuration
NEXT_PUBLIC_ELECTRON_CONSOLE_URL=http://localhost:3000
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_ENABLE_OLLAMA=true
NEXT_PUBLIC_ENABLE_OPENAI=false
NEXT_PUBLIC_DEFAULT_AI_PROVIDER=ollama
```

## 📁 Project Architecture

```
optimal-dashboard-v2/
├── app/                           # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── ai/                   # AI provider endpoints
│   │   ├── mortgage-calculator/  # Mortgage calculation API
│   │   └── stripe-webhook/       # Payment webhook handler
│   ├── auth/                     # Authentication pages
│   └── reset-password/           # Password recovery
├── components/                   # React components
│   ├── ui/                      # Base UI components (shadcn/ui)
│   ├── ai-chat/                 # AI chat components
│   ├── credits/                 # Credit management components
│   ├── csv-parser/              # CSV processing components
│   ├── csv-combiner/            # CSV merging components
│   ├── desktop/                 # Desktop interface components
│   ├── mortgage/                # Mortgage calculator components
│   └── transactions/            # Transaction management
├── hooks/                       # Custom React hooks
├── lib/                         # Utility libraries
│   ├── ai/                      # AI provider system
│   ├── chart-data/             # Chart data processing
│   ├── credits/                # Credit system utilities
│   ├── csv/                    # CSV processing utilities
│   ├── mortgage/               # Mortgage calculation logic
│   └── supabase/               # Database utilities
├── store/                       # Zustand state stores
├── database/                    # SQL schemas and migrations
├── docs/                        # Documentation
└── services/                    # Microservice configurations
```

## 🔒 Security Features

### Data Protection
- **Row Level Security (RLS)** - Users can only access their own data
- **Input Validation** - All user inputs are validated and sanitized
- **SQL Injection Prevention** - Parameterized queries and ORM protection
- **XSS Protection** - Content Security Policy and input escaping

### Authentication Security
- **JWT Tokens** - Secure session management with automatic refresh
- **Password Hashing** - Bcrypt-based password storage via Supabase
- **Rate Limiting** - API endpoint protection against abuse
- **Session Management** - Secure session handling with proper logout

### Payment Security
- **PCI Compliance** - Stripe handles all sensitive payment data
- **Webhook Verification** - Cryptographic verification of payment events
- **Secure Checkout** - No sensitive payment data stored locally

## 🧪 Development & Testing

### Code Quality
```bash
pnpm lint          # ESLint + TypeScript checking
pnpm build         # Production build verification
pnpm type-check    # TypeScript type checking
```

### Testing Commands
```bash
pnpm test          # Run all Playwright tests
pnpm test:ui       # Interactive test UI
pnpm test:headed   # Run tests with visible browser
pnpm test:debug    # Debug mode
pnpm test:report   # View test reports
pnpm test:install  # Install Playwright browsers
```

### Testing Strategy
- **E2E Testing** - Comprehensive Playwright test suite with 135+ tests across 6 browsers
- **Component Testing** - React Testing Library for UI components
- **Integration Testing** - API route testing with test database
- **AI Testing** - Dedicated script for AI chat workflow validation
- **Test Coverage** - Complete feature coverage map in `tests/test-coverage-map.md`

### Development Guidelines
- Follow TypeScript strict mode for type safety
- Use conventional commits for clear change history
- Implement proper error boundaries for error handling
- Maintain responsive design principles
- Follow accessibility best practices

## 🗺️ Roadmap & Implementation Status

### ✅ Completed (Current)
- Core financial management tools
- Multi-provider AI system
- Desktop-style interface
- Secure authentication
- CSV processing tools
- Basic Stripe integration

### 🚧 In Progress
- **Stripe Integration Enhancement** (25% complete)
  - Complete checkout flow
  - Subscription management
  - Premium feature gates
  
- **AI Financial Analysis** (60% complete)
  - Financial context injection
  - Advanced analytics
  - Conversation persistence

### 📋 Planned Features
- **Mobile Responsiveness** - Touch-optimized interface
- **Advanced Analytics** - Predictive spending analysis
- **Offline Support** - Local data caching and sync
- **API Integrations** - Bank account connections
- **Export Features** - Multiple format data export
- **Budget Planning** - Goal setting and tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Standards
- Write TypeScript with strict typing
- Follow existing code patterns and conventions
- Add tests for new functionality
- Update documentation for significant changes
- Ensure all linting passes before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Documentation

- **Implementation Status**: [docs/implementation-status.md](docs/implementation-status.md)
- **AI Multi-Provider Guide**: [docs/ai-multi-provider.md](docs/ai-multi-provider.md)
- **Troubleshooting**: [docs/troubleshooting.md](docs/troubleshooting.md)
- **Development Guidelines**: [AGENTS.md](AGENTS.md)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [Supabase](https://supabase.com/) - The open source Firebase alternative
- [Stripe](https://stripe.com/) - Payment processing platform
- [Ollama](https://ollama.ai/) - Local AI model serving
- [OpenAI](https://openai.com/) - AI model provider
- [Shadcn/UI](https://ui.shadcn.com/) - Beautiful component library
- [Chart.js](https://www.chartjs.org/) - Chart visualization library

---

**Optimal Dashboard V2** - Making financial management intelligent, intuitive, and accessible through cutting-edge technology and thoughtful design.
