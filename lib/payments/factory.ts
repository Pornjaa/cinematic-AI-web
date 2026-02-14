import { OmiseProvider } from "@/lib/payments/omise-provider";
import { StripeProvider } from "@/lib/payments/stripe-provider";
import type { PaymentProvider } from "@/lib/payments/types";

export function getPaymentProvider(): PaymentProvider {
  return process.env.PAYMENT_PROVIDER === "stripe" ? new StripeProvider() : new OmiseProvider();
}
