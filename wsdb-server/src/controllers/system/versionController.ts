import { Request, Response } from 'express';

import { HttpStatusCode } from 'consts/HttpStatusCode';

const VERSION = process.env.WSDB_VERSION || '0.0.1';

export interface VersionControllerResBody {
    status: HttpStatusCode;
    payload: {
        version: string;
    };
}

export function versionController() {
    return function versionControllerHandler(
        req: Request<never, VersionControllerResBody, never, never>,
        res: Response<VersionControllerResBody>,
    ) {
        res.status(HttpStatusCode.OK).json({
            status: HttpStatusCode.OK,
            payload: {
                version: VERSION,
            },
        });
    };
}
