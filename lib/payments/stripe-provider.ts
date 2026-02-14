import { PaymentProvider, PaymentInitInput, PaymentInitResult } from "@/lib/payments/types";

export class StripeProvider implements PaymentProvider {
  providerName = "stripe" as const;

  async createCheckout(input: PaymentInitInput): Promise<PaymentInitResult> {
    return {
      checkoutUrl: `${input.returnUrl}?mock=stripe&order=${input.orderId}`,
      providerRef: `stripe_${input.orderId}`
    };
  }

  async verifyWebhook(rawBody: string): Promise<{ valid: boolean; ref?: string }> {
    const payload = JSON.parse(rawBody) as { id?: string };
    return { valid: true, ref: payload.id };
  }
}
