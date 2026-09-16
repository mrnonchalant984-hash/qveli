import "dotenv/config";

async function main() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const secret = process.env.QEVLI_CRON_SECRET || "";
  const headers: Record<string, string> = {};
  if (secret) headers["x-qevli-cron"] = secret;

  const response = await fetch(`${base}/api/official-feed/sync`, {
    method: "POST",
    headers,
  });

  const body = await response.text();
  console.log(body);

  if (!response.ok) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
