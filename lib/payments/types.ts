export type PaymentInitInput = {
  orderId: string;
  amountTHB: number;
  courseTitle: string;
  userEmail: string;
  returnUrl: string;
};

export type PaymentInitResult = {
  checkoutUrl: string;
  providerRef: string;
};

export interface PaymentProvider {
  providerName: "omise" | "stripe";
  createCheckout(input: PaymentInitInput): Promise<PaymentInitResult>;
  verifyWebhook(rawBody: string, signature?: string | null): Promise<{ valid: boolean; ref?: string }>;
}
