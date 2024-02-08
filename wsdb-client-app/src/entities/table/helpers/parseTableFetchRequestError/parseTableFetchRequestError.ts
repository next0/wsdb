import { TableValidationErrorSchema } from 'entities/table/types/TableValidationErrorSchema';

import { HttpStatusCode } from 'shared/consts/HttpStatusCode';
import { FetchRequestError } from 'shared/helpers/fetchRequest/fetchRequest';

export function parseTableFetchRequestError<TKey extends string>(
    error: FetchRequestError<unknown, unknown> | Error,
    serverErrorsKey: TKey,
): Partial<Record<TKey, string[]>> | undefined {
    if (error instanceof FetchRequestError) {
        const res: Partial<Record<TKey, string[]>> = {};

        if (error.status === HttpStatusCode.BAD_REQUEST) {
            const errorsList: TableValidationErrorSchema[] = error.res?.errors;

            if (Array.isArray(errorsList)) {
                for (const errorItem of errorsList) {
                    const column = (errorItem.column as TKey) ?? serverErrorsKey;

                    if (column) {
                        if (!Object.prototype.hasOwnProperty.call(res, column)) {
                            res[column] = [];
                        }

                        res[column]!.push(errorItem.message);
                    }
                }
            }
        } else {
            res[serverErrorsKey] = [error.description];
        }

        return res;
    }
}
