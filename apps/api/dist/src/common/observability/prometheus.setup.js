"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupPrometheus = void 0;
const prom_client_1 = require("prom-client");
let initialized = false;
const setupPrometheus = (app) => {
    if (initialized) {
        return;
    }
    initialized = true;
    app.use('/metrics', async (_req, res) => {
        res.set('Content-Type', prom_client_1.register.contentType);
        res.end(await prom_client_1.register.metrics());
    });
    (0, prom_client_1.collectDefaultMetrics)();
};
exports.setupPrometheus = setupPrometheus;
