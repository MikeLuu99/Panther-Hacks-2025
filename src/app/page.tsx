"use client";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SignInForm } from "@/app/components/SignInForm";
import { Toaster } from "sonner";
import { NicknameForm } from "@/app/components/NicknameForm";
import { ChallengesList } from "@/app/components/ChallengeList";
import { PromptInput } from "@/app/components/PromptInput";
import Image from "next/image";
import Link from "next/link";
import { useScrollDirection } from "./hooks/useScrollDirection";
// import { Card } from "pixel-retroui";

export default function Home() {
  const isVisible = useScrollDirection();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header
        className={`header sticky top-0 z-10 bg-white border-b p-4 flex justify-between items-center ${!isVisible ? "header-hidden" : ""}`}
      >
        <div className="flex items-center gap-2">
          <Image
            src="/doctor.svg"
            alt="Website Logo"
            width={60}
            height={60}
            priority
          />
        </div>
        <div className="flex items-center gap-4">
          <UserScore />
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/leaderboard"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            <Image
              src="/leaderboard.svg"
              alt="Leaderboard"
              width={50}
              height={50}
              priority
            />
          </Link>
        </div>
      </header>
      <main className="flex-1 p-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <Content />
        </div>
      </main>
      <Toaster />
    </div>
  );
}

function UserScore() {
  const profile = useQuery(api.profiles.get);

  if (!profile) return null;

  return (
    <div className="text-xl font-medium flex items-center gap-2">
      Score:{" "}
      <span className="text-indigo-600 flex items-center gap-1">
        {profile.score || 0}{" "}
        <Image
          src="/apple.svg"
          alt="apple score"
          width={20}
          height={20}
          className="inline-block"
          priority
        />
      </span>
    </div>
  );
}

function Content() {
  const profile = useQuery(api.profiles.get);

  if (profile === undefined) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold accent-text mb-4">Doctor Sandie</h1>
        <Authenticated>
          {profile ? (
            <p className="text-xl text-slate-600">
              Welcome, {profile.nickname}!
            </p>
          ) : (
            <NicknameForm />
          )}
        </Authenticated>
        <Unauthenticated>
          <p className="text-xl text-slate-600">Sign in to get started</p>
        </Unauthenticated>
      </div>

      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>

      <Authenticated>
        {profile && (
          <>
            <PromptInput />
            <ChallengesList />
          </>
        )}
      </Authenticated>
    </div>
  );
}
