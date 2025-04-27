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
  const [showCompleted, setShowCompleted] = useState(false);
  const [activeSearch, setActiveSearch] = useState("");
  const debouncedSearchQuery = useDebounce(activeSearch, 300);

  const searchResults = useQuery(
    api.challenges.search,
    debouncedSearchQuery ? { query: debouncedSearchQuery } : "skip",
  );

  const allChallenges = useQuery(api.challenges.list);
  const challenges = debouncedSearchQuery ? searchResults : allChallenges;

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

  const handleSearch = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    setActiveSearch(searchInput);
  };

  if (!challenges) return null;

  const activeChallenges = challenges.filter(
    (challenge) => challenge.status === "active",
  );
  const completedChallenges = challenges.filter(
    (challenge) => challenge.status === "completed",
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <Card>
            <h2 className="text-2xl font-bold p-4">Challenges</h2>
          </Card>
          <Card>
            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="bg-indigo-500 text-white rounded px-4 py-2 hover:bg-indigo-600"
            >
              {showForm ? "Cancel" : "Create your own challenge"}
            </button>
          </Card>
        </div>
        <form onSubmit={handleSearch} className="flex items-center mb-12">
          <Card className="w-full">
            <div className="flex items-center gap-2">
              <Image
                src="/magnifyingGlass.svg"
                alt="Magnifying Glass"
                width={60}
                height={60}
              />
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="Search challenges..."
                  className="w-full"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  bg="#fefcd0"
                  textColor="black"
                  borderColor="black"
                />
                <Button
                  type="submit"
                  className="bg-indigo-500 text-white rounded px-4 py-2 hover:bg-indigo-600"
                >
                  Search
                </Button>
              </div>
            </div>
          </Card>
        </form>
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
                className="w-full rounded p-2"
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

      <div className="grid">
        <div className="w-[800px] mx-auto">
          <Card>
            <h3 className="text-xl font-semibold mb-4 p-4">Active Challenges</h3>
          </Card>
          {activeChallenges.map((challenge) => (
            <Challenge key={challenge._id} challenge={challenge} />
          ))}
          {activeChallenges.length === 0 && (
            <p className="text-gray-500 text-center">No active challenges</p>
          )}
        </div>

        <div className="w-[800px] mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Card>
              <h3 className="text-xl font-semibold p-4">Completed Challenges</h3>
            </Card>
            <Button
              onClick={() => setShowCompleted(!showCompleted)}
              className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300"
            >
              {showCompleted ? "Hide" : "Show"}
            </Button>
          </div>

          {showCompleted && (
            <div className="space-y-8">
              {completedChallenges.map((challenge) => (
                <Challenge key={challenge._id} challenge={challenge} />
              ))}
              {completedChallenges.length === 0 && (
                <p className="text-gray-500 text-center">
                  No completed challenges
                </p>
              )}
            </div>
          )}
        </div>
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
  const [uploadingTasks, setUploadingTasks] = useState<Set<Id<"tasks">>>(new Set());

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
    setUploadingTasks(prev => {
      const newSet = new Set(prev);
      newSet.add(taskId);
      return newSet;
    });
  };

  const handleCancelComplete = (taskId: Id<"tasks">) => {
    setUploadingTasks(prev => {
      const newSet = new Set(prev);
      newSet.delete(taskId);
      return newSet;
    });
  };

  const handleTaskCompleted = (taskId: Id<"tasks">) => {
    setUploadingTasks(prev => {
      const newSet = new Set(prev);
      newSet.delete(taskId);
      return newSet;
    });
  };

  if (!tasks) return null;

  return (
    <div className="relative flex flex-col items-center my-32 w-[800px] mx-auto">
      <div className="absolute -top-28 z-10">
        <Image src="/clip.svg" alt="Clip" width={300} height={300} />
      </div>

      <Card borderColor="#697786" className="w-full">
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
              {challenge.status === "active" && (
                <Card>
                  <button
                    type="button"
                    onClick={() => setShowTaskForm(!showTaskForm)}
                    className="text-sm bg-slate-100 px-3 py-1 rounded hover:bg-slate-200"
                  >
                    {showTaskForm ? "Cancel" : "Add Task"}
                  </button>
                </Card>
              )}
            </div>

            {showTaskForm && challenge.status === "active" && (
              <form onSubmit={handleSubmit} className="space-y-4 mb-4">
                <Card>
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="Task title"
                    className="w-full rounded p-2"
                    required
                  />
                </Card>
                <Card>
                  <textarea
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    placeholder="Task description"
                    className="w-full rounded p-2"
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

                const isUploading = uploadingTasks.has(typedTask._id);

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
                              !isUploading && (
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

                          {isUploading &&
                            typedTask.status === "pending" && (
                              <div className="w-full">
                                <div className="mt-4 flex justify-end">
                                  <Button
                                    onClick={() => handleCancelComplete(typedTask._id)}
                                    className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-500 hover:text-white"
                                    shadow="red"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                                <ImageUploader 
                                  taskId={typedTask._id} 
                                  onComplete={() => handleTaskCompleted(typedTask._id)}
                                />
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
