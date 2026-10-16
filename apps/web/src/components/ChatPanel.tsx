"use client";
import { useEffect, useState } from "react";
import {
  addDoc, collection, limit, onSnapshot, orderBy, query, serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

interface Msg { id: string; displayName: string; text: string }

export default function ChatPanel({ channelId }: { channelId: string }) {
  const { user } = useAuth();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "channels", channelId, "messages"), orderBy("createdAt", "desc"), limit(50));
    return onSnapshot(q, (snap) =>
      setMsgs(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Msg, "id">) })).reverse()),
      (snapshotError) => setError(snapshotError.message)
    );
  }, [channelId]);

  async function send() {
    if (!db || !user || !text.trim()) return;
    try {
      await addDoc(collection(db, "channels", channelId, "messages"), {
        uid: user.uid,
        displayName: user.displayName ?? "Corper",
        text: text.trim().slice(0, 500),
        createdAt: serverTimestamp(),
      });
      setText("");
      setError("");
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Unable to send chat message.");
    }
  }

  return (
    <section>
      <h3>Live chat</h3>
      <div style={{ height: 240, overflowY: "auto", border: "1px solid #ddd", padding: 8 }}>
        {msgs.map((m) => <p key={m.id}><b>{m.displayName}:</b> {m.text}</p>)}
      </div>
      {error && <p role="alert" style={{ color: "crimson" }}>{error}</p>}
      {!db ? <p>Configure Firebase to enable live chat.</p> : user ? (
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <input value={text} onChange={(e) => setText(e.target.value)} style={{ flex: 1 }} placeholder="Say something..." />
          <button onClick={send}>Send</button>
        </div>
      ) : <p>Log in to chat.</p>}
    </section>
  );
}
