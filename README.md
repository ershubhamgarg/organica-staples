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

## Environment

Razorpay checkout runs in test mode when you use keys generated from the
Razorpay Dashboard test-mode toggle:

```bash
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
# Optional: saved Razorpay Dashboard payment configuration ID with UPI enabled.
RAZORPAY_CHECKOUT_CONFIG_ID=config_...
```

Shiprocket shipment creation runs server-side after the Supabase order and
inventory transaction succeeds:

```bash
SHIPROCKET_EMAIL=api-user@example.com
SHIPROCKET_PASSWORD=...
SHIPROCKET_PICKUP_LOCATION=Primary
# Required for live checkout shipping rates. Use the home/pickup address pincode.
SHIPROCKET_PICKUP_POSTCODE=125055
# Optional: set if you want a specific Shiprocket channel.
SHIPROCKET_CHANNEL_ID=123456
# Optional: automatically assign an AWB after order creation.
SHIPROCKET_AUTO_ASSIGN_AWB=true
# Optional package defaults used when product weights do not fully describe the parcel.
SHIPROCKET_DEFAULT_LENGTH_CM=20
SHIPROCKET_DEFAULT_BREADTH_CM=15
SHIPROCKET_DEFAULT_HEIGHT_CM=8
SHIPROCKET_DEFAULT_WEIGHT_KG=0.5
```

## Stack

- TypeScript strict, path alias `@/*`
- Tailwind CSS v4 tokens in `app/globals.css`
- Zustand stores in `store/`, persisted to localStorage
- Supabase client in `utils/supabase.ts`

## Main Routes

- `/`: hero + product listing
- `/product/[id]`: product detail
- `/cart`: cart with free shipping over ₹500
- `/checkout`: address, Razorpay test checkout, order placement
- `/login`: Supabase email/password auth
- `/profile`: user profile/orders/addresses
- `/our-story`: brand content

## Brand

- Brand colors: olive/gold/cream premium organic pantry tone
- Currency: INR (₹)
