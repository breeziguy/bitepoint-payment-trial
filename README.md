# Food Frenzy

A modern food ordering platform built with React, TypeScript, and Supabase.

## Installation & Development

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Start the development server:
```bash
npm run dev
```

## Deployment Instructions

### Deploying to Vercel

1. Fork or clone this repository to your GitHub account
2. Go to [Vercel](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure your project:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Set up environment variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
7. Click "Deploy"

### Deploying to Netlify

1. Fork or clone this repository to your GitHub account
2. Go to [Netlify](https://netlify.com)
3. Click "New site from Git"
4. Choose your repository
5. Configure your build settings:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
6. Set up environment variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
7. Click "Deploy site"

## Features

- Online food ordering system
- Real-time order tracking
- Admin dashboard with analytics
- Menu management
- Category management
- Order management
- WhatsApp integration
- Subscription management

## Technologies Used

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase
- React Query
- React Router
- Recharts for analytics

## Environment Variables

Make sure to set these environment variables in your deployment platform:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```