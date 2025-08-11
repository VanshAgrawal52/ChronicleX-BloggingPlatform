import { useState, useEffect } from 'react';
import Head from 'next/head';
import { API_URL } from '../../lib/config';
import { toast } from 'sonner';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('');
  const showToast = (msg: string, type: 'success'|'error'|'info'='info') => {
    if (type === 'success') toast.success(msg); else if (type === 'error') toast.error(msg); else toast(msg);
  };

  // Dev-only: allow triggering a toast via ?toast=success|error|info
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const usp = new URLSearchParams(window.location.search);
    const t = usp.get('toast');
    if (t) {
      const type = (t === 'success' || t === 'error' || t === 'info') ? t : 'info';
      showToast(`Toast test: ${type}`, type as any);
      // remove param to avoid repeating
      usp.delete('toast');
      const url = `${window.location.pathname}${usp.toString() ? `?${usp.toString()}` : ''}`;
      window.history.replaceState({}, '', url);
    }
  }, []);
  const [createdPostId, setCreatedPostId] = useState<string | null>(null);

  // Autosave draft to localStorage
  useEffect(()=>{
    const saved = localStorage.getItem('draft:new');
    if (saved) {
      const d = JSON.parse(saved);
      setTitle(d.title || '');
      setContent(d.content || '');
      setTags(d.tags || '');
    }
  },[]);

  useEffect(()=>{
    const handle = setTimeout(()=>{
      localStorage.setItem('draft:new', JSON.stringify({ title, content, tags }));
    }, 1000);
    return ()=>clearTimeout(handle);
  }, [title, content, tags]);

  async function publish(e: React.FormEvent) {
    e.preventDefault();
    setStatus('Saving...');
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(`${API_URL}/api/posts`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ title, content, tags: tags.split(',').map(t=>t.trim()).filter(Boolean) }) });
      if (!res.ok) {
        const txt = await res.text();
        setStatus('Failed');
        showToast(`Post creation failed: ${txt || res.status}`, 'error');
        return;
      }
      const post = await res.json();
      setCreatedPostId(post.id);
      localStorage.removeItem('draft:new');
      setStatus('Created (unpublished)');
      showToast('Draft created! 🎉 Now publish it.', 'success');
    } catch (e: any) {
      setStatus('Failed');
      showToast('Post creation failed: network error', 'error');
    }
  }

  return (
    <>
      <Head><title>Create Post - ChronicleX</title></Head>
      <main className="max-w-2xl mx-auto p-8 space-y-4">
        <h1 className="text-2xl font-bold">Create Post</h1>
        <div className="text-xs text-gray-500 flex gap-3">
          <button type="button" className="btn-outline px-2 py-1" onClick={()=>{
            setTitle('10 Practical TypeScript Tips for React Developers');
            setTags('typescript,react,patterns');
            setContent(`# Why TypeScript in React\n\nType safety and refactorability.\n\n## Tips\n- Use discriminated unions\n- Narrow with in-operator\n- Model async with Result<T,E>\n\n## Example\n\n\`type State = { kind: 'idle' } | { kind: 'loading' } | { kind: 'error'; error: string } | { kind: 'success'; data: T }\`;`);
            showToast('Example filled', 'info');
          }}>Use example</button>
        </div>
        <form onSubmit={publish} className="space-y-4 card p-4">
          <input className="w-full p-2 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
          <textarea className="w-full p-2 h-64 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700" placeholder="Content (Markdown supported)" value={content} onChange={e=>setContent(e.target.value)} />
          <input className="w-full p-2 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700" placeholder="Tags (comma separated)" value={tags} onChange={e=>setTags(e.target.value)} />
          <div className="flex items-center gap-3">
            <button className="btn">Publish</button>
            <span className="text-xs text-gray-500">Creates a draft first; then click "Publish Now".</span>
          </div>
        </form>
        {createdPostId && (
          <div className="flex gap-3 items-center mt-2">
            <button onClick={async ()=>{
              const token = localStorage.getItem('accessToken');
              try {
                const res = await fetch(`${API_URL}/api/posts/${createdPostId}/publish`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
                if (!res.ok) { showToast(`Publish failed: ${res.status}`, 'error'); return; }
                const p = await res.json();
                showToast('Post published! 🚀', 'success');
                window.location.href = `/post/${p.slug}`;
              } catch { showToast('Publish failed: network error', 'error'); }
            }} className="btn text-sm">Publish Now</button>
            <button onClick={()=>{ if (createdPostId) window.location.href = `/post/${createdPostId}`; }} className="text-xs underline">View Raw (might 404 until published)</button>
          </div>
        )}
        {status && <p className="text-sm text-gray-500 mt-2">{status}</p>}
      </main>
    </>
  );
}
