"use client";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { ImageUploader } from "./ImageUploader";
import type { Id } from "../../../convex/_generated/dataModel";
import {
  Card,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Button,
  Input,
} from "pixel-retroui";
import Image from "next/image";
import { Label } from "@/components/ui/label";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function ChallengesList() {
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearchQuery = useDebounce(searchInput, 300);

  const challenges = useQuery(
    debouncedSearchQuery ? api.challenges.search : api.challenges.list,
    debouncedSearchQuery ? { query: debouncedSearchQuery } : {},
  );
  const createChallenge = useMutation(api.challenges.create);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createChallenge({ title, description });
      setTitle("");
      setDescription("");
      setShowForm(false);
      toast.success("Challenge created!");
    } catch {
      toast.error("Failed to create challenge");
    }
  };

  if (!challenges) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Challenges</h2>
          <Card>
            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="bg-indigo-500 text-white rounded px-4 py-2 hover:bg-indigo-600"
            >
              {showForm ? "Cancel" : "New Challenge"}
            </button>
          </Card>
        </div>
        <div className="flex items-center mb-12">
          <Image
            src="/magnifyingGlass.svg"
            alt="Magnifying Glass"
            width={60}
            height={60}
          />
          <Input
            placeholder="Search challenges..."
            className="w-full"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            bg="#fefcd0"
            textColor="black"
            borderColor="black"
          />
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-4 rounded bg-white"
        >
          <Card>
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Challenge title"
                className="w-full rounded p-2"
                required
              />
            </div>
          </Card>
          <Card>
            <div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Challenge description"
                className="w-full  rounded p-2"
                required
              />
            </div>
          </Card>
          <Card className="flex justify-center">
            <Button
              type="submit"
              className="bg-indigo-500 text-white rounded px-4 py-2 hover:bg-indigo-600"
            >
              Create Challenge
            </Button>
          </Card>
        </form>
      )}

      <div className="grid gap-32">
        {challenges.map((challenge) => (
          <Challenge key={challenge._id} challenge={challenge} />
        ))}
      </div>
    </div>
  );
}

type Task = {
  _id: Id<"tasks">;
  title: string;
  description: string;
  status: "pending" | "completed";
  completedBy?: string;
  completedAt?: number;
  imageId?: Id<"images">;
};

type Challenge = {
  _id: Id<"challenges">;
  title: string;
  description: string;
  status: "active" | "completed";
};

function Challenge({ challenge }: { challenge: Challenge }) {
  const tasks = useQuery(api.challenges.getTasks, {
    challengeId: challenge._id,
  });
  const createTask = useMutation(api.challenges.createTask);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [showUploader, setShowUploader] = useState<Id<"tasks"> | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTask({
        challengeId: challenge._id,
        title: taskTitle,
        description: taskDescription,
      });
      setTaskTitle("");
      setTaskDescription("");
      setShowTaskForm(false);
      toast.success("Task created!");
    } catch {
      toast.error("Failed to create task");
    }
  };

  const handleStartComplete = (taskId: Id<"tasks">) => {
    setShowUploader(taskId);
  };

  const handleCancelComplete = () => {
    setShowUploader(null);
  };

  if (!tasks) return null;

  return (
    <div className="relative flex flex-col items-center">
      <div className="absolute -top-28 z-10">
        <Image src="/clip.svg" alt="Clip" width={300} height={300} />
      </div>

      <Card borderColor="#697786">
        <div className="relative z-1 p-4 space-y-4">
          <div className="text-center flex flex-col items-center">
            <Image
              src="/healthSign.svg"
              alt="Health Sign"
              width={200}
              height={200}
            />
            <h3 className="text-xl font-semibold">{challenge.title}</h3>
            <p className="text-slate-600">{challenge.description}</p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold">Tasks</h4>
              <div className="text-sm bg-slate-000 px-3 py-1 rounded hover:bg-slate-300 transition-colors duration-200">
              <Card>
              
                <button
                  type="button"
                  onClick={() => setShowTaskForm(!showTaskForm)}
                >
                  {showTaskForm ? "Cancel" : "Add Task"}
                </button>
              </Card>
              </div>
            </div>

            {showTaskForm && (
              <form onSubmit={handleSubmit} className="space-y-4 mb-4">
                <Card>
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="Task title"
                    className="w-full  rounded p-2"
                    required
                  />
                </Card>
                <Card>
                  <textarea
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    placeholder="Task description"
                    className="w-full  rounded p-2"
                    required
                  />
                </Card>
                <Card className="flex justify-center">
                  <Button
                    type="submit"
                    className="bg-indigo-500 text-white rounded px-4 py-2 hover:bg-indigo-600"
                  >
                    Create Task
                  </Button>
                </Card>
              </form>
            )}

            <Accordion collapsible={false}>
              {tasks.map((task) => {
                const typedTask: Task = {
                  _id: task._id,
                  title: task.title,
                  description: task.description || "",
                  status: task.status,
                  completedBy: task.completedBy,
                  completedAt: task.completedAt,
                  imageId: task.imageId,
                };

                return (
                  <AccordionItem key={typedTask._id} value={typedTask._id}>
                    <AccordionTrigger>
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">{typedTask.title}</span>
                        {typedTask.status === "completed" && (
                          <span className="text-sm text-green-600">✓ Done</span>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="p-2">
                        <p className="text-sm text-slate-600 mb-2">
                          {typedTask.description}
                        </p>
                        <div className="flex flex-col gap-4 items-center">
                          <div className="flex justify-between items-center w-full">
                            <div>
                              {typedTask.status === "completed" && (
                                <div className="text-xs text-slate-500">
                                  <div>
                                    Completed by {typedTask.completedBy}
                                  </div>
                                  <div className="text-slate-400">
                                    {typedTask.completedAt &&
                                      new Date(
                                        typedTask.completedAt,
                                      ).toLocaleDateString()}
                                  </div>
                                </div>
                              )}
                            </div>
                            {typedTask.status === "pending" &&
                              !showUploader && (
                                <Button
                                  onClick={() =>
                                    handleStartComplete(typedTask._id)
                                  }
                                  className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-500 hover:text-white"
                                  shadow="green"
                                >
                                  Complete?
                                </Button>
                              )}
                          </div>

                          {showUploader === typedTask._id &&
                            typedTask.status === "pending" && (
                              <div className="w-full">
                                <div className="mt-4 flex justify-end">
                                  <Button
                                    onClick={handleCancelComplete}
                                    className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-500 hover:text-white"
                                    shadow="red"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                                <ImageUploader taskId={typedTask._id} />
                              </div>
                            )}

                          {typedTask.status === "completed" &&
                            typedTask.imageId && (
                              <CompletionImage imageId={typedTask.imageId} />
                            )}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </div>
      </Card>
    </div>
  );
}

function CompletionImage({ imageId }: { imageId: Id<"images"> }) {
  const image = useQuery(api.images.getById, { id: imageId });

  if (!image || !image.url) return null;

  return (
    <div className="mt-4">
      <Label>Completion Image</Label>
      <div className="relative w-full h-[400px] mt-2">
        <Image
          src={image.url}
          alt="Task completion"
          style={{ objectFit: "contain" }}
          className="rounded-lg"
          width={500}
          height={300}
        />
      </div>
    </div>
  );
}
