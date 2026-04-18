# AI Assistant Setup Guide for JK Properties CRM

## 🚀 Quick Start

Your AI assistant is now integrated into your CRM! Here's how to get it working:

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure OpenAI API Key
Copy the environment template:
```bash
cp env-example.txt .env.local
```

Edit `.env.local` and add your OpenAI API key:
```
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
NEXT_PUBLIC_OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

### 3. Start Development Server
```bash
npm run dev
```

## 🤖 AI Features Included

### 1. **Smart Lead Analysis**
- Automatic lead scoring (0-100)
- Sentiment analysis on lead data
- Conversion probability prediction
- Actionable recommendations for each lead

### 2. **AI Chat Assistant**
- Floating chat interface (bottom-right corner)
- Natural language queries about your leads
- Suggested prompts for quick actions
- Context-aware responses

### 3. **AI Insights Dashboard**
- Real-time lead analysis
- Conversion rate tracking
- Best lead source identification
- Actionable business recommendations

## 💡 How to Use

### Chat Assistant
- Click the chat bubble in bottom-right corner
- Ask questions like:
  - "Show me my hottest leads"
  - "What's my conversion rate?"
  - "Help me prioritize follow-ups"
  - "Analyze my lead sources"

### Insights Panel
- Located in the right sidebar below tasks
- Click to expand and see detailed analysis
- Green insights = positive trends
- Yellow insights = recommendations
- Purple insights = performance data

## 🔧 Customization

### Adding Custom AI Prompts
Edit `src/lib/ai-service.ts` to modify prompts:

```typescript
// Example: Custom lead analysis
const customPrompt = `
  Analyze this real estate lead for JK Properties:
  Focus on: budget readiness, timeline urgency, property preferences
  Provide: score, urgency level, next steps
`;
```

### Adding New AI Features
1. Create new method in `AIAssistant` class
2. Add corresponding UI component in `src/components/ai/`
3. Import and use in your dashboard

## 🛡️ Security Notes

### Development Mode
- Currently uses client-side API calls (for easy setup)
- API key is exposed in browser (development only)

### Production Deployment
- Create API routes in `src/app/api/ai/`
- Move API calls to server-side
- Never expose API keys in production

Example production setup:
```typescript
// src/app/api/ai/chat/route.ts
import { aiAssistant } from '@/lib/ai-service';

export async function POST(request: Request) {
  // Server-side AI processing
}
```

## 💰 Cost Management

### OpenAI Usage
- GPT-3.5 Turbo: ~$0.002/1K tokens
- Estimated cost: $0.01-0.05 per 100 AI interactions
- Monitor usage in OpenAI dashboard

### Optimization Tips
- Responses are cached to avoid repeated calls
- Efficient prompt engineering reduces token usage
- Set usage limits in OpenAI account settings

## 🚨 Troubleshooting

### AI Not Working?
1. Check API key is correctly set in `.env.local`
2. Verify OpenAI account has credits
3. Check browser console for errors
4. Restart development server

### Limited Mode
If you see "Limited Mode" in chat:
- API key is missing or invalid
- AI features will work with basic functionality
- Full features require valid OpenAI API key

### Performance Issues
- AI responses may take 2-5 seconds
- Lead analysis processes in batches
- Large datasets may need pagination

## 🔄 Next Steps

### Advanced Features to Add:
1. **Voice Input**: Speech-to-text for chat
2. **Email Integration**: AI-powered email responses
3. **Predictive Analytics**: Forecast sales trends
4. **Automated Follow-ups**: AI-scheduled reminders
5. **Sentiment Tracking**: Monitor customer satisfaction

### Integration Ideas:
- Connect to property databases
- Integrate with calendar systems
- Add document analysis capabilities
- Implement multi-language support

## 📞 Support

For issues with the AI assistant:
1. Check this guide first
2. Review OpenAI API documentation
3. Check browser console for specific errors
4. Verify Firebase configuration is working

---

**Your AI assistant is ready to help you close more deals! 🎯**
