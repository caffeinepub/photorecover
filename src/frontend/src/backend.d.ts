import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface PhotoMetadata {
    isDeleted: boolean;
    owner: Principal;
    blob: ExternalBlob;
    name: string;
    size: bigint;
    mimeType: string;
    deletedAt?: Time;
    uploadedAt: Time;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    emptyTrash(): Promise<void>;
    getActivePhotos(): Promise<Array<PhotoMetadata>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getTrashedPhotos(): Promise<Array<PhotoMetadata>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    permanentlyDeletePhoto(photoId: string): Promise<void>;
    recoverPhoto(photoId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    softDeletePhoto(photoId: string): Promise<void>;
    uploadPhoto(name: string, size: bigint, mimeType: string, blob: ExternalBlob): Promise<string>;
}
