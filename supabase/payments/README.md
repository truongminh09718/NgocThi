# VNPAY Sandbox setup

This repository contains a **sandbox-only** payment path for the six built-in sample products. It sends a signed payment request from a Supabase Edge Function, receives VNPAY's server-to-server IPN, stores the result, verifies the signed browser return on the server, and displays the server-recorded status. It does not collect real money, pay out sellers, or enable checkout for locally created listings.

## Required accounts and values

1. Create a Supabase project owned by the project group.
2. Register for VNPAY Sandbox merchant credentials and confirm the sandbox account is enabled.
3. Set the project URL and publishable key in `.env.local` for local builds and as GitHub Actions repository secrets named `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for GitHub Pages.
4. Never put the VNPAY hash secret or Supabase service-role key in `.env.local`, a `VITE_*` variable, Git, or chat.

## Deploy Supabase functions

Install the Supabase CLI, then link the project and apply the migration:

```powershell
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

Copy `.env.supabase.example` to `.env.supabase`, replace the placeholders locally with values from the VNPAY Sandbox merchant console, then upload the server-only secrets:

```powershell
Copy-Item .env.supabase.example .env.supabase
# Edit .env.supabase locally; never commit or share it.
npx supabase secrets set --env-file .env.supabase
```

Deploy the functions:

```powershell
npx supabase functions deploy vnpay-create-payment
npx supabase functions deploy vnpay-ipn
npx supabase functions deploy vnpay-return
npx supabase functions deploy vnpay-payment-status
```

In the VNPAY Sandbox merchant configuration, set the IPN URL to:

```text
https://YOUR_PROJECT_REF.supabase.co/functions/v1/vnpay-ipn
```

Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to the GitHub repository's **Settings → Secrets and variables → Actions**. Push a new commit or run the Pages workflow again after adding them. The browser key is publishable; the VNPAY hash secret and service-role key must remain server-side.

## Current boundary

The sandbox API only accepts known sample product IDs and uses prices fixed in the Edge Function, never a client-supplied amount. Payment records are readable/writable only by the service-role functions. A valid IPN signature, merchant code, transaction reference, and amount are checked before an order is marked paid. The return redirect alone never marks an order paid.

Before accepting real payments, the project must move account authentication and listings from browser local storage to Supabase, associate each order with buyer and seller accounts, define seller settlement/refund/dispute flows, and complete the provider's merchant onboarding. Do not change `PAYMENT_MODE` to production or replace the sandbox URL as a shortcut.
