# PBS AI Support Setup Guide

## PBS Pricing Structure — 2025 Edition

| Tier                    | Version                   | Access Type             | Storage                      | Trial Period      | Monthly        | Annual      | Description                                                                                   |
|-------------------------|---------------------------|-------------------------|------------------------------|-------------------|---------------|-------------|-----------------------------------------------------------------------------------------------|
| 🟦 PBS Starter / Basic  | Static (Offline)          | Browser-based, offline  | LocalStorage                 | 30 Days Free      | $12.99 / mo   | $99 / yr    | Core budgeting app with allocations, income, bills, and variable expenses. Converts to Basic after trial. |
| 🟧 PBS Pro (Standard)   | Static (Offline Advanced) | Browser-based, offline  | LocalStorage + Manual Backup | Optional 7-day demo | $24.99 / mo   | $199 / yr   | Unlocks advanced tools: debt payoff, savings goals, multiple budgets, printable reports, and auto-backup to file. |

## 🤖 Getting Your Free Gemini API Key

### Step 1: Go to Google AI Studio
1. Visit [https://aistudio.google.com/](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API Key" in the top right

### Step 2: Create API Key
1. Click "Create API Key"
2. Select "Create API key in new project" (or use existing)
3. Copy your API key (starts with `AIza...`)

### Step 3: Configure PBS Support
1. Open `support.html` in your editor
2. Find this line (around line 200):
   ```javascript
   const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
   ```
3. Replace `YOUR_GEMINI_API_KEY_HERE` with your actual API key:
   ```javascript
   const GEMINI_API_KEY = 'AIzaSyC-your-actual-key-here';
   ```

## ✅ Test Your Setup

1. Open `support.html` in browser
2. Try asking: "How do I get started with PBS?"
3. Should get AI response instead of "service isn't configured"

## 🛡️ Security Notes

- **Free tier**: 15 requests per minute, 1500 per day
- **Keep key secure**: Don't commit to public repos
- **For production**: Use environment variables or server-side

## 🚀 Quick Fix

Want me to help you configure it right now? Just:
1. Get your API key from Google AI Studio
2. Tell me the key and I'll update the file for you!

## 💡 Alternative: Server-Side Setup

For better security, consider moving the AI to your server:
1. Create backend endpoint for chat
2. Store API key on server
3. Update frontend to call your API instead

## 🔧 Troubleshooting

- **"API key not valid"**: Check key is correct and active
- **"Quota exceeded"**: You've hit the free limits
- **Network errors**: Check internet connection

Your AI assistant will help users with:
- ✅ Getting started with PBS
- ✅ Understanding allocation buckets  
- ✅ Debt management strategies
- ✅ Feature explanations
- ✅ Upgrade guidance
- ✅ Troubleshooting

Once configured, users get instant AI help instead of waiting for email support! 🎉