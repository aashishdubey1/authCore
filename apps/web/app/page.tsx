"use client";

import { FormEvent, useMemo, useState } from "react";
import { api } from "../lib/api";
import { AuthState } from "../lib/types";

const guestMemes = [
  "No login detected. Even the Wi-Fi router asks who you are.",
  "Guest mode is brave. Production mode is login.",
  "Anonymous user unlocked: suspense and confusion.",
  "Token missing. Confidence also missing.",
];

const userMemes = [
  "Access granted. Your bugs now fear your commit history.",
  "Session active. Ship it energy unlocked.",
  "Welcome back, chaos engineer.",
  "You are logged in and slightly overpowered.",
];

const initialAuth = readAuth();

function readAuth(): AuthState | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("authcore-auth");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthState;
  } catch {
    return null;
  }
}

function writeAuth(value: AuthState | null) {
  if (typeof window === "undefined") return;
  if (!value) {
    localStorage.removeItem("authcore-auth");
    return;
  }
  localStorage.setItem("authcore-auth", JSON.stringify(value));
}

export default function Page() {
  const [auth, setAuth] = useState<AuthState | null>(initialAuth);
  const [msg, setMsg] = useState("Welcome to AuthCore Meme Quest.");
  const [busy, setBusy] = useState(false);
  const [register, setRegister] = useState({ name: "", email: "", password: "" });
  const [login, setLogin] = useState({ email: "", password: "" });
  const [resend, setResend] = useState({ email: "", password: "" });
  const [token, setToken] = useState("");
  const [quests, setQuests] = useState({
    register: false,
    verifyEmail: false,
    resendVerification: false,
    login: !!initialAuth,
    logout: false,
    logoutAll: false,
  });

  const guestMeme = useMemo(() => guestMemes[new Date().getMinutes() % guestMemes.length], []);
  const loggedMeme = useMemo(() => userMemes[new Date().getSeconds() % userMemes.length], []);
  const done = Object.values(quests).filter(Boolean).length;

  async function perform(call: () => Promise<{ message?: string }>, success?: () => void) {
    setBusy(true);
    try {
      const res = await call();
      setMsg(res.message || "Done");
      success?.();
    } catch (error) {
      setMsg(error instanceof Error ? error.message : "Unexpected error");
    } finally {
      setBusy(false);
    }
  }

  async function onRegister(e: FormEvent) {
    e.preventDefault();
    await perform(() => api.register(register), () => {
      setQuests((q) => ({ ...q, register: true }));
    });
  }

  async function onVerify(e: FormEvent) {
    e.preventDefault();
    await perform(() => api.verifyEmail(token), () => {
      setQuests((q) => ({ ...q, verifyEmail: true }));
    });
  }

  async function onResend(e: FormEvent) {
    e.preventDefault();
    await perform(() => api.resendVerification(resend), () => {
      setQuests((q) => ({ ...q, resendVerification: true }));
    });
  }

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    await perform(async () => {
      const res = await api.login(login);
      const next: AuthState = {
        accessToken: res.accessToken,
        sessionId: res.sessionId,
        user: res.user,
      };
      setAuth(next);
      writeAuth(next);
      setQuests((q) => ({ ...q, login: true }));
      return { message: `Logged in. Welcome ${res.user.name}.` };
    });
  }

  async function onLogout() {
    if (!auth) return;
    await perform(() => api.logout(auth.accessToken), () => {
      setAuth(null);
      writeAuth(null);
      setQuests((q) => ({ ...q, logout: true }));
    });
  }

  async function onLogoutAll() {
    if (!auth) return;
    await perform(() => api.logoutAll(auth.accessToken), () => {
      setAuth(null);
      writeAuth(null);
      setQuests((q) => ({ ...q, logoutAll: true }));
    });
  }

  return (
    <main className="page">
      <section className="hero card">
        <h1>AuthCore Meme Quest</h1>
        <p>Use every auth route, collect quest ticks, and get roasted by the UI.</p>
      </section>

      <section className="card status">
        {!auth ? <h2>Guest Mode</h2> : <h2>Welcome, {auth.user.name}</h2>}
        <p>{auth ? loggedMeme : guestMeme}</p>
        <p className="system">System: {msg}</p>
      </section>

      <section className="card">
        <h3>Quest Board</h3>
        <p>Completed {done}/6</p>
        <ul>
          <li className={quests.register ? "done" : "todo"}>Register user</li>
          <li className={quests.verifyEmail ? "done" : "todo"}>Verify email token</li>
          <li className={quests.resendVerification ? "done" : "todo"}>Resend verification</li>
          <li className={quests.login ? "done" : "todo"}>Login</li>
          <li className={quests.logout ? "done" : "todo"}>Logout current session</li>
          <li className={quests.logoutAll ? "done" : "todo"}>Logout all sessions</li>
        </ul>
      </section>

      <section className="grid">
        <form className="card" onSubmit={onRegister}>
          <h3>Register</h3>
          <input placeholder="Name" required value={register.name} onChange={(e) => setRegister((v) => ({ ...v, name: e.target.value }))} />
          <input placeholder="Email" type="email" required value={register.email} onChange={(e) => setRegister((v) => ({ ...v, email: e.target.value }))} />
          <input placeholder="Password" type="password" required value={register.password} onChange={(e) => setRegister((v) => ({ ...v, password: e.target.value }))} />
          <button disabled={busy} type="submit">Register</button>
        </form>

        <form className="card" onSubmit={onVerify}>
          <h3>Verify Email</h3>
          <input placeholder="Token" required value={token} onChange={(e) => setToken(e.target.value)} />
          <button disabled={busy} type="submit">Verify</button>
        </form>

        <form className="card" onSubmit={onResend}>
          <h3>Resend Verification</h3>
          <input placeholder="Email" type="email" required value={resend.email} onChange={(e) => setResend((v) => ({ ...v, email: e.target.value }))} />
          <input placeholder="Password" type="password" required value={resend.password} onChange={(e) => setResend((v) => ({ ...v, password: e.target.value }))} />
          <button disabled={busy} type="submit">Resend</button>
        </form>

        <form className="card" onSubmit={onLogin}>
          <h3>Login</h3>
          <input placeholder="Email" type="email" required value={login.email} onChange={(e) => setLogin((v) => ({ ...v, email: e.target.value }))} />
          <input placeholder="Password" type="password" required value={login.password} onChange={(e) => setLogin((v) => ({ ...v, password: e.target.value }))} />
          <button disabled={busy} type="submit">Login</button>
        </form>
      </section>

      <section className="card actions">
        <button disabled={!auth || busy} onClick={onLogout}>Logout</button>
        <button disabled={!auth || busy} onClick={onLogoutAll}>Logout All</button>
      </section>
    </main>
  );
}
