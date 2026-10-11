import { db } from "../config/firebase.js";

// Location fields: latitude (number, nullable), longitude (number, nullable),
// locationUpdatedAt (ISO string, nullable; Firestore stores a server Timestamp).
export const usersCollection = db.collection("users");

export const COLLECTIONS = {
  USERS: "users",
};
