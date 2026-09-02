# ANNVRIKSH - Premium Pantry Store

A premium ecommerce experience for ANNVRIKSH, built with Next.js 16, React 19, and Supabase.

## About

ANNVRIKSH is an organic pantry store focused on providing premium, ethically sourced staples. This application provides a seamless shopping experience from product discovery to checkout.

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
RAZORPAY_KEY_ID=rzp_test_...
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
# Shared secret for the inbound Shiprocket webhook (see below).
SHIPROCKET_WEBHOOK_SECRET=...
```

Order tracking on the site is otherwise only refreshed when a signed-in
customer opens their profile page (`app/api/shiprocket/track`) — there's no
background polling. To catch status changes made directly in the Shiprocket
dashboard (most importantly cancellations), register a webhook so Shiprocket
pushes updates instead:

1. Generate a random secret and set it as `SHIPROCKET_WEBHOOK_SECRET` above.
2. In Shiprocket: **Settings → API → Shipment Webhook Settings**, set the
   callback URL to:
   `https://<your-domain>/api/shiprocket/webhook?secret=<SHIPROCKET_WEBHOOK_SECRET>`
   (the secret is passed as a query parameter because Shiprocket's webhook
   config doesn't reliably support a custom header across all webhook
   types — this avoids depending on that).
3. Trigger a test event from Shiprocket's dashboard (or cancel/update a real
   test order) and check the server logs — the route logs every payload it
   receives (`[shiprocket webhook] payload: ...`) so you can confirm the
   field names Shiprocket actually sends match what the route expects
   (`awb`/`awb_code`, `order_id`, `channel_order_id`, `current_status`).
   Shiprocket doesn't publish one fixed webhook schema across all account
   types, so this check is worth doing once after setup.

### Recovering from a failed shipment sync

If automatic Shiprocket sync fails at checkout (`shipping_status` ends up
`sync_failed`), the order itself is still placed fine — only the courier
booking didn't go through. If you then create the shipment by hand directly
in the Shiprocket dashboard, reflect it on the order via the Supabase table
editor (`orders` table, find the row by `id`) so the customer's tracking
card picks it up:

| Column | Value |
|---|---|
| `shiprocket_order_id` | The order ID shown in the Shiprocket dashboard |
| `shiprocket_shipment_id` | The shipment ID (if shown) |
| `shiprocket_awb_code` | The AWB code, once a courier is assigned — leave blank until then |
| `shiprocket_courier_name` | The assigned courier's name |
| `shiprocket_tracking_url` | `https://www.shiprocket.in/shipment-tracking/?awb=<AWB code>` |
| `shipping_status` | `created` if no AWB yet, otherwise `awb_assigned` |
| `shipping_error` | **Clear this to `null`** — the tracking card checks this field first and will keep showing "needs a team check" even after you fill in the fields above if it's left set |
| `status` | `processing` |

Once an AWB code is set, the customer's profile page will pick up live
status from then on — either via their own tracking-card refresh, or via the
webhook above once Shiprocket has an AWB to report status against.

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
