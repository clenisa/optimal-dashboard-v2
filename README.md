# Optimal Dashboard V2

A modern, desktop-style financial dashboard application built with Next.js, featuring AI-powered insights, data visualization, and comprehensive financial management tools.

## ✨ Features

### 🚀 Core Functionality
- **User Authentication**: Secure Supabase-based authentication system
- **CSV Data Import**: Intelligent CSV parser with validation and error handling
- **Data Visualization**: Interactive charts for spending trends and account balances
- **AI Financial Assistant**: Chat-based AI interface for financial insights
- **Theme Management**: Light/dark mode with system preference detection
- **Window Management**: Desktop-style application windows with drag & drop

### 📊 Financial Tools
- **Category Analysis**: Track spending patterns across different categories
- **Account Balances**: Monitor balances across multiple payment sources
- **Transaction Management**: Import, validate, and organize financial data
- **Credit System**: AI chat credits with daily bonuses

### 🤖 AI Capabilities
- **Financial Analysis**: Get insights on spending patterns and trends
- **Budget Recommendations**: AI-powered suggestions for financial optimization
- **Natural Language Queries**: Ask questions about your finances in plain English
- **Multi-Provider Support**: Seamlessly switch between local Ollama and OpenAI ChatGPT models

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Charts**: Chart.js with React integration
- **AI**: Local Ollama integration via ElectronConsole
- **Deployment**: Docker containerization

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account and project
- Local Ollama installation (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd optimal-dashboard-v2
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env.local` file with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   ```

## Configuration

The application uses environment variables for configuration. Copy `.env.example` to `.env.local` and update the values:

### Required Configuration
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

### Optional Configuration
- `NODE_ENV`: Set to 'development' to enable debug logging
- `NEXT_PUBLIC_ELECTRON_CONSOLE_URL`: URL for ElectronConsole integration
- `OPENAI_API_KEY`: Server-side key for OpenAI ChatGPT access
- `NEXT_PUBLIC_ENABLE_OLLAMA`: Enable/disable the Ollama provider (default: true)
- `NEXT_PUBLIC_ENABLE_OPENAI`: Enable/disable the OpenAI provider (default: false)
- `NEXT_PUBLIC_DEFAULT_AI_PROVIDER`: Choose the initial provider shown in the UI
- `NEXT_PUBLIC_OPENAI_DEFAULT_MODEL`: Preferred OpenAI model identifier

### Development vs Production
- Debug logging is automatically enabled in development mode
- Console logs are suppressed in production builds
- All configuration is centralized in `lib/config.ts`
- UI constants are defined in `lib/constants.ts`
- Theme settings are in `lib/theme.ts`
- Content strings are managed in `lib/content.ts`

4. **Database Setup**
   Run the SQL scripts in the `database/` folder to set up your database schema.

5. **Start Development Server**
   ```bash
   pnpm dev
   ```

6. **Access the Application**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
optimal-dashboard-v2/
├── app/                    # Next.js app directory
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── ...               # Feature-specific components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
├── database/             # Database schema and migrations
├── services/             # Microservices and external integrations
├── store/                # State management
├── docs/                 # Documentation and implementation status
└── public/               # Static assets
```

## 🔧 Key Components

### CSV Parser
- Drag & drop file upload
- Intelligent validation and error reporting
- Batch processing for large files
- Automatic category detection and creation

### Data Visualization
- Interactive line charts for spending trends
- Bar charts for account balances
- Responsive design with mobile support
- Real-time data updates

### AI Chat Console
- Natural language financial queries
- Integration with local Ollama models
- Credit-based usage system
- Conversation history and context

### Theme Management
- Unified theme switching system
- System preference detection
- Consistent design language
- Accessibility considerations

## 🎯 Usage Guide

### 1. Getting Started
1. Create an account or log in
2. Upload your financial data via CSV
3. Explore your spending patterns with charts
4. Ask the AI assistant for insights

### 2. CSV Upload
- Supported format: Date, Amount, Description, Category
- Maximum file size: 10MB
- Automatic validation and error reporting
- Batch processing for efficiency

### 3. AI Assistant
- Ask questions about your finances
- Get spending pattern analysis
- Receive budget recommendations
- Track your AI usage with credits

### 4. Data Visualization
- Interactive charts with hover details
- Filter data by categories and time periods
- Export insights for reporting
- Responsive design for all devices

## 🔒 Security Features

- Secure authentication with Supabase
- Input validation and sanitization
- SQL injection prevention
- Rate limiting on API endpoints
- Secure environment variable handling

## 🧪 Testing

### Running Tests
```bash
# Unit tests
pnpm test

# Integration tests
pnpm test:integration

# E2E tests
pnpm test:e2e
```

### Test Coverage
- Component rendering tests
- API integration tests
- User flow validation
- Error handling scenarios

## 🚀 Deployment

### Docker Deployment
```bash
# Build the image
docker build -t optimal-dashboard .

# Run the container
docker run -p 3000:3000 optimal-dashboard
```

### Environment Variables
Ensure all required environment variables are set in your deployment environment.

## 📈 Roadmap

### Phase 1: Core Features ✅
- [x] User authentication
- [x] CSV data import
- [x] Basic visualizations
- [x] AI chat interface

### Phase 2: Revenue Features 🚧
- [ ] Complete Stripe integration
- [ ] Subscription management
- [ ] Premium feature gates

### Phase 3: Enhanced AI 🤖
- [ ] Advanced financial analysis
- [ ] Predictive analytics
- [ ] Custom AI models

### Phase 4: Mobile & Accessibility 📱
- [ ] Mobile-optimized interface
- [ ] Progressive Web App
- [ ] Accessibility improvements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Use conventional commit messages
- Maintain test coverage above 80%
- Follow the established code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [Implementation Status](docs/implementation-status.md)
- [API Reference](docs/api-reference.md)
- [Troubleshooting Guide](docs/troubleshooting.md)

### Getting Help
- Check the [issues](https://github.com/your-repo/issues) page
- Create a new issue with detailed information
- Join our community discussions

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Charts powered by [Chart.js](https://www.chartjs.org/)
- AI integration via [Ollama](https://ollama.ai/)
- Database services from [Supabase](https://supabase.com/)

---

**Optimal Dashboard V2** - Making financial management intelligent and accessible.

