"use client";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Image from "next/image";
import Link from "next/link";
import { useScrollDirection } from "../hooks/useScrollDirection";

export default function LeaderboardPage() {
  const topUsers = useQuery(api.profiles.getTopUsers);
  const isVisible = useScrollDirection();

  return (
    <div className="flex flex-col">
      <header
        className={`header sticky top-0 z-10 bg-white border-b p-4 flex justify-between items-center ${!isVisible ? "header-hidden" : ""}`}
      >
        <div className="flex items-center gap-4">
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
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Image
            src="/leaderboard.svg"
            alt="Leaderboard"
            width={40}
            height={40}
            priority
          />
          <h1 className="text-2xl font-bold">Leaderboard</h1>
        </div>
        <div className="w-[60px]" /> {/* Spacer for balanced layout */}
      </header>

      <main className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="space-y-4">
                {topUsers?.map((user, index) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-slate-500 w-8">
                        {index + 1}
                      </span>
                      <span className="text-lg font-medium">
                        {user.nickname}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-semibold text-indigo-600">
                        {user.score}
                      </span>
                      <Image
                        src="/apple.svg"
                        alt="apple score"
                        width={20}
                        height={20}
                        className="inline-block"
                        priority
                      />
                    </div>
                  </div>
                ))}

                {!topUsers && (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
                  </div>
                )}

                {topUsers?.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    No users found
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
