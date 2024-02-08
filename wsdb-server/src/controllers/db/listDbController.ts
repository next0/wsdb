import { Request, Response } from 'express';

import { HttpStatusCode } from 'consts/HttpStatusCode';

import { ErrorMessageSchema } from 'types/ErrorMessageSchema';

import { Database } from 'libs/storage/Database';

export interface ListDbControllerReqParams {}

export interface ListDbControllerResBodySuccess {
    status: HttpStatusCode;
    payload: Array<{ _id: string }>;
}

export interface ListDbControllerResBodyError {
    status: HttpStatusCode;
    errors: ErrorMessageSchema;
}

export type ListDbControllerResBody = ListDbControllerResBodySuccess | ListDbControllerResBodyError;

export function listDbController(database: Database) {
    return function listDbControllerHandler(
        req: Request<ListDbControllerReqParams, ListDbControllerResBody, never, never>,
        res: Response<ListDbControllerResBody>,
    ) {
        try {
            const tables = database.list();

            res.json({
                status: HttpStatusCode.OK,
                payload: tables,
            });
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                status: HttpStatusCode.INTERNAL_SERVER_ERROR,
                errors: [{ message: 'Internal Server Error' }],
            });
        }
    };
}
