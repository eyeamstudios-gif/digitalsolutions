# PBS AI Support Setup Guide

## PBS Pricing Structure — 2025 Edition

| Tier                    | Version                   | Access Type             | Storage                      | Trial Period      | Monthly        | Annual      | Description                                                                                   |
|-------------------------|---------------------------|-------------------------|------------------------------|-------------------|---------------|-------------|-----------------------------------------------------------------------------------------------|
| 🟦 PBS Starter / Basic  | Static (Offline)          | Browser-based, offline  | LocalStorage                 | 30 Days Free      | $12.99 / mo   | $99 / yr    | Core budgeting app with allocations, income, bills, and variable expenses. Converts to Basic after trial. |
| 🟧 PBS Pro (Standard)   | Static (Offline Advanced) | Browser-based, offline  | LocalStorage + Manual Backup | Optional 7-day demo | $24.99 / mo   | $199 / yr   | Unlocks advanced tools: debt payoff, savings goals, multiple budgets, printable reports, and auto-backup to file. |

## Quick Setup (5 minutes)

### 1. Get Your Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

### 2. Configure PBS Support
1. Open `support.html` in your code editor
2. Find this line (around line 182):
   ```javascript
   const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
   ```
3. Replace `YOUR_GEMINI_API_KEY_HERE` with your actual API key
4. Save the file

### 3. Test It Out
- Visit your PBS site
- Click "Support" in the navigation
- Try asking: "How do I set up my first budget?"

## Features Included

### 🤖 **AI Chat Assistant**
- Instant responses to PBS-specific questions
- Context-aware help about budgeting features
- Quick action buttons for common questions

### 📧 **Email Fallback**
- Direct mailto link for complex issues
- Pre-filled subject and body
- Routes to your support email

### 🚀 **Smart Quick Actions**
- Getting Started help
- Allocation bucket explanations
- Debt management guidance
- Data backup instructions
- Starter vs Pro comparisons
- Upgrade assistance

## Customization Options

### Change Support Email
In `support.html`, update this line:
```html
<a href="mailto:support@eyeamstudios.com?subject=PBS Support Request&body=...">
```

### Add More Quick Actions
Add new buttons in the `quick-actions` section:
```html
<div class="quick-action" onclick="sendQuickMessage('Your question here')">
  🎯 Your Topic
</div>
```

### Modify AI Context
Update the `PBS_CONTEXT` variable to include more specific information about your business or additional features.

## Cost Information

### Gemini API Pricing
- **Free tier**: 15 requests per minute, 1500 requests per day
- **Pay-as-you-go**: $0.00025 per 1K characters (very affordable)
- Most support conversations cost less than $0.01

### Estimated Monthly Costs
- **Small site** (100 conversations): ~$2-5
- **Medium site** (500 conversations): ~$10-15
- **Large site** (1000+ conversations): ~$20-30

## Security Notes

- API key is used client-side (visible in browser)
- Consider implementing a backend proxy for production
- Monitor usage in Google Cloud Console
- Set up usage alerts if needed

## Troubleshooting

### "AI service isn't configured"
- Check that your API key is correctly set
- Ensure no extra spaces or quotes around the key

### "Having trouble connecting"
- Check your internet connection
- Verify API key is valid in Google AI Studio
- Check browser console for error details

### Rate Limiting
- Gemini free tier: 15 requests/minute
- Add delay between messages if needed
- Consider upgrading to paid tier for higher usage

## Advanced Options

### Add Chat History
Store conversations in localStorage for returning users.

### Add Voice Input
Integrate Web Speech API for voice questions.

### Add File Upload
Allow users to upload screenshots of issues.

### Backend Integration
Route through your server for better security and analytics.

---

Need help setting this up? Email: support@eyeamstudios.com