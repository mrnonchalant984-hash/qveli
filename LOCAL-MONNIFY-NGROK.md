# Local Monnify sandbox testing

Monnify cannot call `localhost` directly. Use ngrok to expose the Next.js server over HTTPS.

## 1. Start Qevli

From the project root:

```powershell
npm run dev
```

Qevli should listen on `http://localhost:3000`.

## 2. Start the HTTPS tunnel

Install ngrok from https://ngrok.com/download, authenticate it once with your ngrok account, then run:

```powershell
ngrok http 3000
```

Copy the `https://...ngrok-free.app` forwarding URL. Keep this terminal running.

## 3. Configure `.env`

Use the following values in the project `.env` file. Keep the existing Monnify API key, secret key, and contract code. Replace the two placeholders with the current ngrok URL and the webhook secret configured in Monnify Sandbox:

```dotenv
QEVLI_MONETIZATION_ENABLED=true
MONNIFY_BASE_URL=https://sandbox.monnify.com/api/v1
MONNIFY_API_KEY=your-existing-sandbox-api-key
MONNIFY_SECRET_KEY=your-existing-sandbox-secret-key
MONNIFY_CONTRACT_CODE=your-existing-contract-code
MONNIFY_WEBHOOK_SECRET=copy-the-secret-from-monnify-webhook-settings
MONNIFY_REDIRECT_URL=https://your-current-ngrok-host.ngrok-free.app/settings?billing=complete
NEXT_PUBLIC_APP_URL=https://your-current-ngrok-host.ngrok-free.app
MONNIFY_PAYMENT_METHODS=CARD,ACCOUNT_TRANSFER,USSD
MONNIFY_TIMEOUT_MS=15000
QEVLI_EMAIL_ENABLED=true
```

`MONNIFY_WEBHOOK_SECRET` must be the secret value itself. It must not be a URL. Use the same value in Monnify's webhook settings and `.env`.

Configure this callback in Monnify Sandbox:

```text
https://your-current-ngrok-host.ngrok-free.app/api/billing/webhook
```

Enable transaction-completion events. Do not use the old `http://localhost:3000` URL for the webhook.

## 4. Apply the database migration

After updating `.env`, run:

```powershell
npx prisma migrate deploy
npx prisma generate
```

For a local development database where a new migration is needed, use:

```powershell
npx prisma migrate dev
```

## 5. Test the boost flow

Restart `npm run dev` after changing `.env`, sign in, open Billing, start a profile boost, complete the Monnify sandbox checkout, then open `/admin`. The payment webhook keeps the boost pending until an admin approves it.

## Important tunnel behavior

The free ngrok URL changes when the tunnel restarts. Update `MONNIFY_REDIRECT_URL`, `NEXT_PUBLIC_APP_URL`, and the Monnify webhook URL every time the hostname changes, then restart Next.js.
