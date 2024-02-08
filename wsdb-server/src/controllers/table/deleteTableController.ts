import { Request, Response } from 'express';

import { HttpStatusCode } from 'consts/HttpStatusCode';

import { ErrorMessageSchema } from 'types/ErrorMessageSchema';
import { TableRowValueSchema } from 'types/TableRowValueSchema';

import { Database } from 'libs/storage/Database';
import { TableValidationError, TableValidationErrorDetailsSchema } from 'libs/storage/TableValidationError';

export interface DeleteTableControllerReqParams {
    name: string;
    _id: string;
}

export interface DeleteTableControllerResBodySuccess {
    status: HttpStatusCode;
    payload: TableRowValueSchema;
}

export interface DeleteTableControllerResBodyError {
    status: HttpStatusCode;
    errors: TableValidationErrorDetailsSchema | ErrorMessageSchema;
}

export type DeleteTableControllerResBody = DeleteTableControllerResBodySuccess | DeleteTableControllerResBodyError;

export function deleteTableController(database: Database) {
    return function deleteTableController(
        req: Request<DeleteTableControllerReqParams, DeleteTableControllerResBody, never, never>,
        res: Response<DeleteTableControllerResBody>,
    ) {
        const name = req.params.name;
        const _id = req.params._id;
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

        try {
            const deletedRow = table.remove(_id);

            res.json({
                status: HttpStatusCode.OK,
                payload: deletedRow,
            });
        } catch (error) {
            if (error instanceof TableValidationError) {
                res.status(HttpStatusCode.BAD_REQUEST).json({
                    status: HttpStatusCode.BAD_REQUEST,
                    errors: error.details,
                });
            } else {
                res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                    status: HttpStatusCode.INTERNAL_SERVER_ERROR,
                    errors: [{ message: 'Internal Server Error' }],
                });
            }
        }
    };
}
