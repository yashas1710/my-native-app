import { db } from "../config/firebase.js";

export const participantsCollection = db.collection("planParticipants");

export const COLLECTION_NAME = "planParticipants";
