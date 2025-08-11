import 'reflect-metadata';
import { initWorkers } from './modules/queue/index.js';
import { logger } from '@common/lib/logger';
import { env } from '@config/env';

async function start() {
  logger.info('Starting worker...');
  initWorkers();
  logger.info('Worker initialized (QUEUE_ENABLE=' + env.QUEUE_ENABLE + ')');
  setInterval(()=>{}, 60_000); // keep alive
}
start();
