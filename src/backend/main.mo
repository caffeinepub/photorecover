import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";

actor {
  // Mixins
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  type PhotoMetadata = {
    name : Text;
    owner : Principal;
    size : Nat;
    mimeType : Text;
    uploadedAt : Time.Time;
    deletedAt : ?Time.Time;
    isDeleted : Bool;
    blob : Storage.ExternalBlob;
  };

  module PhotoMetadata {
    public func compare(photo1 : PhotoMetadata, photo2 : PhotoMetadata) : Order.Order {
      Text.compare(photo1.name, photo2.name);
    };
  };

  // User profile type
  public type UserProfile = {
    name : Text;
  };

  // Persistent storage for photos metadata
  let photos = Map.empty<Text, PhotoMetadata>();

  // Persistent storage for user profiles
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Store photo metadata tied to blob storage
  public shared ({ caller }) func uploadPhoto(name : Text, size : Nat, mimeType : Text, blob : Storage.ExternalBlob) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload photos");
    };

    let photo : PhotoMetadata = {
      name;
      owner = caller;
      size;
      mimeType;
      uploadedAt = Time.now();
      deletedAt = null;
      isDeleted = false;
      blob;
    };

    photos.add(name, photo);
    name;
  };

  // List non-deleted photos belonging to the caller
  public query ({ caller }) func getActivePhotos() : async [PhotoMetadata] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their photos");
    };

    photos.values().toArray().filter(
      func(photo) { not photo.isDeleted and photo.owner == caller }
    );
  };

  // List deleted (trashed) photos belonging to the caller
  public query ({ caller }) func getTrashedPhotos() : async [PhotoMetadata] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view trashed photos");
    };

    photos.values().toArray().filter(
      func(photo) { photo.isDeleted and photo.owner == caller }
    );
  };

  // Soft delete a photo (move to trash)
  public shared ({ caller }) func softDeletePhoto(photoId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete photos");
    };

    switch (photos.get(photoId)) {
      case (null) {
        Runtime.trap("Photo not found");
      };
      case (?photo) {
        if (photo.owner != caller) {
          Runtime.trap("Unauthorized: Can only delete your own photos");
        };
        let updatedPhoto = {
          photo with
          isDeleted = true;
          deletedAt = ?Time.now();
        };
        photos.add(photoId, updatedPhoto);
      };
    };
  };

  // Recover a photo from trash
  public shared ({ caller }) func recoverPhoto(photoId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can recover photos");
    };

    switch (photos.get(photoId)) {
      case (null) {
        Runtime.trap("Photo not found");
      };
      case (?photo) {
        if (photo.owner != caller) {
          Runtime.trap("Unauthorized: Can only recover your own photos");
        };
        let updatedPhoto = {
          photo with
          isDeleted = false;
          deletedAt = null;
        };
        photos.add(photoId, updatedPhoto);
      };
    };
  };

  // Permanently delete a photo
  public shared ({ caller }) func permanentlyDeletePhoto(photoId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete photos");
    };

    switch (photos.get(photoId)) {
      case (null) {
        Runtime.trap("Photo not found");
      };
      case (?photo) {
        if (photo.owner != caller) {
          Runtime.trap("Unauthorized: Can only delete your own photos");
        };
        photos.remove(photoId);
      };
    };
  };

  // Empty trash (permanently delete all trashed photos for the caller)
  public shared ({ caller }) func emptyTrash() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can empty trash");
    };

    let trashedPhotos = photos.toArray().filter(
      func((k, v)) { v.owner == caller and v.isDeleted }
    );

    for ((id, photo) in trashedPhotos.values()) {
      photos.remove(id);
    };
  };
};
