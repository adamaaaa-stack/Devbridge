/**
 * Lemon Squeezy API client for creating checkouts (code unlock payments).
 */

const LEMON_SQUEEZY_API = "https://api.lemonsqueezy.com/v1";

function getApiKey(): string {
  const key = process.env.LEMON_SQUEEZY_API_KEY;
  if (!key?.trim()) throw new Error("LEMON_SQUEEZY_API_KEY is not set");
  return key.trim();
}

export interface CreateCheckoutInput {
  storeId: string;
  variantId: string;
  customPriceCents?: number;
  customData: {
    submission_id: string;
    workspace_id: string;
    company_id: string;
    developer_id: string;
  };
  redirectUrl?: string;
}

export interface CreateCheckoutResult {
  checkoutId: string;
  checkoutUrl: string;
}

/**
 * Create a Lemon Squeezy checkout for one-time code unlock payment.
 * Returns the hosted checkout URL.
 */
export async function createCheckout(
  input: CreateCheckoutInput
): Promise<CreateCheckoutResult | { error: string }> {
  try {
    const payload = {
      data: {
        type: "checkouts",
        attributes: {
          custom_price: input.customPriceCents ?? undefined,
          checkout_data: {
            custom: {
              submission_id: input.customData.submission_id,
              workspace_id: input.customData.workspace_id,
              company_id: input.customData.company_id,
              developer_id: input.customData.developer_id,
            },
          },
          product_options: input.redirectUrl
            ? { redirect_url: input.redirectUrl }
            : undefined,
        },
        relationships: {
          store: { data: { type: "stores", id: input.storeId } },
          variant: { data: { type: "variants", id: input.variantId } },
        },
      },
    };

    const res = await fetch(`${LEMON_SQUEEZY_API}/checkouts`, {
      method: "POST",
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${getApiKey()}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      return { error: text || `Lemon Squeezy API ${res.status}` };
    }

    const json = (await res.json()) as {
      data?: { id?: string; attributes?: { url?: string } };
    };
    const id = json.data?.id;
    const url = json.data?.attributes?.url;
    if (!id || !url) return { error: "Invalid checkout response" };

    return {
      checkoutId: String(id),
      checkoutUrl: url,
    };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Checkout creation failed" };
  }
}
