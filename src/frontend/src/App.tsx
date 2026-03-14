import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, ImageOff, Loader2, LogOut, Trash2, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { GalleryPhotoCard, TrashPhotoCard } from "./components/PhotoCard";
import PhotoPreviewModal from "./components/PhotoPreviewModal";
import UploadZone from "./components/UploadZone";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  useActivePhotos,
  useEmptyTrash,
  usePermanentlyDelete,
  useRecoverPhoto,
  useSoftDelete,
  useTrashedPhotos,
} from "./hooks/useQueries";
import type { PhotoWithId } from "./hooks/useQueries";

// ─── Auth Gate ────────────────────────────────────────────────────────────────
function AuthGate({ children }: { children: React.ReactNode }) {
  const { login, loginStatus, identity, isInitializing } =
    useInternetIdentity();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!identity) {
    return (
      <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "url('/assets/generated/photo-hero-bg.dim_1600x400.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-md"
          >
            <div className="inline-flex items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 p-4 mb-6">
              <Camera className="h-10 w-10 text-primary" />
            </div>
            <h1 className="font-display text-4xl font-bold text-foreground mb-3">
              Photo<span className="text-primary">Recover</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Safely store and manage your photos. Accidentally deleted
              something? Recover it instantly from the trash.
            </p>
            <Button
              onClick={() => login()}
              disabled={loginStatus === "logging-in"}
              size="lg"
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8"
            >
              {loginStatus === "logging-in" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <User className="h-4 w-4" />
              )}
              Sign in to continue
            </Button>
          </motion.div>
        </div>

        <footer className="relative z-10 py-4 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary transition-colors"
            >
              Built with ♥ using caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    );
  }

  return <>{children}</>;
}

