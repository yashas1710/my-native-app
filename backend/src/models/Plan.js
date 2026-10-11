import { db } from "../config/firebase.js";

// Location fields: latitude (number, nullable), longitude (number, nullable).
export const plansCollection = db.collection("plans");

export const COLLECTION_NAME = "plans";
