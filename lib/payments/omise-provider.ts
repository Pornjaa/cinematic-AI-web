import { PaymentProvider, PaymentInitInput, PaymentInitResult } from "@/lib/payments/types";

export class OmiseProvider implements PaymentProvider {
  providerName = "omise" as const;

  async createCheckout(input: PaymentInitInput): Promise<PaymentInitResult> {
    const publicKey = process.env.OMISE_PUBLIC_KEY ?? "";
    if (!publicKey) {
      throw new Error("OMISE_PUBLIC_KEY missing");
    }

    // Replace with real Opn API call in production
    return {
      checkoutUrl: `${input.returnUrl}?mock=omise&order=${input.orderId}`,
      providerRef: `omise_${input.orderId}`
    };
  }

  async verifyWebhook(rawBody: string): Promise<{ valid: boolean; ref?: string }> {
    const payload = JSON.parse(rawBody) as { key?: string };
    return { valid: true, ref: payload.key };
  }
}
