import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ImagePlus, Loader2, Upload } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useUploadPhoto } from "../hooks/useQueries";

export default function UploadZone() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const uploadMutation = useUploadPhoto();

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const imageFiles = Array.from(files).filter((f) =>
        f.type.startsWith("image/"),
      );
      if (imageFiles.length === 0) {
        toast.error("Please select image files only");
        return;
      }
      for (const file of imageFiles) {
        setProgress(0);
        try {
          await uploadMutation.mutateAsync({
            file,
            onProgress: setProgress,
          });
          toast.success(`"${file.name}" uploaded successfully`);
        } catch {
          toast.error(`Failed to upload "${file.name}"`);
        }
      }
      setProgress(0);
    },
    [uploadMutation],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  return (
    <div className="mb-8">
      <motion.div
        data-ocid="gallery.dropzone"
        className={`relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/30"
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.998 }}
      >
        <div className="flex flex-col items-center justify-center gap-3 py-10 px-6">
          <div className="rounded-full bg-muted p-4">
            <AnimatePresence mode="wait">
              {uploadMutation.isPending ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Loader2 className="h-7 w-7 text-primary animate-spin" />
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ImagePlus className="h-7 w-7 text-primary" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="text-center">
            <p className="font-display font-semibold text-foreground">
              Drop photos here or{" "}
              <span className="text-primary">browse files</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Supports JPG, PNG, GIF, WebP, and more
            </p>
          </div>
          <Button
            data-ocid="gallery.upload_button"
            variant="outline"
            size="sm"
            className="gap-2 border-border hover:border-primary hover:text-primary"
            disabled={uploadMutation.isPending}
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            <Upload className="h-3.5 w-3.5" />
            Select Photos
          </Button>
        </div>

        {/* Upload Progress */}
        <AnimatePresence>
          {uploadMutation.isPending && (
            <motion.div
              data-ocid="gallery.upload.loading_state"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-6 pb-4"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">
                  Uploading...
                </span>
                <span className="text-xs text-primary font-medium">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
