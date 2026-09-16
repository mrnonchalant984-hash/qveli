# Qevli Monetization Status

Subscription checkout and webhook settlement use Monnify sandbox when configured.

Sandbox monetization can be enabled for testing with the environment variables in `.env.example`.

Required default:

QEVLI_MONETIZATION_ENABLED="true"

The server-side billing subscribe endpoint rejects subscriptions while the flag is false. Advertising remains disabled during this phase. Configure the Monnify webhook URL as `/api/billing/webhook`.

For production, use live Monnify credentials and contract code, a public HTTPS redirect/webhook URL, and review payment, legal, refund, tax, age and cancellation controls before switching from sandbox.

## Resend email setup

Set `QEVLI_EMAIL_ENABLED=true`, create a Resend API key, and set `RESEND_API_KEY`. The `EMAIL_FROM` address must use a domain verified in Resend. Phone OTP remains disabled.

## Monnify webhook secret

Set the webhook URL in the Monnify dashboard to `/api/billing/webhook`. If the dashboard provides a webhook signing secret, copy that value into `MONNIFY_WEBHOOK_SECRET`. If Monnify signs webhooks with the account secret key, leave `MONNIFY_WEBHOOK_SECRET` empty and the application will use `MONNIFY_SECRET_KEY` as the signing key.
