import { useState } from 'react';
import { API_URL } from '../lib/config';
import { useAuth } from '../context/AuthContext';

const REACTIONS = ['LIKE','LOVE','CLAP','WOW'] as const;

export function ReactionsBar({ postId, initialCounts }: { postId: string; initialCounts?: Record<string, number>; }) {
  const { accessToken } = useAuth();
  const [counts, setCounts] = useState<Record<string, number>>(()=>initialCounts || {});
  const [pending, setPending] = useState<string | null>(null);

  async function react(type: string) {
    if (!accessToken) return; // could show login prompt
    setPending(type);
    // optimistic update
    setCounts(c => ({ ...c, [type]: (c[type] || 0) + 1 }));
    try {
      await fetch(`${API_URL}/graphql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ query: 'mutation($id:ID!,$t:String!){ react(postId:$id,type:$t) }', variables: { id: postId, t: type } })
      });
    } catch {
      // rollback on failure
      setCounts(c => ({ ...c, [type]: Math.max(0, (c[type] || 1) - 1) }));
    } finally { setPending(null); }
  }

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {REACTIONS.map(r => (
        <button key={r} disabled={!accessToken || pending === r} onClick={()=>react(r)}
          className="px-3 py-1 rounded-full border text-xs font-medium bg-white dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-slate-700 transition flex items-center gap-1 disabled:opacity-40">
          <span>{icon(r)}</span>
          <span>{r.toLowerCase()}</span>
          <span className="text-brand-600 font-semibold">{counts[r] || 0}</span>
        </button>
      ))}
      {!accessToken && <span className="text-xs text-gray-500">Login to react</span>}
    </div>
  );
}

function icon(type: string) {
  switch(type){
    case 'LOVE': return '💜';
    case 'CLAP': return '👏';
    case 'WOW': return '🤯';
    default: return '👍';
  }
}
