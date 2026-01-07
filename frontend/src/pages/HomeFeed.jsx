import { useEffect, useState } from "react";
import { collection, getDocs, query, where, addDoc, deleteDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import Card from "../components/Card";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function HomeFeed() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [joinedIds, setJoinedIds] = useState([]);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const planSnap = await getDocs(collection(db, "plans"));
      const joinedSnap = await getDocs(
        query(collection(db, "planParticipants"), where("user_id", "==", user.uid))
      );

      setJoinedIds(joinedSnap.docs.map(d => d.data().plan_id));

      const rows = await Promise.all(
        planSnap.docs.map(async (d) => {
          const p = d.data();
          let creatorName = "Anonymous";
          let creatorPhotoURL = "";

          if (p.createdBy) {
            const u = await getDoc(doc(db, "users", p.createdBy));
            if (u.exists()) {
              creatorName = u.data().displayName || "Anonymous";
              creatorPhotoURL = u.data().photoURL || "";
            }
          }

          return { id: d.id, ...p, creatorName, creatorPhotoURL };
        })
      );

      setPlans(rows);
    };

    load();
  }, [user]);

  const join = async (id) => {
  await addDoc(collection(db, "planParticipants"), {
    plan_id: id,
    user_id: user.uid,
    email: user.email,
    joined_at: serverTimestamp(),
  });
  setJoinedIds(prev => [...prev, id]); // Update immediately
  toast.success("Joined plan");
};

const leave = async (id) => {
  const q = query(
    collection(db, "planParticipants"),
    where("plan_id", "==", id),
    where("user_id", "==", user.uid)
  );
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map(d => deleteDoc(doc(db, "planParticipants", d.id))));
  setJoinedIds(prev => prev.filter(pid => pid !== id)); // Update immediately
  toast.success("Left plan");
};



  return (
    <div className="p-6 grid gap-6 md:grid-cols-2">
      {plans.map((plan) => (
        <Card
          key={plan.id}
          plan={plan}
          isCreator={plan.createdBy === user.uid}
          hasJoined={joinedIds.includes(plan.id)}
          onJoin={() => join(plan.id)}
          onLeave={() => leave(plan.id)}
          onChat={(id) => navigate(`/chat/${id}`)} // ✅ WORKS
        />
      ))}
    </div>
  );
}
