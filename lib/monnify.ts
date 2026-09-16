import crypto from "crypto";

const baseUrl = (process.env.MONNIFY_BASE_URL || "https://sandbox.monnify.com/api/v1").replace(/\/$/, "");
const timeoutMs = Number(process.env.MONNIFY_TIMEOUT_MS || 15_000);

type MonnifyResponse<T> = { requestSuccessful?: boolean; responseMessage?: string; responseCode?: string; responseBody?: T };
type AccessToken = { accessToken: string; expiresIn: number };
type Transaction = { checkoutUrl: string; transactionReference: string; paymentReference: string };

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${baseUrl}${path}`, { ...init, signal: controller.signal, cache: "no-store" });
    const data = await response.json() as MonnifyResponse<T>;
    if (!response.ok || data.requestSuccessful === false || !data.responseBody) {
      const detail = [data.responseMessage, data.responseCode, `HTTP ${response.status}`].filter(Boolean).join(" - ");
      throw new Error(detail || `Monnify request failed (HTTP ${response.status})`);
    }
    return data.responseBody;
  } finally {
    clearTimeout(timer);
  }
}

async function getAccessToken() {
  const apiKey = process.env.MONNIFY_API_KEY;
  const secretKey = process.env.MONNIFY_SECRET_KEY;
  if (!apiKey || !secretKey) throw new Error("Monnify credentials are not configured");
  const credentials = Buffer.from(`${apiKey}:${secretKey}`).toString("base64");
  const data = await request<AccessToken>("/auth/login", {
    method: "POST",
    headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/json" },
    body: "{}",
  });
  return data.accessToken;
}

export async function initializeTransaction(input: {
  amountNaira: number;
  paymentReference: string;
  customerName: string;
  customerEmail: string;
  description: string;
  redirectUrl: string;
}) {
  const contractCode = process.env.MONNIFY_CONTRACT_CODE;
  if (!contractCode) throw new Error("MONNIFY_CONTRACT_CODE is not configured");
  const token = await getAccessToken();
  return request<Transaction>("/merchant/transactions/init-transaction", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: input.amountNaira,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      paymentReference: input.paymentReference,
      paymentDescription: input.description,
      currencyCode: "NGN",
      contractCode,
      redirectUrl: input.redirectUrl,
      paymentMethods: (process.env.MONNIFY_PAYMENT_METHODS || "CARD,ACCOUNT_TRANSFER,USSD").split(",").map(value => value.trim()).filter(Boolean),
    }),
  });
}

export function verifyWebhookSignature(rawBody: string, signature: string | null) {
  const secret = process.env.MONNIFY_WEBHOOK_SECRET || process.env.MONNIFY_SECRET_KEY;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
  const received = Buffer.from(signature, "utf8");
  const calculated = Buffer.from(expected, "utf8");
  return received.length === calculated.length && crypto.timingSafeEqual(received, calculated);
}
