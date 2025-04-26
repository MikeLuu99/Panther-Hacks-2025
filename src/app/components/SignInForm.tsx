"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { Card } from "pixel-retroui";

export function SignInForm() {
  const { signIn } = useAuthActions();

  return (
    <div className="w-full">
      <Card className="flex items-center justify-center">
      <button
        type="button"
        className="auth-button"
        onClick={() => void signIn("anonymous")}
      >
        Sign in
      </button>
      </Card>
    </div>
  );
}
