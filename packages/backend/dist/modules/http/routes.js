"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
const routes_js_1 = require("../auth/routes.js");
const routes_js_2 = require("../posts/routes.js");
const routes_js_3 = require("../comments/routes.js");
const routes_js_4 = require("../reactions/routes.js");
const routes_js_5 = require("../uploads/routes.js");
async function registerRoutes(app) {
    await (0, routes_js_1.authRoutes)(app);
    await (0, routes_js_2.postRoutes)(app);
    await (0, routes_js_3.commentRoutes)(app);
    await (0, routes_js_4.reactionRoutes)(app);
    await (0, routes_js_5.uploadRoutes)(app);
}
//# sourceMappingURL=routes.js.map