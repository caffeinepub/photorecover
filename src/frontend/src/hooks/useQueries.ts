import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PhotoMetadata } from "../backend";
import { ExternalBlob } from "../backend";
import { useActor } from "./useActor";

// Local storage key for photo ID mapping
const PHOTO_ID_MAP_KEY = "photorecover_id_map";

function getPhotoIdMap(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(PHOTO_ID_MAP_KEY) || "{}");
  } catch {
    return {};
  }
}

function setPhotoId(name: string, id: string) {
  const map = getPhotoIdMap();
  map[name] = id;
  localStorage.setItem(PHOTO_ID_MAP_KEY, JSON.stringify(map));
}

export function getPhotoId(name: string): string {
  return getPhotoIdMap()[name] || name;
}

export interface PhotoWithId extends PhotoMetadata {
  photoId: string;
}

export function useActivePhotos() {
  const { actor, isFetching } = useActor();
  return useQuery<PhotoWithId[]>({
    queryKey: ["activePhotos"],
    queryFn: async () => {
      if (!actor) return [];
      const photos = await actor.getActivePhotos();
      return photos.map((p) => ({
        ...p,
        photoId: getPhotoId(p.name),
      }));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTrashedPhotos() {
  const { actor, isFetching } = useActor();
  return useQuery<PhotoWithId[]>({
    queryKey: ["trashedPhotos"],
    queryFn: async () => {
      if (!actor) return [];
      const photos = await actor.getTrashedPhotos();
      return photos.map((p) => ({
        ...p,
        photoId: getPhotoId(p.name),
      }));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUploadPhoto() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      file,
      onProgress,
    }: {
      file: File;
      onProgress: (pct: number) => void;
    }) => {
      if (!actor) throw new Error("Not connected");
      const bytes = new Uint8Array(await file.arrayBuffer());
      const externalBlob =
        ExternalBlob.fromBytes(bytes).withUploadProgress(onProgress);
      const photoId = await actor.uploadPhoto(
        file.name,
        BigInt(file.size),
        file.type,
        externalBlob,
      );
      setPhotoId(file.name, photoId);
      return photoId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activePhotos"] });
    },
  });
}

export function useSoftDelete() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (photoId: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.softDeletePhoto(photoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activePhotos"] });
      queryClient.invalidateQueries({ queryKey: ["trashedPhotos"] });
    },
  });
}

export function useRecoverPhoto() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (photoId: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.recoverPhoto(photoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activePhotos"] });
      queryClient.invalidateQueries({ queryKey: ["trashedPhotos"] });
    },
  });
}

export function usePermanentlyDelete() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (photoId: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.permanentlyDeletePhoto(photoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trashedPhotos"] });
    },
  });
}

export function useEmptyTrash() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      await actor.emptyTrash();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trashedPhotos"] });
    },
  });
}
