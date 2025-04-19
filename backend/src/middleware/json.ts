import { Request, Response, NextFunction } from 'express';

export function jsonMiddleware(req: Request, res: Response, next: NextFunction) {
    const start = process.hrtime.bigint();

    const originalJson = res.json.bind(res);

    res.json = (body: any): Response => {
        if (body?.overwrite === true) {
            const { overwrite, ...rest } = body;
            return originalJson(rest);
        }

        const end = process.hrtime.bigint();
        const durationNs = Number(end - start);

        let responseTime: string;
        if (durationNs < 1000) {
            responseTime = `${Math.round(durationNs)}ns`;
        } else if (durationNs < 1000000) {
            responseTime = `${(durationNs / 1000).toFixed(2)}µs`;
        } else if (durationNs < 1000000000) {
            responseTime = `${(durationNs / 1000000).toFixed(2)}ms`;
        } else {
            responseTime = `${(durationNs / 1000000000).toFixed(2)}s`;
        }

        const { error, message, ...rest } = body || {};
        const finalBody = {
            responseTime,
            error: error ?? null,
            message: message ?? null,
            data: Object.keys(rest).length ? rest : null,
        };

        return originalJson(finalBody);
    };

    next();
}
