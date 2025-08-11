import Head from 'next/head';
import { API_URL } from '../../lib/config';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { renderMarkdown } from '../../lib/markdown';
import { ReactionsBar } from '../../components/ReactionsBar';

export default function PostPage({ post }: any) {
  const { accessToken, fetchWithAuth } = useAuth();
  const showToast = (msg: string, type: 'success'|'error'|'info'='info') => {
    if (type === 'success') toast.success(msg); else if (type === 'error') toast.error(msg); else toast(msg);
  };
  const [comments, setComments] = useState<any[]>(post.comments || []);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    // fetch latest comments
  fetch(`${API_URL}/api/posts/${post.id}/comments`).then(r=>r.json()).then(setComments);
  const wsProto = API_URL.startsWith('https') ? 'wss' : 'ws';
  const wsBase = API_URL.replace(/^https?:\/\//,'');
  const ws = new WebSocket(`${wsProto}://${wsBase}/ws/posts/${post.id}/comments`);
    ws.onmessage = ev => {
      try { const msg = JSON.parse(ev.data); if (msg.type === 'comment') setComments(c=>[...c, msg.payload]); } catch {}
    };
    return () => ws.close();
  }, [post.id]);
  if (!post) return <p>Not found</p>;
  return (
    <>
      <Head>
        <title>{post.title} - ChronicleX</title>
        <meta name="description" content={post.content.slice(0, 150)} />
      </Head>
  <article className="max-w-3xl mx-auto p-4 prose dark:prose-invert">
        <h1>{post.title}</h1>
        <p className="text-sm text-gray-600">by {post.author.username}</p>
  <ReactionsBar postId={post.id} initialCounts={post.reactionCounts} />
  <div dangerouslySetInnerHTML={{ __html: post.rendered ?? post.content }} />
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Comments</h2>
          {accessToken ? (
            <form onSubmit={async e => {
              e.preventDefault();
              if (!newComment.trim()) return;
              setSubmitting(true);
              try {
                const res = await fetchWithAuth(`${API_URL}/api/posts/${post.id}/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: newComment }) });
                if (res.ok) {
                  const c = await res.json();
                  setComments(cs => [...cs, c]);
                  setNewComment('');
                  showToast('Comment posted!', 'success');
                } else {
                  showToast('Failed to post comment', 'error');
                }
              } catch {
                showToast('Failed to post comment', 'error');
              } finally { setSubmitting(false); }
            }} className="mb-6 space-y-2">
              <textarea value={newComment} onChange={e=>setNewComment(e.target.value)} placeholder="Add a comment" rows={3} className="w-full rounded border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <div className="flex justify-end">
                <button disabled={submitting || !newComment.trim()} className="btn px-3 py-1.5 text-xs">{submitting ? 'Posting...' : 'Post Comment'}</button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-gray-500 mb-4">Login to add a comment.</p>
          )}
          <ul className="space-y-2">
            {comments.map(c => <li key={c.id} className="border p-2 rounded">{c.content}</li>)}
          </ul>
        </section>
      </article>
    </>
  );
}

export async function getServerSideProps(ctx: any) {
  const slug = ctx.params.slug;
  const res = await fetch(`${API_URL}/api/posts/${slug}`);
  if (res.status === 404) return { notFound: true };
  const post = await res.json();
  try { post.rendered = await renderMarkdown(post.content); } catch {}
  return { props: { post } };
}
