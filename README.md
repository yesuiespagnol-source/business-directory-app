# Business Directory Search App

A modern React application for finding local businesses and categorizing them by web presence.

## 🚀 Quick Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

**No local setup needed!** See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## 💻 Local Development

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Anthropic API key

### Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```bash
ANTHROPIC_API_KEY=your-api-key-here
```

3. Start the dev server:
```bash
npm run dev
```

4. Open your browser to http://localhost:5173

**Note:** In local development, the API functions run through Vite's dev server.

## Features

- Search for businesses by niche and city
- Automatic categorization (with/without website)
- Export results to CSV
- Copy results to clipboard
- Google Maps integration
- Responsive design
- Real-time filtering

## Usage

1. Enter a business type (e.g., "peluquerías", "restaurantes")
2. Enter a city (e.g., "Madrid", "Barcelona")
3. Click "Buscar Negocios"
4. View results categorized by web presence
5. Export or copy results as needed
