import { useState } from 'react';
import Head from 'next/head';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../lib/config';
import { toast } from 'sonner';
import { extractErrorMessage, friendlyNetworkError } from '../../lib/userMessage';

export default function Register() {
  const { login } = useAuth();
  const showToast = (msg: string, type: 'success'|'error'|'info'='info') => {
    if (type === 'success') toast.success(msg); else if (type === 'error') toast.error(msg); else toast(msg);
  };
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
  try {
    const res = await fetch(`${API_URL}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, username, password }) });
    if (!res.ok) { const msg = await extractErrorMessage(res, 'Registration failed'); setError(msg); showToast(msg, 'error'); return; }
    const data = await res.json();
    login(data);
    window.location.href = '/';
  } catch {
    const msg = friendlyNetworkError();
    setError(msg);
    showToast(msg, 'error');
  }
  }

  return (
    <>
      <Head><title>Register - ChronicleX</title></Head>
      <main className="max-w-md mx-auto p-8">
        <div className="card p-6">
          <h1 className="text-2xl font-bold mb-4">Register</h1>
          {error && <p className="text-red-500 dark:text-red-400 mb-2 text-sm">{error}</p>}
          <form onSubmit={submit} className="space-y-3">
            <input className="w-full p-2 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
            <input className="w-full p-2 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
            <input className="w-full p-2 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
            <button className="btn w-full" type="submit">Register</button>
          </form>
        </div>
      </main>
    </>
  );
}
