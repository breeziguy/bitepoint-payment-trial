# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/bcf782c0-c369-43f7-8fa9-0bbb0b5dd7e0

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
6. Click "Deploy"

### Deploying to Netlify

1. Fork or clone this repository to your GitHub account
2. Go to [Netlify](https://netlify.com)
3. Click "New site from Git"
4. Choose your repository
5. Configure your build settings:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
6. Click "Deploy site"

## Environment Variables

Make sure to set these environment variables in your deployment platform:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Technologies Used

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/bcf782c0-c369-43f7-8fa9-0bbb0b5dd7e0) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
