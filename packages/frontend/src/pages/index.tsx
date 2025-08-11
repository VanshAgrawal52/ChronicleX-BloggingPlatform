import { useState, useEffect } from 'react';
import { API_URL } from '../lib/config';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();

  async function load() {
    const params = new URLSearchParams({ page: '1', pageSize: '5' });
    const q = (router.query?.search as string) || '';
    if (q) params.set('search', q);
    const res = await fetch(`${API_URL}/api/posts?${params.toString()}`);
    const data = await res.json();
    setPosts(data.items);
    setLoaded(true);
  }

  useEffect(()=>{ load(); },[router.query?.search]);

  return (
    <>
      <section className="mb-10">
        <div className="text-center space-y-4 py-12">
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 to-violet-500 text-transparent bg-clip-text">Modern Web Engineering, in Public</h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Production-minded writeups on TypeScript, Fastify, Prisma, Next.js, caching, and more.</p>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-4">Latest Posts</h2>
        {!loaded && <div className="grid gap-5 sm:grid-cols-2"><div className="h-24 skeleton" /><div className="h-24 skeleton" /></div>}
    <ul className="grid gap-5 sm:grid-cols-2">
          {posts.map(p => (
    <li key={p.id} className="group rounded-xl border p-5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition">
              <Link href={`/post/${p.slug}`} className="block">
        <h3 className="font-semibold text-lg group-hover:text-indigo-400 line-clamp-2">{p.title}</h3>
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">by {p.author.username}</p>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{(p.content || '').replace(/<[^>]+>/g,'').slice(0, 140)}{((p.content || '').length > 140) ? '…' : ''}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
