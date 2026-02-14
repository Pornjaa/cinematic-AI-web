import type { InputHTMLAttributes } from "react";
import { clsx } from "clsx";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={clsx(
        "w-full rounded-2xl cinematic-card px-3 py-2 text-sm outline-none ring-brand-500 focus:ring",
        props.className
      )}
    />
  );
}
