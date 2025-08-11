"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const index_js_1 = require("./modules/queue/index.js");
const logger_1 = require("./common/lib/logger");
const env_1 = require("./config/env");
async function start() {
    logger_1.logger.info('Starting worker...');
    (0, index_js_1.initWorkers)();
    logger_1.logger.info('Worker initialized (QUEUE_ENABLE=' + env_1.env.QUEUE_ENABLE + ')');
    setInterval(() => { }, 60_000);
}
start();
//# sourceMappingURL=worker.js.map