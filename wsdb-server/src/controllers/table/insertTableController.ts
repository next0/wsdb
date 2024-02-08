import { Request, Response } from 'express';

import { HttpStatusCode } from 'consts/HttpStatusCode';

import { ErrorMessageSchema } from 'types/ErrorMessageSchema';
import { TableRowValueSchema } from 'types/TableRowValueSchema';

import { Database } from 'libs/storage/Database';
import { TableValidationError, TableValidationErrorDetailsSchema } from 'libs/storage/TableValidationError';

export interface InsertTableControllerReqParams {
    name: string;
}

export type InsertTableControllerReqBody = Omit<TableRowValueSchema, '_id'>;

export interface InsertTableControllerResBodySuccess {
    status: HttpStatusCode;
    payload: TableRowValueSchema;
}

export interface InsertTableControllerResBodyError {
    status: HttpStatusCode;
    errors: TableValidationErrorDetailsSchema | ErrorMessageSchema;
}

export type InsertTableControllerResBody = InsertTableControllerResBodySuccess | InsertTableControllerResBodyError;

export function insertTableController(database: Database) {
    return function insertTableControllerHandler(
        req: Request<InsertTableControllerReqParams, InsertTableControllerResBody, InsertTableControllerReqBody, never>,
        res: Response<InsertTableControllerResBody>,
    ) {
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

        const rowData = req.body;

        try {
            const insertedRowData = table.insert(rowData);

            res.status(HttpStatusCode.CREATED).json({
                status: HttpStatusCode.CREATED,
                payload: insertedRowData,
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
