import { Button } from "@/components/ui/button";
import { RefreshCw, Trash2, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { PhotoWithId } from "../hooks/useQueries";

interface GalleryPhotoCardProps {
  photo: PhotoWithId;
  index: number;
  onDelete: (photoId: string) => void;
  onPreview: (photo: PhotoWithId) => void;
  isDeleting: boolean;
  ocidPrefix: string;
}

interface TrashPhotoCardProps {
  photo: PhotoWithId;
  index: number;
  onRecover: (photoId: string) => void;
  onPermanentDelete: (photoId: string) => void;
  onPreview: (photo: PhotoWithId) => void;
  isRecovering: boolean;
  isDeleting: boolean;
  ocidPrefix: string;
}

function formatDate(nanos: bigint): string {
  return new Date(Number(nanos / 1_000_000n)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function GalleryPhotoCard({
  photo,
  index,
  onDelete,
  onPreview,
  isDeleting,
  ocidPrefix,
}: GalleryPhotoCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      data-ocid={`${ocidPrefix}.item.${index}`}
      className="photo-card group relative rounded-lg overflow-hidden bg-card border border-border cursor-pointer"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.4) }}
      whileHover={{ scale: 1.02 }}
      style={{ aspectRatio: "1" }}
    >
      {/* Thumbnail */}
      <button
        type="button"
        className="w-full h-full block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        onClick={() => onPreview(photo)}
        aria-label={`Preview ${photo.name}`}
      >
        {imageError ? (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <span className="text-xs text-muted-foreground">No preview</span>
          </div>
        ) : (
          <img
            src={photo.blob.getDirectURL()}
            alt={photo.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        )}
      </button>

      {/* Hover overlay */}
      <div className="photo-card-overlay absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

      {/* Actions overlay */}
      <div className="photo-card-overlay absolute inset-0 flex flex-col justify-between p-3 pointer-events-none">
        <div className="flex justify-end pointer-events-auto">
          <Button
            data-ocid={`${ocidPrefix}.photo.delete_button.${index}`}
            variant="destructive"
            size="icon"
            className="h-8 w-8 rounded-full shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(photo.photoId);
            }}
            disabled={isDeleting}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="pointer-events-none">
          <p className="text-white text-xs font-medium truncate">
            {photo.name}
          </p>
          <p className="text-white/60 text-xs">
            {formatDate(photo.uploadedAt)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function TrashPhotoCard({
  photo,
  index,
  onRecover,
  onPermanentDelete,
  onPreview,
  isRecovering,
  isDeleting,
  ocidPrefix,
}: TrashPhotoCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      data-ocid={`${ocidPrefix}.item.${index}`}
      className="photo-card group relative rounded-lg overflow-hidden bg-card border border-border cursor-pointer"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.4) }}
      whileHover={{ scale: 1.02 }}
      style={{ aspectRatio: "1" }}
    >
      {/* Thumbnail */}
      <button
        type="button"
        className="w-full h-full block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        onClick={() => onPreview(photo)}
        aria-label={`Preview ${photo.name}`}
      >
        {imageError ? (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <span className="text-xs text-muted-foreground">No preview</span>
          </div>
        ) : (
          <img
            src={photo.blob.getDirectURL()}
            alt={photo.name}
            className="w-full h-full object-cover opacity-70"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        )}
      </button>

      {/* Overlay */}
      <div className="photo-card-overlay absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

      {/* Actions */}
      <div className="photo-card-overlay absolute inset-0 flex flex-col justify-between p-3 pointer-events-none">
        <div className="flex justify-end gap-1.5 pointer-events-auto">
          <Button
            data-ocid={`${ocidPrefix}.photo.recover_button.${index}`}
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full shadow-lg bg-black/50 border-white/20 text-white hover:bg-primary hover:text-primary-foreground hover:border-primary"
            onClick={(e) => {
              e.stopPropagation();
              onRecover(photo.photoId);
            }}
            disabled={isRecovering}
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button
            data-ocid={`${ocidPrefix}.photo.delete_button.${index}`}
            variant="destructive"
            size="icon"
            className="h-8 w-8 rounded-full shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              onPermanentDelete(photo.photoId);
            }}
            disabled={isDeleting}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="pointer-events-none">
          <p className="text-white text-xs font-medium truncate">
            {photo.name}
          </p>
          {photo.deletedAt && (
            <p className="text-white/60 text-xs">
              Deleted {formatDate(photo.deletedAt)}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
