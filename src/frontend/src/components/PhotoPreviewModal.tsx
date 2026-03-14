import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Download, X } from "lucide-react";
import { motion } from "motion/react";
import type { PhotoWithId } from "../hooks/useQueries";

interface PhotoPreviewModalProps {
  photo: PhotoWithId | null;
  onClose: () => void;
}

function formatBytes(bytes: bigint): string {
  const n = Number(bytes);
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(nanos: bigint): string {
  return new Date(Number(nanos / 1_000_000n)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function PhotoPreviewModal({
  photo,
  onClose,
}: PhotoPreviewModalProps) {
  return (
    <Dialog open={!!photo} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        data-ocid="preview.modal"
        className="max-w-5xl w-full bg-card border-border p-0 overflow-hidden"
      >
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <h2 className="font-display font-semibold text-foreground truncate max-w-xs md:max-w-lg">
              {photo?.name}
            </h2>
            <Button
              data-ocid="preview.close_button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="shrink-0 hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Image */}
          {photo && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="relative bg-black flex items-center justify-center"
              style={{ maxHeight: "60vh" }}
            >
              <img
                src={photo.blob.getDirectURL()}
                alt={photo.name}
                className="object-contain w-full"
                style={{ maxHeight: "60vh" }}
              />
            </motion.div>
          )}

          {/* Meta */}
          {photo && (
            <div className="flex flex-wrap gap-6 px-5 py-4 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Size</p>
                <p className="text-sm font-medium">{formatBytes(photo.size)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Uploaded</p>
                <p className="text-sm font-medium">
                  {formatDate(photo.uploadedAt)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Type</p>
                <p className="text-sm font-medium">{photo.mimeType}</p>
              </div>
              {photo.deletedAt && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Deleted</p>
                  <p className="text-sm font-medium">
                    {formatDate(photo.deletedAt)}
                  </p>
                </div>
              )}
              <div className="ml-auto">
                <a
                  href={photo.blob.getDirectURL()}
                  download={photo.name}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-border hover:border-primary hover:text-primary"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </Button>
                </a>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
