import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { plansAPI } from "../api";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

const formatTime = (value) =>
  {
    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

export default function Chat() {
  const { planId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [planTitle, setPlanTitle] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async ({ showLoading = false } = {}) => {
    if (!planId) return;

    try {
      if (showLoading) setLoading(true);

      const response = await plansAPI.getPlanMessages(planId);
      setMessages(response.data.messages || []);
    } catch (err) {
      console.error("Failed to fetch chat messages:", err);

      if (err.response?.status === 403 || err.response?.status === 404) {
        navigate(`/plan/${planId}`);
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, planId]);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await plansAPI.getPlanById(planId);
        setPlanTitle(response.data.plan?.title || "");
      } catch (err) {
        console.error("Failed to fetch plan:", err);
      }
    };

    fetchPlan();
  }, [planId]);

  useEffect(() => {
    fetchMessages({ showLoading: true });

    const intervalId = window.setInterval(() => {
      fetchMessages();
    }, 4000);

    return () => window.clearInterval(intervalId);
  }, [fetchMessages]);

  // Send new message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const text = newMessage.trim();
    setNewMessage("");

    try {
      await plansAPI.sendPlanMessage(planId, text);
      await fetchMessages();
    } catch (err) {
      console.error("Failed to send chat message:", err);
      setNewMessage(text);
    }
  };

  const participantMap = new Map();
  if (user) {
    participantMap.set(user.id, {
      id: user.id,
      name: user.name || user.email || "You",
      photo: user.photoUrl || "",
    });
  }
  messages.forEach((msg) => {
    if (!participantMap.has(msg.userId)) {
      participantMap.set(msg.userId, {
        id: msg.userId,
        name: msg.senderName || "Unknown",
        photo: msg.senderPhoto || "",
      });
    }
  });
  const participants = Array.from(participantMap.values()).slice(0, 3);
  const participantCount = participantMap.size;

  if (loading) return <Spinner />;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--surface)" }}>
      <header
        style={{
          flexShrink: 0,
          background: "var(--surface)",
          borderBottom: "0.5px solid var(--border)",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "9999px",
              border: "none",
              background: "transparent",
              color: "var(--text-1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {planTitle || "Chat"}
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-3)" }}>
              {participantCount} participant{participantCount === 1 ? "" : "s"}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          {participants.map((participant, index) => (
            <div
              key={participant.id || index}
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "9999px",
                background: "var(--brand-light)",
                color: "var(--brand)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                fontWeight: 600,
                marginLeft: index === 0 ? "0" : "-6px",
                border: "2px solid var(--surface)",
                overflow: "hidden",
              }}
              title={participant.name}
            >
              {participant.photo ? (
                <img src={participant.photo} alt={participant.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                getInitials(participant.name) || "?"
              )}
            </div>
          ))}
        </div>
      </header>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px", background: "var(--surface-3)", display: "flex", flexDirection: "column", gap: "12px" }}>
        {messages.length > 0 ? (
          messages.map((msg) => {
            const isMine = msg.userId === user?.id;

            return (
              <div key={msg.id} style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}>
                {isMine ? (
                  <div style={{ maxWidth: "75%", marginLeft: "auto" }}>
                    <div
                      style={{
                        background: "var(--brand)",
                        color: "white",
                        borderRadius: "12px",
                        borderBottomRightRadius: "4px",
                        padding: "10px 14px",
                        wordBreak: "break-word",
                      }}
                    >
                      <div style={{ fontSize: "13px", lineHeight: 1.45 }}>{msg.text}</div>
                    </div>
                    <div style={{ marginTop: "4px", fontSize: "10px", color: "rgba(255,255,255,0.6)", textAlign: "right" }}>
                      {formatTime(msg.createdAt)}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", maxWidth: "75%" }}>
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "9999px",
                        background: "var(--brand-light)",
                        color: "var(--brand)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "10px",
                        fontWeight: 600,
                        flexShrink: 0,
                        overflow: "hidden",
                      }}
                      title={msg.senderName}
                    >
                      {msg.senderPhoto ? (
                        <img src={msg.senderPhoto} alt={msg.senderName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        getInitials(msg.senderName) || "?"
                      )}
                    </div>

                    <div>
                      <div style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "3px" }}>
                        {msg.senderName}
                      </div>
                      <div
                        style={{
                          background: "var(--surface)",
                          border: "0.5px solid var(--border)",
                          color: "var(--text-1)",
                          borderRadius: "12px",
                          borderBottomLeftRadius: "4px",
                          padding: "10px 14px",
                          wordBreak: "break-word",
                        }}
                      >
                        <div style={{ fontSize: "13px", lineHeight: 1.45 }}>{msg.text}</div>
                      </div>
                      <div style={{ marginTop: "4px", fontSize: "10px", color: "var(--text-3)" }}>
                        {formatTime(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)", fontSize: "14px", textAlign: "center" }}>
            No messages yet. Say something!
          </div>
        )}
      </div>

      <div
        style={{
          flexShrink: 0,
          background: "var(--surface)",
          borderTop: "0.5px solid var(--border)",
          padding: "12px 16px",
          display: "flex",
          gap: "8px",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend(e);
            }
          }}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: "9px 14px",
            border: "0.5px solid var(--border-md)",
            borderRadius: "20px",
            background: "var(--surface-2)",
            fontSize: "13px",
            outline: "none",
            color: "var(--text-1)",
          }}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!newMessage.trim()}
          aria-label="Send message"
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "9999px",
            background: "var(--brand)",
            border: "none",
            cursor: newMessage.trim() ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: newMessage.trim() ? 1 : 0.4,
            flexShrink: 0,
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <path d="M13 6L19 12L13 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
