# Optimal Desktop Enhanced

Enhanced version of your optimal-desktop that communicates with your existing ElectronConsole running locally with Ollama, includes Stripe credits system, and user identification for AI chat functionality.

## 🏗 Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Optimal Desktop│    │ ElectronConsole │    │    Ollama       │
│   (Vercel)      │◄──►│   (Your PC)     │◄──►│   (Your PC)     │
│                 │    │                 │    │                 │
│ • Dashboard     │    │ • AI Processing │    │ • LLM Models    │
│ • Credits UI    │    │ • Conversation  │    │ • Qwen 2.5      │
│ • User Auth     │    │ • Financial     │    │                 │
│ • Financial     │    │   Context       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │              ┌─────────────────┐
         └─────────────►│    Supabase     │
                        │                 │
                        │ • User Data     │
                        │ • Credits       │
                        │ • Transactions  │
                        │ • Financial     │
                        └─────────────────┘
```

## 🚀 What's New

### **AI Chat Integration**
- **Direct Communication**: Dashboard sends messages to your local ElectronConsole
- **User Identification**: ElectronConsole knows who sent each message (user ID + email)
- **Financial Context**: AI has access to your budgeting data for personalized responses
- **Connection Status**: Real-time monitoring of ElectronConsole connectivity

### **Credits System with Stripe**
- **Daily Free Credits**: 5 credits per day for logged-in users
- **Credit Packages**: Purchase additional credits via Stripe
- **Usage Tracking**: Monitor credit consumption and transaction history
- **Automatic Refunds**: Credits refunded on communication errors

### **Enhanced User Experience**
- **Real-time Status**: See if ElectronConsole is connected
- **Credit Balance**: Always visible in AI chat interface
- **Transaction History**: Track all credit earnings and spending
- **Error Handling**: Graceful fallbacks when ElectronConsole is offline

## 🔧 Setup Instructions

### 1. Prerequisites
- Your existing Supabase project (from optimal-desktop)
- Your ElectronConsole running locally
- Stripe account for payments (optional for testing)

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
cp .env.example .env.local
```

Fill in your environment variables:
```env
# Your existing Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe for credits (get from Stripe dashboard)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ElectronConsole URL (default port 3000)
NEXT_PUBLIC_ELECTRON_CONSOLE_URL=http://localhost:3000
```

### 4. Database Setup
1. Go to your Supabase SQL editor
2. Run the commands from `database/credits-schema.sql`
3. This adds credits tables to your existing database

### 5. ElectronConsole Modifications
Your ElectronConsole needs to accept user identification. Add this to your `/prompt` endpoint:

```javascript
// In your ElectronConsole server.js or similar
app.post('/prompt', async (req, res) => {
  const { 
    prompt, 
    userId, 
    userEmail, 
    conversationId, 
    source,
    includeFinancialContext 
  } = req.body

  // Log the user making the request
  console.log(`AI request from user: ${userEmail} (${userId})`)
  
  // If includeFinancialContext is true, fetch user's financial data
  if (includeFinancialContext) {
    // Add logic to fetch user's financial data from Supabase
    // and include it in the AI context
  }

  // Your existing AI processing logic...
  const response = await processWithOllama(prompt, userId)
  
  res.json({ response, metadata: { userId, source } })
})
```

### 6. Stripe Webhook Setup (Optional)
1. Create webhook endpoint in Stripe dashboard
2. Point to: `https://your-vercel-domain.com/api/stripe-webhook`
3. Select events: `checkout.session.completed`, `payment_intent.payment_failed`
4. Copy webhook secret to environment variables

## 🤖 AI Chat Features

### **Communication Flow**
1. User types message in dashboard
2. Dashboard deducts 1 credit
3. Message sent to ElectronConsole with user identification
4. ElectronConsole processes with Ollama
5. Response returned to dashboard
6. If error occurs, credit is refunded

### **User Identification**
Each message includes:
```json
{
  "prompt": "What's my spending this month?",
  "userId": "uuid-of-user",
  "userEmail": "user@example.com",
  "conversationId": "conv_123456",
  "source": "optimal-desktop",
  "includeFinancialContext": true
}
```

### **Financial Context**
When users ask financial questions, the dashboard sets `includeFinancialContext: true`. Your ElectronConsole can then:
- Fetch user's transaction data from Supabase
- Include spending summaries in AI context
- Provide personalized financial insights

