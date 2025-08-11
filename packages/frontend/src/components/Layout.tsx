import Link from 'next/link';
import Head from 'next/head';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export function Layout({ title, children }: { title?: string; children: any }) {
  const { accessToken, role, logout } = useAuth();
  const [open, setOpen] = useState(false);
  // Start with a stable default to avoid SSR/CSR mismatch; sync after mount
  const [theme, setTheme] = useState<'light'|'dark'>('light');
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(()=>{
    setMounted(true);
    // read saved theme and apply
    const saved = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    const initial = saved === 'dark' ? 'dark' : 'light';
    setTheme(initial);
    const root = document.documentElement;
    if (initial === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
  },[]);

  useEffect(()=>{
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
    if (typeof window !== 'undefined') localStorage.setItem('theme', theme);
  },[theme, mounted]);

  useEffect(()=>{
    // initialize search from query
    if (router?.query?.search && typeof router.query.search === 'string') setSearch(router.query.search);
  }, [router?.query?.search]);

  useEffect(()=>{
    const t = setTimeout(()=>{
      if (router.pathname === '/') {
        const q: any = { ...router.query };
        if (search) q.search = search; else delete q.search;
        router.replace({ pathname: '/', query: q }, undefined, { shallow: true });
      }
    }, 500);
    return ()=>clearTimeout(t);
  }, [search]);
  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>{title ? `${title} – ChronicleX` : 'ChronicleX'}</title>
        <link rel="icon" href="/favicon.svg" />
        <meta name="theme-color" content="#6366F1" />
      </Head>
      <header className="sticky top-0 z-30 bg-white/60 dark:bg-slate-900/60 backdrop-blur supports-[backdrop-filter]:bg-white/40 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" aria-label="Home" className="flex items-center gap-2"><Logo size={36} /></Link>
          <nav className="hidden md:flex items-center gap-2 text-sm bg-white/80 dark:bg-slate-900/80 rounded-full px-4 py-1.5 shadow border border-slate-100 dark:border-slate-800">
            <div className="relative">
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search" className="text-xs rounded-full pl-8 pr-3 py-1 bg-slate-100/60 dark:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <span className="absolute left-2 top-1.5 text-slate-400">🔍</span>
            </div>
            <Link href="/" className="px-3 py-1 rounded hover:bg-brand-50 dark:hover:bg-slate-800 transition">Home</Link>
            <Link href="/bookmarks" className="px-3 py-1 rounded hover:bg-brand-50 dark:hover:bg-slate-800 transition">Bookmarks</Link>
            {accessToken && <Link href="/dashboard/create-post" className="px-3 py-1 rounded hover:bg-brand-50 dark:hover:bg-slate-800 transition">New Post</Link>}
            {accessToken && role==='ADMIN' && <Link href="/admin" className="px-3 py-1 rounded hover:bg-brand-50 dark:hover:bg-slate-800 transition">Admin</Link>}
            {!accessToken && <Link href="/auth/login" className="px-3 py-1 rounded text-indigo-600 font-medium hover:bg-brand-50 dark:hover:bg-slate-800 transition">Login</Link>}
            {!accessToken && <Link href="/auth/register" className="px-3 py-1.5 rounded bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition">Sign Up</Link>}
            {accessToken && <button onClick={logout} className="px-3 py-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition">Logout</button>}
            <button onClick={()=>setTheme(t=>t==='dark'?'light':'dark')} className="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition text-lg" aria-label="Toggle theme">
              <span suppressHydrationWarning>{theme==='dark'?'☀️':'🌙'}</span>
            </button>
          </nav>
          <button className="md:hidden flex flex-col items-center justify-center w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 shadow hover:shadow-md transition" onClick={()=>setOpen(o=>!o)} aria-label="Menu">
            <span className={`block w-6 h-0.5 rounded bg-gray-800 dark:bg-slate-100 mb-1 transition-all ${open ? 'rotate-45 translate-y-1.5' : ''}`}></span>
            <span className={`block w-6 h-0.5 rounded bg-gray-800 dark:bg-slate-100 mb-1 transition-all ${open ? 'opacity-0' : ''}`}></span>
            <span className={`block w-6 h-0.5 rounded bg-gray-800 dark:bg-slate-100 transition-all ${open ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
          </button>
        </div>
        {open && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 px-4 pb-4 flex flex-col gap-3 text-sm bg-white/95 dark:bg-slate-900/95 shadow-lg animate-fade-in rounded-b-xl">
            <div className="pt-3 flex items-center gap-2">
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search" className="flex-1 text-xs rounded-full px-3 py-2 bg-slate-100/60 dark:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <button onClick={()=>setTheme(t=>t==='dark'?'light':'dark')} className="px-3 py-2 rounded bg-slate-100 dark:bg-slate-800" aria-label="Toggle theme">
                <span suppressHydrationWarning>{theme==='dark'?'☀️':'🌙'}</span>
              </button>
            </div>
            <Link href="/" onClick={()=>setOpen(false)} className="px-3 py-2 rounded hover:bg-brand-50 dark:hover:bg-slate-800 transition">Home</Link>
            <Link href="/bookmarks" onClick={()=>setOpen(false)} className="px-3 py-2 rounded hover:bg-brand-50 dark:hover:bg-slate-800 transition">Bookmarks</Link>
            {accessToken && <Link href="/dashboard/create-post" onClick={()=>setOpen(false)} className="px-3 py-2 rounded hover:bg-brand-50 dark:hover:bg-slate-800 transition">New Post</Link>}
            {accessToken && role==='ADMIN' && <Link href="/admin" onClick={()=>setOpen(false)} className="px-3 py-2 rounded hover:bg-brand-50 dark:hover:bg-slate-800 transition">Admin</Link>}
            {!accessToken && <Link href="/auth/login" onClick={()=>setOpen(false)} className="px-3 py-2 rounded text-indigo-600 font-medium hover:bg-brand-50 dark:hover:bg-slate-800 transition">Login</Link>}
            {!accessToken && <Link href="/auth/register" onClick={()=>setOpen(false)} className="px-3 py-2 rounded font-medium hover:bg-brand-50 dark:hover:bg-slate-800 transition">Sign Up</Link>}
            {accessToken && <button onClick={()=>{logout(); setOpen(false);}} className="text-left px-3 py-2 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition">Logout</button>}
          </div>
        )}
      </header>
      <main className="flex-1 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-5xl mx-auto px-4 py-8">{children}</div>
      </main>
  <footer className="border-t text-xs text-center py-3 text-gray-500 bg-white/80 dark:bg-slate-900/80 shadow-[0_-1px_0_0_rgba(0,0,0,0.03)]">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <span className="font-medium text-slate-700 dark:text-slate-300">© {new Date().getFullYear()} ChronicleX</span>
          <span className="inline-flex items-center gap-2">
            <span className="text-slate-600 dark:text-slate-400">Built by</span>
            <a href="https://github.com/VanshAgrawal52" target="_blank" rel="noopener" className="text-indigo-600 font-medium hover:underline">Vansh Agrawal</a>
            <a href="https://github.com/VanshAgrawal52" target="_blank" rel="noopener" aria-label="GitHub profile" className="inline-flex items-center text-gray-600 hover:text-indigo-600 transition">
              <GitHubIcon className="w-4 h-4" />
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}

function GitHubIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} role="img" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.6-3.37-1.34-3.37-1.34-.45-1.13-1.1-1.43-1.1-1.43-.9-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 7.07c.85.004 1.71.12 2.51.35 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.85 0 1.33-.01 2.4-.01 2.73 0 .27.18.58.69.48A10.01 10.01 0 0 0 22 12c0-5.52-4.48-10-10-10z" />
    </svg>
  );
}
