
# LingkodPOS — Production-Oriented Supabase + PayMongo POS

LingkodPOS is a food-service POS designed for a phone/tablet/laptop cashier.

## Important payment architecture

The browser NEVER receives the PayMongo secret key.

Cash:
Browser → Supabase Edge Function → secure SQL RPC → completed order.

QR Ph:
Browser → create-gcash-qr Edge Function → PayMongo Payment Intent → QR image → customer scans with GCash/QR Ph → PayMongo webhook → secure SQL RPC → order becomes `completed` → cashier status polling displays PAID.

PayMongo's current QR Ph API uses a Payment Intent, a `qrph` Payment Method, and returns the QR image in `next_action.code.image_url`. QR Ph is single-use and expires after 30 minutes by default. See official docs:
https://docs.paymongo.com/docs/payment-acceptance-qr-ph-api

## 1. Create Supabase project

Create a Supabase project and open SQL Editor.

Run ALL of:
`supabase/schema.sql`

Do not paste your PayMongo secret into SQL.

## 2. Configure frontend

Copy `config.js` and replace:

SUPABASE_URL
SUPABASE_ANON_KEY

Use the project's browser-safe Supabase key. Never put a service-role key here.

## 3. Deploy Edge Functions

Install/login to the Supabase CLI, then link your project.

Deploy:

supabase functions deploy create-cash-order
supabase functions deploy create-gcash-qr
supabase functions deploy order-status
supabase functions deploy cancel-gcash-order
supabase functions deploy admin-product
supabase functions deploy paymongo-webhook

The included config disables JWT verification because these endpoints are public kiosk endpoints. The functions themselves enforce their own input/security controls. Keep your Supabase project URL and public key safe to use in the browser; never expose the service-role key.

## 4. Add Edge Function secrets

Set these secrets:

SUPABASE_SERVICE_ROLE_KEY = your Supabase service-role key
PAYMONGO_SECRET_KEY = your PayMongo secret key
PAYMONGO_WEBHOOK_SECRET = the signing secret of your PayMongo webhook endpoint
PAYMONGO_LIVEMODE = false for testing, true for live
LINGKODPOS_ADMIN_PIN = your private admin PIN

Example:

supabase secrets set SUPABASE_SERVICE_ROLE_KEY="..."
supabase secrets set PAYMONGO_SECRET_KEY="sk_test_..."
supabase secrets set PAYMONGO_WEBHOOK_SECRET="..."
supabase secrets set PAYMONGO_LIVEMODE="false"
supabase secrets set LINGKODPOS_ADMIN_PIN="..."

## 5. PayMongo webhook

In the PayMongo Dashboard, create a webhook endpoint pointing to:

https://YOUR_PROJECT_REF.supabase.co/functions/v1/paymongo-webhook

Subscribe to at least:
- payment.paid
- payment.failed

Use the webhook's signing secret as PAYMONGO_WEBHOOK_SECRET.

PayMongo signs webhook requests with `Paymongo-Signature`. This function verifies the signature using the raw request body before processing it.

## 6. Test before live

Start with PayMongo TEST keys.

Create a test order in LingkodPOS → choose GCash / QR Ph → scan using the supported test flow → verify:
1. QR appears.
2. PayMongo receives the payment.
3. webhook reaches Supabase.
4. order status becomes completed.
5. cashier displays PAID.
6. stock decreases once.
7. failed/cancelled payment restores stock.

Only after that should you switch:
PAYMONGO_SECRET_KEY → live key
PAYMONGO_LIVEMODE → true
and create a LIVE PayMongo webhook endpoint with its LIVE signing secret.

## 7. Render / GitHub

For the static frontend, you can host the repository on Render as a Static Site.

Build command: leave empty.
Publish directory: `.`

Your Supabase Edge Functions remain hosted by Supabase; they are NOT run by the Render static site.

You can also host the static files on GitHub Pages or another static host.

## 8. Admin

Open `admin.html`.
Enter the `LINGKODPOS_ADMIN_PIN`.
Add food products, price, stock, category and optional SKU.

No customer or cashier login is required.

## Security notes

- Do not put PAYMONGO_SECRET_KEY in config.js.
- Do not put SUPABASE_SERVICE_ROLE_KEY in config.js.
- Do not commit secrets to GitHub.
- The admin PIN is an internal POS control, not enterprise identity/authentication.
- The cashier does not expose the orders table directly; it asks a server function for the status of the current order.
- The browser polls the current order every 2 seconds. This gives automatic paid status without publicly exposing every order to anonymous clients.
- QR payment confirmation is based on PayMongo's server webhook, not on the customer saying they paid.

## Current PayMongo QR Ph behavior

Dynamic QR Ph is generated per transaction, contains the exact amount, is single-use, and expires after 30 minutes by default. GCash is among the supported QR Ph apps. PayMongo recommends webhooks for production confirmation.

## What is NOT included

This package does not implement:
- receipt printer drivers
- cash drawer hardware control
- accounting/tax reports
- employee accounts/roles
- refunds UI
- offline mode
- automatic settlement reconciliation

Those can be added later without changing the basic QR payment architecture.
