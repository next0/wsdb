import { Request, Response } from 'express';

import { HttpStatusCode } from 'consts/HttpStatusCode';

import { ErrorMessageSchema } from 'types/ErrorMessageSchema';
import { TableRowValueSchema } from 'types/TableRowValueSchema';

import { Database } from 'libs/storage/Database';
import { TableValidationError, TableValidationErrorDetailsSchema } from 'libs/storage/TableValidationError';

export interface UpdateTableControllerReqParams {
    name: string;
    _id: string;
}

export type UpdateTableControllerReqBody = TableRowValueSchema;

export interface UpdateTableControllerResBodySuccess {
    status: HttpStatusCode;
    payload: TableRowValueSchema;
}

export interface UpdateTableControllerResBodyError {
    status: HttpStatusCode;
    errors: TableValidationErrorDetailsSchema | ErrorMessageSchema;
}

export type UpdateTableControllerResBody = UpdateTableControllerResBodySuccess | UpdateTableControllerResBodyError;

export function updateTableController(database: Database) {
    return function updateTableControllerHandler(
        req: Request<UpdateTableControllerReqParams, UpdateTableControllerResBody, UpdateTableControllerReqBody, never>,
        res: Response<UpdateTableControllerResBody>,
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

        const rowData = req.body;

        if (rowData._id !== _id) {
            res.status(HttpStatusCode.BAD_REQUEST).json({
                status: HttpStatusCode.BAD_REQUEST,
                errors: [
                    {
                        message: `_id from cgi and body not matched`,
                    },
                ],
            });

            return;
        }

        try {
            const updatedRowData = table.update(rowData);

            res.status(HttpStatusCode.OK).json({
                status: HttpStatusCode.OK,
                payload: updatedRowData,
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
