import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { Button, Card } from "pixel-retroui";
import type { Id } from "../../../convex/_generated/dataModel";
import { Camera } from "react-camera-pro";

export function ImageUploader({ taskId }: { taskId: Id<"tasks"> }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isImageSaved, setIsImageSaved] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const camera = useRef<{ takePhoto: () => string }>(null);

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

  const handleCameraCapture = () => {
    try {
      const photoData = camera.current?.takePhoto();
      if (photoData) {
        // Convert base64 to blob
        fetch(photoData)
          .then((res) => res.blob())
          .then((blob) => {
            const imageFile = new File([blob], "camera-capture.jpg", {
              type: "image/jpeg",
            });
            setFile(imageFile);
            setPreview(photoData);
            setShowCamera(false);
            setIsImageSaved(false);
          });
      }
    } catch (error) {
      console.error("Failed to capture photo:", error);
      toast.error("Failed to capture photo");
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
    <div className="w-full max-w-sm flex flex-col items-center justify-center gap-4 mx-auto">
      {!showCamera ? (
        <>
          <div className="flex justify-center w-full">
            <Card className="w-full text-center">
              <Label htmlFor="picture" className="block text-center">
                Upload completion picture
              </Label>
              <Input
                id="picture"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
                className="mx-auto"
              />
            </Card>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={() => setShowCamera(true)}
              className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600"
            >
              Use Camera Instead
            </Button>
          </div>
        </>
      ) : (
        <div className="space-y-4 w-full flex flex-col items-center">
          <div className="relative h-[300px] w-full flex justify-center">
            <Camera ref={camera} aspectRatio={16 / 9} errorMessages={{}} />
          </div>
          <div className="flex justify-center gap-2">
            <Button
              onClick={handleCameraCapture}
              className="bg-green-500 text-white rounded px-4 py-2 hover:bg-green-600"
            >
              Take Photo
            </Button>
            <Button
              onClick={() => setShowCamera(false)}
              className="bg-gray-500 text-white rounded px-4 py-2 hover:bg-gray-600"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
      {preview && (
        <div className="mt-4 flex justify-center">
          <img
            src={preview}
            alt="Preview"
            className="max-w-full h-auto rounded-lg"
            style={{ maxHeight: "200px" }}
          />
        </div>
      )}{" "}
      <div className="flex flex-col items-center gap-2 w-full">
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
