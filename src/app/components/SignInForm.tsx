"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { Card, Bubble } from "pixel-retroui";
import Image from "next/image";

export function SignInForm() {
  const { signIn } = useAuthActions();

  return (
    <div className="w-full">
      <Bubble direction="left" className="w-1/2">
        Ask me about any health concerns and I will give you a list of
        challenges to complete! Compete with other patients and earn apples. You
        can also steal other&apos;s tasks! Make sure to have a photo as proof.
      </Bubble>
      <Image
        src="/doctorTalk2.svg"
        alt="Logo"
        className="-ml-16"
        width={100}
        height={100}
      />
      <Card className="flex items-center justify-center">
        <button
          type="button"
          className="auth-button"
          onClick={() => void signIn("anonymous")}
        >
          Get Started!
        </button>
      </Card>
    </div>
  );
}
