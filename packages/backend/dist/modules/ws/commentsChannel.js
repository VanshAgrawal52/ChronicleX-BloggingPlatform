"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentChannels = void 0;
exports.registerCommentSocket = registerCommentSocket;
exports.broadcastComment = broadcastComment;
exports.commentChannels = new Map();
function registerCommentSocket(postId, socket) {
    if (!exports.commentChannels.has(postId))
        exports.commentChannels.set(postId, new Set());
    const set = exports.commentChannels.get(postId);
    set.add(socket);
    socket.on('close', () => set.delete(socket));
}
function broadcastComment(postId, message) {
    const set = exports.commentChannels.get(postId);
    if (!set)
        return;
    const data = JSON.stringify({ type: 'comment', payload: message });
    for (const client of set) {
        try {
            client.send(data);
        }
        catch { }
    }
}
//# sourceMappingURL=commentsChannel.js.map