// Simple in-memory comments channel registry
export const commentChannels = new Map<string, Set<any>>();

export function registerCommentSocket(postId: string, socket: any) {
  if (!commentChannels.has(postId)) commentChannels.set(postId, new Set());
  const set = commentChannels.get(postId)!;
  set.add(socket);
  socket.on('close', () => set.delete(socket));
}

export function broadcastComment(postId: string, message: any) {
  const set = commentChannels.get(postId);
  if (!set) return;
  const data = JSON.stringify({ type: 'comment', payload: message });
  for (const client of set) {
    try { client.send(data); } catch { /* ignore */ }
  }
}
