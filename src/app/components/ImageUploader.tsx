import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { Button, Card } from "pixel-retroui";
import type { Id } from "../../../convex/_generated/dataModel";

export function ImageUploader({ taskId }: { taskId: Id<"tasks"> }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isImageSaved, setIsImageSaved] = useState(false);
  const generateUploadUrl = useMutation(api.images.generateUploadUrl);
  const saveImage = useMutation(api.images.saveImage);
  const completeTask = useMutation(api.challenges.completeTask);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const previewUrl = URL.createObjectURL(selectedFile);
      setPreview(previewUrl);
      setIsImageSaved(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setIsUploading(true);
      const uploadUrl = await generateUploadUrl();

      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();

      await saveImage({
        storageId,
        fileName: file.name,
        description: "Task completion image",
        mimeType: file.type,
        size: file.size,
        taskId,
      });

      toast.success("Image uploaded successfully!");
      setIsImageSaved(true);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleComplete = async () => {
    if (!isImageSaved) {
      toast.error("Please upload an image first");
      return;
    }

    try {
      await completeTask({ taskId });
      toast.success("Task completed successfully!");

      if (preview) {
        URL.revokeObjectURL(preview);
      }
      setFile(null);
      setPreview(null);
      setIsImageSaved(false);
    } catch (error) {
      console.error("Task completion failed:", error);
      toast.error("Failed to complete task");
    }
  };

  return (
    <div className="grid w-full max-w-sm items-center gap-4">
      <div>
        <Card>
          <Label htmlFor="picture">Upload completion picture</Label>
          <Input
            id="picture"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </Card>
      </div>

      {preview && (
        <div className="mt-4 flex justify-center">
          <img
            src={preview}
            alt="Preview"
            className="max-w-full h-auto rounded-lg"
            style={{ maxHeight: "200px" }}
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        {file && !isImageSaved && (
          <Button
            onClick={handleUpload}
            disabled={isUploading}
            className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600 disabled:opacity-50"
          >
            {isUploading ? "Uploading..." : "Upload Image"}
          </Button>
        )}

        {isImageSaved && file && (
          <Button
            onClick={handleComplete}
            className="bg-green-500 text-white rounded px-4 py-2 hover:bg-green-600"
          >
            Complete Task
          </Button>
        )}
      </div>
    </div>
  );
}
