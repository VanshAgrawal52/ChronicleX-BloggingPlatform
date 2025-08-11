import { useState } from 'react';
import Head from 'next/head';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { API_URL } from '../../lib/config';
import { extractErrorMessage, friendlyNetworkError } from '../../lib/userMessage';

export default function Login() {
  const { login } = useAuth();
  const showToast = (msg: string, type: 'success'|'error'|'info'='info') => {
    if (type === 'success') toast.success(msg); else if (type === 'error') toast.error(msg); else toast(msg);
  };
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identifier, password }) });
      if (!res.ok) {
        const msg = await extractErrorMessage(res, 'Invalid credentials');
        setError(msg);
        showToast(msg, 'error');
        return;
      }
      const data = await res.json();
      login(data);
      showToast('Welcome back! 🎉 Login successful.', 'success');
      window.location.href = '/';
    } catch (e: any) {
      const msg = friendlyNetworkError();
      setError(msg);
      showToast(msg, 'error');
    }
  }

  return (
    <>
      <Head><title>Login - ChronicleX</title></Head>
      <main className="max-w-md mx-auto p-8">
        <div className="card p-6">
          <h1 className="text-2xl font-bold mb-4">Login</h1>
          {error && <p className="text-red-500 dark:text-red-400 mb-2 text-sm">{error}</p>}
          <form onSubmit={submit} className="space-y-3">
            <input className="w-full p-2 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700" placeholder="Email or Username" value={identifier} onChange={e=>setIdentifier(e.target.value)} />
            <input className="w-full p-2 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
            <button className="btn w-full" type="submit">Login</button>
          </form>
        </div>
      </main>
    </>
  );
}
