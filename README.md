# Amritya Organics - Premium Pantry Store

A premium ecommerce experience for Amritya Organics, built with Next.js 16, React 19, and Supabase.

## Project Overview

Amritya Organics is an organic pantry store focused on providing premium, ethically sourced staples. This application provides a seamless shopping experience from product discovery to checkout.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Commands

- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`

## Stack

- TypeScript strict, path alias `@/*`
- Tailwind CSS v4 tokens in `app/globals.css`
- Zustand stores in `store/`, persisted to localStorage
- Supabase client in `utils/supabase.ts`

## Main Routes

- `/`: hero + product listing
- `/product/[id]`: product detail
- `/cart`: cart with free shipping over ₹500
- `/checkout`: address, mocked UPI verify, order placement
- `/login`: Supabase email/password auth
- `/profile`: user profile/orders/addresses
- `/our-story`: brand content

## Brand

- Brand colors: olive/gold/cream premium organic pantry tone
- Currency: INR (₹)
