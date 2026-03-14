# PhotoRecover

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Photo upload (drag-and-drop or file picker)
- Photo gallery view with grid layout
- Soft-delete: move photos to a Trash bin rather than permanently deleting
- Trash bin view listing deleted photos with when they were deleted
- Recover action: restore a photo from Trash back to the gallery
- Permanent delete: remove photo from Trash permanently
- Empty Trash: bulk permanently delete all trashed photos
- Photo detail/preview modal
- User authentication so each user manages their own photos

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Select `authorization` and `blob-storage` Caffeine components
2. Generate Motoko backend with:
   - Photo metadata store (id, name, uploadedAt, deletedAt, isDeleted, blobId, ownerId)
   - uploadPhoto, listPhotos, deletePhoto (soft), recoverPhoto, permanentlyDeletePhoto, emptyTrash
3. Frontend:
   - Auth guard (login/signup)
   - Gallery page: grid of active photos, upload button, delete per photo
   - Trash page: grid of trashed photos, recover and permanently delete per photo, empty trash button
   - Navigation tabs between Gallery and Trash
   - Photo preview modal
   - Upload progress indicator
