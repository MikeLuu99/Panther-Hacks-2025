"use client";
import { Store } from "@/app/components/Store";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Toaster } from "sonner";
import Image from "next/image";
import Link from "next/link";

export default function StorePage() {
  const profile = useQuery(api.profiles.get);

  // Check if profile exists and if it has selectedBackground property
  const backgroundStyle =
    profile &&
    "selectedBackground" in profile &&
    typeof profile.selectedBackground === "string"
      ? {
          backgroundImage: `url(${profile.selectedBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }
      : {};

  return (
    <div
      className="min-h-screen flex flex-col bg-white"
      style={backgroundStyle}
    >
      <header className="sticky top-0 z-10 bg-white border-b p-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="hover:bg-[#D3D3D3] rounded transform transition duration-300">
            <Image
              src="/doctor.svg"
              alt="Website Logo"
              width={60}
              height={60}
              priority
            />
          </div>
          <span className="text-xl font-semibold">Doctor Sandie Store</span>
        </Link>
        <div className="flex items-center gap-4">
          {profile && (
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
          )}
        </div>
      </header>
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <Store />
        </div>
      </main>
      <Toaster />
    </div>
  );
}
