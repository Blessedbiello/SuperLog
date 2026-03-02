import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { handleWebhookEvent } from "@/lib/github/webhook-handler";

const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;

/**
 * Verifies the HMAC-SHA256 signature attached to an incoming GitHub webhook
 * request. Returns true when the signature is valid, false otherwise.
 *
 * GitHub sends the signature in the `X-Hub-Signature-256` header as:
 *   sha256=<hex-digest>
 */
async function verifySignature(request: NextRequest, rawBody: string): Promise<boolean> {
  const signatureHeader = request.headers.get("x-hub-signature-256");
  if (!signatureHeader) return false;

  if (!GITHUB_WEBHOOK_SECRET) {
    // If no secret is configured we cannot verify — reject the request
    console.error(
      "[github/webhook] GITHUB_WEBHOOK_SECRET is not set. Rejecting all incoming webhooks."
    );
    return false;
  }

  const expectedSignature = createHmac("sha256", GITHUB_WEBHOOK_SECRET)
    .update(rawBody, "utf8")
    .digest("hex");

  const trusted = Buffer.from(`sha256=${expectedSignature}`, "utf8");
  const received = Buffer.from(signatureHeader, "utf8");

  // Buffers must be the same length for timingSafeEqual, else it throws
  if (trusted.length !== received.length) return false;

  return timingSafeEqual(trusted, received);
}

/**
 * POST /api/github/webhook
 *
 * Receives GitHub webhook events. Verifies the HMAC-SHA256 signature, then
 * delegates processing to the webhook handler.
 *
 * This route intentionally returns 200 for all successfully authenticated
 * requests — even for event types we don't process — so GitHub does not
 * disable the webhook due to repeated non-200 responses.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Read the raw body as text for signature verification before parsing JSON
  const rawBody = await request.text();

  const isValid = await verifySignature(request, rawBody);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const eventType = request.headers.get("x-github-event");
  if (!eventType) {
    return NextResponse.json({ error: "Missing X-GitHub-Event header" }, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    await handleWebhookEvent(eventType, payload);
  } catch (err) {
    // Log but return 200 — GitHub will retry on non-2xx responses which can
    // cause duplicate processing. Our handler is idempotent via upsert.
    console.error("[github/webhook] Handler error:", err);
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
