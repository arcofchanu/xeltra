<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Xeltra: Brutalist AI Prompt Playground

A brutalist, neobrutalist React app for learning prompt engineering, testing AI, and building coding skills. Powered by Supabase authentication and OpenRouter AI.

## 🚀 Features

- **Supabase Authentication**: Email/password + Google OAuth
- **Brutalist UI**: Bold colors, thick borders, animated transitions
- **GIF Logo**: Custom animated splash screen
- **Click Sounds**: Audio feedback for all interactions
- **Playground**: Monaco editor for prompt creation (Lounge & Zone modes)
- **Zone Mode**: AI-generated coding challenges via OpenRouter
- **Fork to Dungeon**: Instantly test prompts in AI chat
- **Dungeon Chat**: Full-screen, brutalist chat with unrestricted LLM
- **Responsive Design**: Works on desktop and mobile
- **Favicon**: Custom PNG from assets

## 🛠️ Getting Started

**Prerequisites:**
- Node.js (v18+ recommended)

**Setup:**
1. Install dependencies:
   ```bash
   npm install
   ```
2. Set your API keys in `.env.local`:
   - `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (from Supabase)
   - `VITE_OPENROUTER_API_KEY` (from OpenRouter)
3. Run the app:
   ```bash
   npm run dev
   ```

## 🧑‍💻 Usage

- **Sign up / Login**: Use email/password or Google
- **Create Prompts**: Use Playground (Lounge/Zone)
- **Generate Challenges**: Zone mode uses OpenRouter AI
- **Fork Prompts**: Send any prompt to Dungeon chat
- **Test with AI**: Dungeon chat acts as a normal LLM (code, JSON, text, etc.)
- **Hear Clicks**: All buttons play a click sound
- **Enjoy Brutalism**: Bold colors, thick borders, animated UI

## 🔑 Environment Variables

Create a `.env.local` file:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENROUTER_API_KEY=your_openrouter_key
```

**All AI features use OpenRouter API:**
- Zone mode challenge generation
- Prompt analysis in Playground
- Dungeon chat conversations

## 🖼️ Assets
- Favicon: `/assets/FAV.png`
- Logo: `/assets/XELTRA.gif`
- Click sound: `/assets/sfx/click.mp3`

## 📚 Documentation
- 📖 `DEPLOYMENT.md` - Complete Vercel deployment guide
- ✅ `DEPLOYMENT_CHECKLIST.md` - Quick deployment checklist  
- 🔧 `SUPABASE_PRODUCTION.md` - Supabase production setup
- 🏰 `DUNGEON_GUIDE.md` - Dungeon chat usage and tips

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

**Quick Steps:**
1. Push to GitHub
2. Import on Vercel (auto-detects Vite)
3. Add environment variables
4. Deploy! 🎉

See `DEPLOYMENT_CHECKLIST.md` for complete instructions.

**Important**: 
- Add all `VITE_*` environment variables in Vercel dashboard
- Update Supabase redirect URLs with your Vercel domain
- Test Google OAuth with production URL

## 📝 License
MIT