## 💳 Credits System

### **Credit Packages**
- **Starter Pack**: 50 credits for $4.99
- **Popular Pack**: 150 + 25 bonus credits for $12.99
- **Power User**: 300 + 75 bonus credits for $24.99
- **Monthly Unlimited**: 1000 + 200 bonus credits for $49.99

### **Daily Credits**
- 5 free credits per day for logged-in users
- Automatically awarded on login
- Tracked to prevent double-claiming

### **Usage Tracking**
- Every AI message costs 1 credit
- Credits refunded on errors
- Full transaction history available
- Real-time balance updates

## 🔒 Security & Privacy

### **User Data Protection**
- All data isolated by user ID (Row Level Security)
- ElectronConsole receives user identification for context
- No sensitive data stored in dashboard
- Credits tied to authenticated users only

### **API Security**
- Stripe webhooks verified with signatures
- Supabase RLS policies enforce data isolation
- Environment variables for all secrets
- HTTPS required for production

## 🚀 Development

### **Local Development**
```bash
npm run dev
```

### **Testing AI Chat**
1. Make sure ElectronConsole is running on your PC
2. Open AI Assistant in dashboard
3. Check connection status (should show "Connected")
4. Send test message
5. Monitor ElectronConsole logs for user identification

### **Testing Credits**
1. Use Stripe test mode
2. Purchase credits with test card: `4242 4242 4242 4242`
3. Check credit balance updates
4. Verify transaction history

## 📱 Usage Examples

### **AI Financial Queries**
- "What's my spending by category this month?"
- "How's my credit card utilization?"
- "Show me my biggest expenses"
- "Help me create a budget"

### **Credit Management**
- Check daily credit availability
- Purchase additional credits
- View transaction history
- Monitor usage patterns

## 🔧 ElectronConsole Integration

### **Required Changes**
Your ElectronConsole needs minimal changes:

1. **Accept User ID**: Modify `/prompt` endpoint to accept `userId` and `userEmail`
2. **Financial Context**: Optionally fetch user's financial data when `includeFinancialContext` is true
3. **Logging**: Log which user made each request for debugging

### **Optional Enhancements**
- **User-specific Conversations**: Store conversations per user
- **Financial Data Access**: Direct Supabase integration for financial context
- **Usage Analytics**: Track which users use AI most

## 🚀 Deployment

### **Dashboard (Vercel)**
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### **ElectronConsole (Your PC)**
- Keep running locally as before
- Ensure port 3000 is accessible
- Consider using ngrok for external access during development

### **Database (Supabase)**
- Already hosted and managed
- Run credits schema in SQL editor
- Monitor usage in Supabase dashboard

## 🔄 Migration from Original

### **Existing Data**
- All your existing optimal-desktop data works as-is
- No changes to existing financial components
- Credits system is additive

### **New Features**
- AI chat component added to desktop
- Credits manager added to desktop
- Database schema extended with credits tables

## 🆘 Troubleshooting

### **AI Chat Issues**
- **"Disconnected" status**: Check ElectronConsole is running on port 3000
- **No response**: Check ElectronConsole logs for errors
- **Credits not deducted**: Check Supabase connection and RLS policies

### **Credits Issues**
- **Daily credits not awarded**: Check database triggers and user authentication
- **Stripe payments failing**: Verify webhook endpoint and secrets
- **Balance not updating**: Check Supabase RLS policies

### **Common Solutions**
1. Restart ElectronConsole
2. Check environment variables
3. Verify Supabase connection
4. Test with browser dev tools

## 📈 Next Steps

### **Phase 1 (Current)**
- ✅ AI chat with ElectronConsole communication
- ✅ Credits system with Stripe
- ✅ User identification
- ✅ Connection monitoring

### **Phase 2 (Future)**
- [ ] Enhanced financial context in AI
- [ ] Voice recognition integration
- [ ] Conversation history persistence
- [ ] Advanced credit analytics

### **Phase 3 (Advanced)**
- [ ] Multi-model AI support
- [ ] Team/family account sharing
- [ ] Advanced financial AI tools
- [ ] Mobile app integration

---

**This enhanced version preserves all your existing optimal-desktop functionality while adding powerful AI communication with your local ElectronConsole setup.**

