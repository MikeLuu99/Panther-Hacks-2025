import { TextArea, Button, Card } from "pixel-retroui";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";

export function PromptInput() {
  const [prompt, setPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState<null | {
    title: string;
    description: string;
    tasks: Array<{ task: string; description: string }>;
  }>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const createChallenge = useMutation(api.challenges.create);
  const createTask = useMutation(api.challenges.createTask);

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt first!");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/challenge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: prompt }),
      });

      if (!response.ok) throw new Error("Failed to get AI response");

      const data = await response.json();
      setAiResponse(data);
    } catch (error) {
      toast.error("Failed to generate challenge");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateChallenge = async () => {
    if (!aiResponse) return;

    setIsCreating(true);
    try {
      // First create the main challenge and get its ID
      const challengeId = await createChallenge({
        title: aiResponse.title,
        description: aiResponse.description,
      });
      // Create tasks for the challenge using the challengeId
      if (challengeId) {
        for (const task of aiResponse.tasks) {
          await createTask({
            challengeId,
            title: task.task,
            description: task.description,
          });
        }
      }

      toast.success("Challenge created successfully!");
      setAiResponse(null);
      setPrompt("");
    } catch (error) {
      toast.error("Failed to create challenge");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <TextArea
          bg="#fefcd0"
          textColor="black"
          borderColor="black"
          placeholder="Enter your text here..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="self-start"
        >
          {isLoading ? "Generating..." : "Generate Challenge"}
        </Button>
      </div>

      {aiResponse && (
        <Card>
        <div className="mt-4 p-4 rounded-lg bg-white">
          <h3 className="text-xl font-bold mb-2">{aiResponse.title}</h3>
          <p className="mb-4 text-gray-600">{aiResponse.description}</p>

          <h4 className="font-semibold mb-2">Tasks:</h4>
          <ul className="list-disc pl-5 mb-4">
            {aiResponse.tasks.map((task) => (
              <li key={`${task.task}-${task.description}`} className="mb-2">
                <p className="font-medium">{task.task}</p>
                <p className="text-sm text-gray-600">{task.description}</p>
              </li>
            ))}
          </ul>

          <Button onClick={handleCreateChallenge} disabled={isCreating}>
            {isCreating ? "Creating..." : "Take on this challenge"}
          </Button>
        </div>
        </Card>
      )}
    </div>
  );
}
