"use client";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Card } from "pixel-retroui";

export function NicknameForm() {
  const [nickname, setNickname] = useState("");
  const createProfile = useMutation(api.profiles.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProfile({ nickname });
      toast.success("Profile created!");
    } catch (error) {
      toast.error("Failed to create profile", {
        description: error instanceof Error ? error.message : String(error),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto">
      <div className="flex flex-col gap-4">
      <Card>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Enter your nickname"
          className="text-center"
          required
        />
        </Card>
        <Card>
        <button
          type="submit"
          className="bg-indigo-500 text-white rounded px-4 py-2 hover:bg-indigo-600"
        >
          Set Nickname
        </button>
        </Card>
      </div>
    </form>
  );
}
