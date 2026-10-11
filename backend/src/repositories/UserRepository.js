import { usersCollection } from "../models/User.js";
import { admin } from "../config/firebase.js";

export class UserRepository {
  async updateLocation(userId, latitude, longitude) {
    await usersCollection.doc(userId).update({
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      locationUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return this.findById(userId);
  }

  async findByEmail(email) {
    const snapshot = await usersCollection
      .where("email", "==", email.toLowerCase().trim())
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  async findById(id) {
    const doc = await usersCollection.doc(id).get();

    if (!doc.exists) return null;

    const data = doc.data();
    delete data.password;
    return { id: doc.id, ...data };
  }

  async findByAccommodation(accommodationId) {
    const snapshot = await usersCollection
      .where("accommodationId", "==", accommodationId.toLowerCase())
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      delete data.password;
      return { id: doc.id, ...data };
    });
  }

  async create(userData) {
    const docRef = await usersCollection.add({
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.findById(docRef.id);
  }

  async updateById(id, updateData) {
    await usersCollection.doc(id).update({
      ...updateData,
      updatedAt: new Date(),
    });

    return this.findById(id);
  }

  async existsByEmail(email) {
    const snapshot = await usersCollection
      .where("email", "==", email.toLowerCase().trim())
      .limit(1)
      .get();

    return !snapshot.empty;
  }

  // Get password for authentication (internal only)
  async findByEmailWithPassword(email) {
    const snapshot = await usersCollection
      .where("email", "==", email.toLowerCase().trim())
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }
}

export default new UserRepository();
