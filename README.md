# Restaurant Management System

A full-featured restaurant management system built with React, Vite, and Supabase.

## Deployment Instructions

### Deploying to Vercel

1. Fork or clone this repository
2. Create a new project on Vercel
3. Connect your GitHub repository to Vercel
4. Add the following environment variables in Vercel:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
5. Deploy! Vercel will automatically detect it's a Vite project and use the correct build settings

### Deploying to Netlify

1. Fork or clone this repository
2. Create a new site on Netlify
3. Connect your GitHub repository to Netlify
4. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add the following environment variables in Netlify:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
6. Deploy! Netlify will build and deploy your site

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Features

- Menu Management
- Order Processing
- Category Management
- User Authentication
- Admin Dashboard
- Real-time Updates
- WhatsApp Integration
- Payment Processing