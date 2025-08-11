// @ts-ignore BullMQ types resolution workaround
import { Queue, Worker } from 'bullmq';
import { env } from '@config/env';
const connection = env.REDIS_URL ? ({ url: env.REDIS_URL } as any) : null;

export const emailQueue = connection ? new Queue('email', { connection }) : (null as any);

export function initWorkers() {
  if (!env.QUEUE_ENABLE || !connection) return;
  new Worker('email', async job => {
    // placeholder: send email
    console.log('Process email job', job.data);
  }, { connection });
}
