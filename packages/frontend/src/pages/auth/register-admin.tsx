import Head from 'next/head';
import { useState } from 'react';
import { API_URL } from '../../lib/config';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';

export default function RegisterAdmin(){
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [invite, setInvite] = useState('');
  const [loading, setLoading] = useState(false);
  const showToast = (msg: string, type: 'success'|'error'|'info'='info') => {
    if (type === 'success') toast.success(msg); else if (type === 'error') toast.error(msg); else toast(msg);
  };
  const { login } = useAuth();

  async function submit(e: React.FormEvent){
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register-admin`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password, invite })
      });
      if (!res.ok) { const txt = await res.text(); showToast(txt || 'Forbidden', 'error'); return; }
      const tokens = await res.json();
      login(tokens);
      showToast('Admin account created', 'success');
    } finally { setLoading(false); }
  }

  return (
    <>
      <Head><title>Admin Sign Up - ChronicleX</title></Head>
      <div className="max-w-md mx-auto p-6 space-y-4 card">
        <h1 className="text-xl font-semibold">Admin Sign Up</h1>
        <form onSubmit={submit} className="space-y-3">
          <input className="border w-full p-2 rounded" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="border w-full p-2 rounded" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
          <input className="border w-full p-2 rounded" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <input className="border w-full p-2 rounded" placeholder="Invite Code" value={invite} onChange={e=>setInvite(e.target.value)} />
          <button className="btn w-full" disabled={loading}>{loading ? 'Creating...' : 'Create Admin'}</button>
        </form>
      </div>
    </>
  );
}
