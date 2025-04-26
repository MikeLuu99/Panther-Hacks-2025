"use client";
import { useState } from "react";
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
} from "pixel-retroui";
import Image from "next/image";

export function ChallengesList() {
  const challenges = useQuery(api.challenges.list);
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

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-4 border rounded bg-white"
        >
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Challenge title"
              className="w-full border rounded p-2"
              required
            />
          </div>
          <div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Challenge description"
              className="w-full border rounded p-2"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-500 text-white rounded px-4 py-2 hover:bg-indigo-600"
          >
            Create Challenge
          </button>
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
              <Card>
                <button
                  type="button"
                  onClick={() => setShowTaskForm(!showTaskForm)}
                  className="text-sm bg-slate-100 px-3 py-1 rounded hover:bg-slate-200"
                >
                  {showTaskForm ? "Cancel" : "Add Task"}
                </button>
              </Card>
            </div>

            {showTaskForm && (
              <form onSubmit={handleSubmit} className="space-y-4 mb-4">
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Task title"
                  className="w-full border rounded p-2"
                  required
                />
                <textarea
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Task description"
                  className="w-full border rounded p-2"
                  required
                />
                <Card>
                  <button
                    type="submit"
                    className="bg-indigo-500 text-white rounded px-4 py-2 hover:bg-indigo-600"
                  >
                    Create Task
                  </button>
                </Card>
              </form>
            )}

            <Accordion collapsible={false}>
              {tasks.map((task: Task) => (
                <AccordionItem key={task._id} value={task._id}>
                  <AccordionTrigger>
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">{task.title}</span>
                      {task.status === "completed" && (
                        <span className="text-sm text-green-600">✓ Done</span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="p-2">
                      <p className="text-sm text-slate-600 mb-2">
                        {task.description}
                      </p>
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                          <div>
                            {task.status === "completed" && (
                              <div className="text-xs text-slate-500">
                                <div>Completed by {task.completedBy}</div>
                                <div className="text-slate-400">
                                  {task.completedAt &&
                                    new Date(
                                      task.completedAt,
                                    ).toLocaleDateString()}
                                </div>
                              </div>
                            )}
                          </div>
                          {task.status === "pending" && !showUploader && (
                            <button
                              type="button"
                              onClick={() => handleStartComplete(task._id)}
                              className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200"
                            >
                              Upload Completion Image
                            </button>
                          )}
                        </div>

                        {showUploader === task._id &&
                          task.status === "pending" && (
                            <ImageUploader taskId={task._id} />
                          )}

                        {task.status === "completed" && task.imageId && (
                          <CompletionImage imageId={task.imageId} />
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
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
      <div className="relative w-full h-[200px] mt-2">
        <Image
          src={image.url}
          alt="Task completion"
          fill
          style={{ objectFit: 'contain' }}
          className="rounded-lg"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    </div>
  );
}
