"use client";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function BackgroundProvider({ children }: { children: React.ReactNode }) {
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
    <div className="min-h-screen flex flex-col bg-white" style={backgroundStyle}>
      {children}
    </div>
  );
}