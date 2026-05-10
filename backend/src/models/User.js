import { db } from "../config/firebase.js";

export const usersCollection = db.collection("users");

export const COLLECTIONS = {
  USERS: "users",
};
