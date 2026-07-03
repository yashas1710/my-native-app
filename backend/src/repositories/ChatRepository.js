import { db } from "../config/firebase.js";

const normalizeTimestamp = (value) => {
  if (!value) return null;

  if (typeof value?.toDate === "function") {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return value;
};

export class ChatRepository {
  messagesCollection(planId) {
    return db
      .collection("planChats")
      .doc(planId)
      .collection("messages");
  }

  async getMessages(planId) {
    const snapshot = await this.messagesCollection(planId)
      .orderBy("createdAt", "asc")
      .get();

    const messages = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        let senderName = data.senderName || "Unknown";
        let senderPhoto = data.senderPhoto || "";

        if (data.userId && (!data.senderName || !data.senderPhoto)) {
          const userDoc = await db.collection("users").doc(data.userId).get();

          if (userDoc.exists) {
            const user = userDoc.data();
            senderName =
              data.senderName ||
              user.name ||
              user.displayName ||
              user.fullName ||
              user.email ||
              "Unknown";
            senderPhoto = data.senderPhoto || user.photoUrl || user.photoURL || "";
          }
        }

        return {
          id: doc.id,
          text: data.text || "",
          userId: data.userId,
          senderName,
          senderPhoto,
          createdAt: normalizeTimestamp(data.createdAt),
        };
      })
    );

    return messages;
  }

  async createMessage(planId, { text, user }) {
    const docRef = await this.messagesCollection(planId).add({
      text,
      userId: user.id,
      senderName: user.name || user.email || "Unknown",
      senderPhoto: user.photoUrl || "",
      createdAt: new Date(),
    });

    const doc = await docRef.get();
    const data = doc.data();

    return {
      id: doc.id,
      text: data.text,
      userId: data.userId,
      senderName: data.senderName,
      senderPhoto: data.senderPhoto,
      createdAt: normalizeTimestamp(data.createdAt),
    };
  }
}

export default new ChatRepository();
