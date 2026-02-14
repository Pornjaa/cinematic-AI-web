import { LoginForm } from "@/components/shared/login-form";
import { siteMetadata } from "@/lib/seo";

export const metadata = siteMetadata({
  title: "Login",
  description: "Login to Cinematic AI",
  path: "/login",
  noindex: true
});

export default function LoginPage() {
  return <LoginForm />;
}
