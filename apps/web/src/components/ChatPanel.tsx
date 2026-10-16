"use client";
import { useEffect, useState } from "react";
import {
  onValue, push, query, ref, serverTimestamp, set, limitToLast,
} from "firebase/database";
import { realtimeDb } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

interface Msg { id: string; displayName: string; text: string }

export default function ChatPanel({ channelId }: { channelId: string }) {
  const { user } = useAuth();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!realtimeDb) return;
    const messagesQuery = query(
      ref(realtimeDb, `channels/${channelId}/messages`),
      limitToLast(50),
    );
    return onValue(
      messagesQuery,
      (snapshot) => {
        const messages: Msg[] = [];
        snapshot.forEach((child) => {
          const message = child.val() as Omit<Msg, "id">;
          messages.push({ id: child.key ?? "", ...message });
        });
        setMsgs(messages);
        setError("");
      },
      (snapshotError) => setError(snapshotError.message),
    );
  }, [channelId]);

  async function send() {
    if (!realtimeDb || !user || !text.trim()) return;
    try {
      const messageRef = push(ref(realtimeDb, `channels/${channelId}/messages`));
      await set(messageRef, {
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
      {!realtimeDb ? <p>Configure Firebase Realtime Database to enable live chat.</p> : user ? (
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <input value={text} onChange={(e) => setText(e.target.value)} style={{ flex: 1 }} placeholder="Say something..." />
          <button onClick={send}>Send</button>
        </div>
      ) : <p>Log in to chat.</p>}
    </section>
  );
}
