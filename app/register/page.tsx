import Link from "next/link";
import { RegisterForm } from "@/components/shared/register-form";
import { siteMetadata } from "@/lib/seo";

export const metadata = siteMetadata({
  title: "Register",
  description: "Create Cinematic AI account",
  path: "/register",
  noindex: true
});

export default function RegisterPage() {
  return (
    <div className="space-y-3">
      <RegisterForm />
      <p className="text-sm">มีบัญชีอยู่แล้ว? <Link href="/login" className="text-brand-700">เข้าสู่ระบบ</Link></p>
    </div>
  );
}
