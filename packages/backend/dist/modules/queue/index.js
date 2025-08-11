"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailQueue = void 0;
exports.initWorkers = initWorkers;
const bullmq_1 = require("bullmq");
const env_1 = require("../../config/env");
const connection = env_1.env.REDIS_URL ? { url: env_1.env.REDIS_URL } : null;
exports.emailQueue = connection ? new bullmq_1.Queue('email', { connection }) : null;
function initWorkers() {
    if (!env_1.env.QUEUE_ENABLE || !connection)
        return;
    new bullmq_1.Worker('email', async (job) => {
        console.log('Process email job', job.data);
    }, { connection });
}
//# sourceMappingURL=index.js.map