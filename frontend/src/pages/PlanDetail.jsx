// src/pages/PlanDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  onSnapshot,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import Card from "../components/Card";
import toast from "react-hot-toast";

export default function PlanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [plan, setPlan] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [hasJoined, setHasJoined] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [loading, setLoading] = useState(true);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  // ---------- Helpers ----------
  const formatDate = (date) => {
    const d = date?.toDate?.() || new Date(date);
    return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  };

  const isPast = (() => {
    if (!plan) return false;
    const end = plan?.endDate?.toDate?.() || new Date(plan?.endDate);
    return end < new Date();
  })();

  // ---------- Fetch plan ----------
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const planRef = doc(db, "plans", id);
        const planSnap = await getDoc(planRef);

        if (planSnap.exists()) {
          const planData = { id: planSnap.id, ...planSnap.data() };
          setPlan(planData);
          if (user && planData.createdBy === user.uid) setIsCreator(true);
        } else {
          toast.error("Plan not found ❌");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error fetching plan ❌");
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [id, user]);

  // ---------- Real-time participants ----------
  useEffect(() => {
    if (!id) return;

    const q = query(
      collection(db, "planParticipants"),
      where("plan_id", "==", id),
      orderBy("joined_at", "asc")
    );

    const unsub = onSnapshot(q, async (snapshot) => {
      const raw = snapshot.docs.map((d) => d.data());

      // Fetch user profiles from `users` collection
      const enriched = await Promise.all(
        raw.map(async (p) => {
          try {
            const userSnap = await getDoc(doc(db, "users", p.user_id));
            const userData = userSnap.exists() ? userSnap.data() : {};
            return {
              id: p.user_id,
              displayName: userData.displayName || "Unknown",
              photoURL: userData.photoURL || null,
              email: userData.email || "",
            };
          } catch {
            return { id: p.user_id, displayName: "Unknown", photoURL: null, email: "" };
          }
        })
      );

      setParticipants(enriched);
      setHasJoined(!!user && enriched.some((x) => x.id === user?.uid));
    });

    return () => unsub();
  }, [id, user]);

  // ---------- Real-time chat ----------
  useEffect(() => {
    if (!id) return;

    const q = query(
      collection(db, "planChats"),
      where("plan_id", "==", id),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, async (snap) => {
      const rows = await Promise.all(
        snap.docs.map(async (d) => {
          const m = d.data();
          try {
            const uSnap = await getDoc(doc(db, "users", m.user_id));
            const uData = uSnap.exists() ? uSnap.data() : {};
            return {
              id: d.id,
              message: m.message,
              createdAt: m.createdAt?.toDate?.() || null,
              displayName: uData.displayName || m.user_id,
              photoURL: uData.photoURL || null,
            };
          } catch {
            return { id: d.id, message: m.message, createdAt: m.createdAt?.toDate?.() || null, displayName: m.user_id, photoURL: null };
          }
        })
      );

      setMessages(rows);
    });

    return () => unsub();
  }, [id]);

  // ---------- Actions ----------
  const joinPlan = async () => {
    if (!user) return;
    if (isPast) return toast.error("Cannot join a past plan ❌");

    try {
      const existsQ = query(
        collection(db, "planParticipants"),
        where("plan_id", "==", id),
        where("user_id", "==", user.uid)
      );
      const existsSnap = await getDocs(existsQ);
      if (!existsSnap.empty) return toast("Already joined", { icon: "ℹ️" });

      await addDoc(collection(db, "planParticipants"), {
        plan_id: id,
        user_id: user.uid,
        email: user.email || "",
        joined_at: serverTimestamp(),
      });
      toast.success("You joined the plan ✅");
    } catch (err) {
      console.error(err);
      toast.error("Error joining plan ❌");
    }
  };

  const leavePlan = async () => {
    if (!user || isCreator || isPast) return;

    try {
      const q = query(
        collection(db, "planParticipants"),
        where("plan_id", "==", id),
        where("user_id", "==", user.uid)
      );
      const snap = await getDocs(q);
      await Promise.all(snap.docs.map((d) => deleteDoc(doc(db, "planParticipants", d.id))));
      toast.success("You left the plan ✅");
    } catch (err) {
      console.error(err);
      toast.error("Error leaving plan ❌");
    }
  };

  const handleDelete = async () => {
    if (!user || !isCreator || isPast) return;
    try {
      await deleteDoc(doc(db, "plans", plan.id));
      toast.success("Plan deleted ✅");
      navigate("/activity");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete plan ❌");
    }
  };

  const sendMessage = async () => {
    if (!text.trim() || !user) return;
    if (isPast) return toast("Chat is read‑only for past plans", { icon: "ℹ️" });
    if (!hasJoined && !isCreator) return toast.error("Join the plan to chat ❌");

    try {
      await addDoc(collection(db, "planChats"), {
        plan_id: id,
        user_id: user.uid,
        message: text.trim(),
        createdAt: serverTimestamp(),
      });
      setText("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message ❌");
    }
  };

  // ---------- Render ----------
  if (loading) return <p className="p-6">Loading...</p>;
  if (!plan) return <p className="p-6">Plan not found</p>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <Card plan={plan} showButton={false} />

      <p className="text-gray-500 mt-2">
        {formatDate(plan.startDate)} — {formatDate(plan.endDate)}
      </p>

      <div className="mt-4 mb-6 flex flex-wrap gap-3">
        {!isCreator && !hasJoined && !isPast && (
          <button
            onClick={joinPlan}
            className="bg-brand text-white px-4 py-2 rounded hover:bg-brand-dark transition"
          >
            I’m In
          </button>
        )}

        {!isCreator && hasJoined && !isPast && (
          <button
            onClick={leavePlan}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Leave Plan
          </button>
        )}

        {isCreator && !isPast && (
          <>
            <button
              onClick={() => navigate(`/edit-plan/${plan.id}`)}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
            >
              Edit Plan
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Delete Plan
            </button>
          </>
        )}

        {isCreator && isPast && (
          <p className="text-gray-500">Past plans cannot be edited or deleted.</p>
        )}
      </div>

      <h2 className="text-xl font-semibold mb-2">Participants</h2>
      {participants.length > 0 ? (
        <ul className="space-y-2">
          {participants.map((p) => (
            <li key={p.id} className="flex items-center gap-3">
              {p.photoURL ? (
                <img src={p.photoURL} alt={p.displayName} className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-300" />
              )}
              <div className="text-gray-800">
                <span className="font-medium">{p.displayName}</span>
                {p.email && <span className="text-gray-500"> — {p.email}</span>}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No participants yet.</p>
      )}

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Chat</h2>
        <div className="border p-4 h-64 overflow-y-auto space-y-2 rounded">
          {messages.length > 0 ? (
            messages.map((m) => (
              <div key={m.id}>
                <span className="font-semibold">{m.displayName}:</span> {m.message}
              </div>
            ))
          ) : (
            <p className="text-gray-500">No messages yet.</p>
          )}
        </div>

        <div className="flex mt-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 border px-2 py-2 rounded"
            placeholder={isPast ? "Chat is read‑only for past plans" : "Type a message..."}
            disabled={isPast || (!hasJoined && !isCreator)}
          />
          <button
            onClick={sendMessage}
            className="ml-2 bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
            disabled={isPast || (!hasJoined && !isCreator)}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