// ─── Main App ─────────────────────────────────────────────────────────────────
function PhotoRecoverApp() {
  const { clear, identity } = useInternetIdentity();
  const [previewPhoto, setPreviewPhoto] = useState<PhotoWithId | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [recoveringId, setRecoveringId] = useState<string | null>(null);
  const [permanentDeletingId, setPermanentDeletingId] = useState<string | null>(
    null,
  );

  const { data: activePhotos, isLoading: loadingActive } = useActivePhotos();
  const { data: trashedPhotos, isLoading: loadingTrashed } = useTrashedPhotos();
  const softDelete = useSoftDelete();
  const recoverPhoto = useRecoverPhoto();
  const permanentlyDelete = usePermanentlyDelete();
  const emptyTrash = useEmptyTrash();

  const handleDelete = async (photoId: string) => {
    setDeletingId(photoId);
    try {
      await softDelete.mutateAsync(photoId);
      toast.success("Photo moved to trash");
    } catch {
      toast.error("Failed to delete photo");
    } finally {
      setDeletingId(null);
    }
  };

  const handleRecover = async (photoId: string) => {
    setRecoveringId(photoId);
    try {
      await recoverPhoto.mutateAsync(photoId);
      toast.success("Photo recovered");
    } catch {
      toast.error("Failed to recover photo");
    } finally {
      setRecoveringId(null);
    }
  };

  const handlePermanentDelete = async (photoId: string) => {
    setPermanentDeletingId(photoId);
    try {
      await permanentlyDelete.mutateAsync(photoId);
      toast.success("Photo permanently deleted");
    } catch {
      toast.error("Failed to delete photo");
    } finally {
      setPermanentDeletingId(null);
    }
  };

  const handleEmptyTrash = async () => {
    try {
      await emptyTrash.mutateAsync();
      toast.success("Trash emptied");
    } catch {
      toast.error("Failed to empty trash");
    }
  };

  const principal = identity?.getPrincipal().toString();
  const shortPrincipal = principal
    ? `${principal.slice(0, 5)}...${principal.slice(-3)}`
    : "";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            <span className="font-display font-bold text-lg">
              Photo<span className="text-primary">Recover</span>
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <User className="h-3 w-3 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground hidden sm:block">
                  {shortPrincipal}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border">
              <DropdownMenuItem
                onClick={() => clear()}
                className="gap-2 text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        <Tabs defaultValue="gallery">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-muted">
              <TabsTrigger
                data-ocid="nav.my_photos.tab"
                value="gallery"
                className="gap-2 data-[state=active]:bg-card data-[state=active]:text-foreground"
              >
                <Camera className="h-4 w-4" />
                My Photos
                {activePhotos && activePhotos.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 min-w-5 text-xs"
                  >
                    {activePhotos.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                data-ocid="nav.trash.tab"
                value="trash"
                className="gap-2 data-[state=active]:bg-card data-[state=active]:text-foreground"
              >
                <Trash2 className="h-4 w-4" />
                Trash
                {trashedPhotos && trashedPhotos.length > 0 && (
                  <Badge
                    variant="destructive"
                    className="ml-1 h-5 min-w-5 text-xs"
                  >
                    {trashedPhotos.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="mt-0">
            <UploadZone />

            {loadingActive ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {["a", "b", "c", "d", "e", "f", "g", "h"].map((k) => (
                  <Skeleton
                    key={k}
                    className="aspect-square rounded-lg shimmer"
                  />
                ))}
              </div>
            ) : activePhotos && activePhotos.length > 0 ? (
              <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
                initial="hidden"
                animate="visible"
              >
                {activePhotos.map((photo, i) => (
                  <GalleryPhotoCard
                    key={photo.name}
                    photo={photo}
                    index={i + 1}
                    onDelete={handleDelete}
                    onPreview={setPreviewPhoto}
                    isDeleting={deletingId === photo.photoId}
                    ocidPrefix="gallery"
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                data-ocid="gallery.empty_state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <div className="rounded-full bg-muted p-8 mb-4">
                  <ImageOff className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                  No photos yet
                </h3>
                <p className="text-muted-foreground max-w-xs">
                  Upload your first photo using the area above to get started.
                </p>
              </motion.div>
            )}
          </TabsContent>

          {/* Trash Tab */}
          <TabsContent value="trash" className="mt-0">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display font-semibold text-foreground">
                  Deleted Photos
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {trashedPhotos
                    ? `${trashedPhotos.length} photo${
                        trashedPhotos.length !== 1 ? "s" : ""
                      }`
                    : ""}{" "}
                  in trash
                </p>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    data-ocid="trash.empty_trash_button"
                    variant="destructive"
                    size="sm"
                    disabled={
                      !trashedPhotos ||
                      trashedPhotos.length === 0 ||
                      emptyTrash.isPending
                    }
                    className="gap-2"
                  >
                    {emptyTrash.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    Empty Trash
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent
                  data-ocid="trash.empty_trash.dialog"
                  className="bg-card border-border"
                >
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-display">
                      Empty Trash?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all {trashedPhotos?.length}{" "}
                      photo{trashedPhotos?.length !== 1 ? "s" : ""} in the
                      trash. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      data-ocid="trash.empty_trash.cancel_button"
                      className="border-border"
                    >
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      data-ocid="trash.empty_trash.confirm_button"
                      onClick={handleEmptyTrash}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Empty Trash
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {loadingTrashed ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {["a", "b", "c", "d"].map((k) => (
                  <Skeleton
                    key={k}
                    className="aspect-square rounded-lg shimmer"
                  />
                ))}
              </div>
            ) : trashedPhotos && trashedPhotos.length > 0 ? (
              <TrashGridWithPermanentDelete
                photos={trashedPhotos}
                onRecover={handleRecover}
                onPermanentDelete={handlePermanentDelete}
                onPreview={setPreviewPhoto}
                recoveringId={recoveringId}
                permanentDeletingId={permanentDeletingId}
              />
            ) : (
              <motion.div
                data-ocid="trash.empty_state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <div className="rounded-full bg-muted p-8 mb-4">
                  <Trash2 className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                  Trash is empty
                </h3>
                <p className="text-muted-foreground max-w-xs">
                  Deleted photos will appear here. You can recover them or
                  permanently remove them.
                </p>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-border py-4 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noreferrer"
            className="hover:text-primary transition-colors"
          >
            Built with ♥ using caffeine.ai
          </a>
        </p>
      </footer>

      <PhotoPreviewModal
        photo={previewPhoto}
        onClose={() => setPreviewPhoto(null)}
      />

      <Toaster richColors position="bottom-right" />
    </div>
  );
}

// ─── Trash Grid with per-card permanent delete dialog ─────────────────────────
function TrashGridWithPermanentDelete({
  photos,
  onRecover,
  onPermanentDelete,
  onPreview,
  recoveringId,
  permanentDeletingId,
}: {
  photos: PhotoWithId[];
  onRecover: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onPreview: (photo: PhotoWithId) => void;
  recoveringId: string | null;
  permanentDeletingId: string | null;
}) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  return (
    <>
      <motion.div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {photos.map((photo, i) => (
          <TrashPhotoCard
            key={photo.name}
            photo={photo}
            index={i + 1}
            onRecover={onRecover}
            onPermanentDelete={() => setConfirmDeleteId(photo.photoId)}
            onPreview={onPreview}
            isRecovering={recoveringId === photo.photoId}
            isDeleting={permanentDeletingId === photo.photoId}
            ocidPrefix="trash"
          />
        ))}
      </motion.div>

      <AlertDialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
      >
        <AlertDialogContent
          data-ocid="trash.permanent_delete.dialog"
          className="bg-card border-border"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete Forever?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This photo will be permanently deleted and cannot be recovered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="trash.permanent_delete.cancel_button"
              onClick={() => setConfirmDeleteId(null)}
              className="border-border"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="trash.permanent_delete.confirm_button"
              onClick={() => {
                if (confirmDeleteId) {
                  onPermanentDelete(confirmDeleteId);
                  setConfirmDeleteId(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function App() {
  return (
    <AuthGate>
      <PhotoRecoverApp />
    </AuthGate>
  );
}
