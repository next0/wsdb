import { Request, Response } from 'express';

import { HttpStatusCode } from 'consts/HttpStatusCode';

import { ErrorMessageSchema } from 'types/ErrorMessageSchema';
import { TableMetadataSchema } from 'types/TableMetadataSchema';
import { TableRowValueSchema } from 'types/TableRowValueSchema';

import { Database } from 'libs/storage/Database';

export interface ListTableControllerReqParams {
    name: string;
}

export interface ListTableControllerResBodySuccess {
    status: HttpStatusCode;
    payload: {
        metadata: TableMetadataSchema;
        data: TableRowValueSchema[];
    };
}

export interface ListTableControllerResBodyError {
    status: HttpStatusCode;
    errors: ErrorMessageSchema;
}

export type ListTableControllerResBody = ListTableControllerResBodySuccess | ListTableControllerResBodyError;

export function listTableController(database: Database) {
    return function listTableControllerHandler(
        req: Request<ListTableControllerReqParams, ListTableControllerResBody, never, never>,
        res: Response<ListTableControllerResBody>,
    ) {
        try {
            const name = req.params.name;
            const table = database.table(name);

            if (!table) {
                res.status(HttpStatusCode.BAD_REQUEST).json({
                    status: HttpStatusCode.BAD_REQUEST,
                    errors: [
                        {
                            message: `table "${name}" not found`,
                        },
                    ],
                });

                return;
            }

            res.json({
                status: HttpStatusCode.OK,
                payload: {
                    metadata: table.metadata,
                    data: table.list(),
                },
            });
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                status: HttpStatusCode.INTERNAL_SERVER_ERROR,
                errors: [{ message: 'Internal Server Error' }],
            });
        }
    };
}
