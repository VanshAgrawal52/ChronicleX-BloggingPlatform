import { useEffect, useState } from 'react';
import Head from 'next/head';
import { API_URL } from '../../lib/config';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import Link from 'next/link';

interface Post { id: string; title: string; slug: string; published: boolean; publishedAt?: string; }

export default function AdminDashboard(){
  const { accessToken, fetchWithAuth } = useAuth();
  const showToast = (msg: string, type: 'success'|'error'|'info'='info') => {
    if (type === 'success') toast.success(msg); else if (type === 'error') toast.error(msg); else toast(msg);
  };
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string|null>(null);

  async function load(){
    setLoading(true);
    try {
      // fetch first page with larger pageSize to show more
      const res = await fetch(`${API_URL}/api/posts?page=1&pageSize=50`);
      const data = await res.json();
      setPosts(data.items || []);
    } finally { setLoading(false); }
  }

  useEffect(()=>{ load(); },[]);

  async function remove(id: string){
    if (!accessToken) { showToast('Login as admin required', 'error'); return; }
    if (!confirm('Delete this post?')) return;
    setDeleting(id);
    try {
      const res = await fetchWithAuth(`${API_URL}/api/posts/${id}`, { method: 'DELETE' });
      if (res.ok) { showToast('Post deleted', 'success'); setPosts(ps => ps.filter(p => p.id !== id)); }
      else { const e = await res.json().catch(()=>({message:'Failed'})); showToast(e.message || 'Delete failed', 'error'); }
    } finally { setDeleting(null); }
  }

  return (
    <>
      <Head><title>Admin Dashboard - ChronicleX</title></Head>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        {loading && <p className="text-sm text-gray-500">Loading...</p>}
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800">
              <tr>
                <th className="text-left px-3 py-2">Title</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(p => (
                <tr key={p.id} className="border-t">
                  <td className="px-3 py-2">
                    <Link href={`/post/${p.slug}`} className="hover:underline">{p.title}</Link>
                  </td>
                  <td className="px-3 py-2">{p.published ? 'Published' : 'Draft'}</td>
                  <td className="px-3 py-2">
                    <button onClick={()=>remove(p.id)} disabled={deleting===p.id} className="btn-outline px-3 py-1 text-xs">
                      {deleting===p.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
