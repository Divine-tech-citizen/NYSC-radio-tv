"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { user, login, register, logout } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (user) return (
    <>
      <p>Signed in as {user.displayName ?? user.email}</p>
      <button onClick={logout}>Log out</button>
    </>
  );

  async function submit() {
    try {
      setError("");
      if (mode === "login") await login(email, password);
      else await register(email, password, name);
      router.push("/");
    } catch (e: any) { setError(e.message); }
  }

  return (
    <div style={{ display: "grid", gap: 8, maxWidth: 320 }}>
      <h1>{mode === "login" ? "Log in" : "Create account"}</h1>
      {mode === "register" && <input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />}
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      <button onClick={submit}>{mode === "login" ? "Log in" : "Register"}</button>
      <button onClick={() => setMode(mode === "login" ? "register" : "login")}>
        {mode === "login" ? "Need an account?" : "Have an account?"}
      </button>
    </div>
  );
}
