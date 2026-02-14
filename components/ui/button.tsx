import Link from "next/link";
import { clsx } from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
};

const base = "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition";
const variants = {
  primary: "bg-brand-700 text-white hover:bg-brand-900",
  secondary: "bg-black/40 border border-brand-100 text-brand-900 hover:bg-brand-50",
  ghost: "text-brand-900 hover:bg-brand-50"
};

export function Button({ href, children, className, variant = "primary", ...props }: Props) {
  const classNames = clsx(base, variants[variant], className);
  if (href) {
    return (
      <Link href={href} className={classNames}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classNames} {...props}>
      {children}
    </button>
  );
}
