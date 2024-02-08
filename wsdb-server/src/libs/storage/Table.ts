import { TableEventSchema } from 'types/TableEventSchema';
import { TableMetadataSchema } from 'types/TableMetadataSchema';
import { TableRowValueSchema } from 'types/TableRowValueSchema';

import { generateObjectId } from 'libs/helpers/generateObjectId';
import { PubSub } from 'libs/storage/PubSub';
import { TableValidationError } from 'libs/storage/TableValidationError';

export interface TableMutationOptions {
    /**
     * make updates in DB without triggering any subscribers
     */
    silent?: boolean;
}

export class Table extends PubSub<TableEventSchema> {
    public readonly metadata: TableMetadataSchema;
    public readonly tableName: string;
    protected store: TableRowValueSchema[];

    constructor(tableName: string, metadata: TableMetadataSchema) {
        super();

        this.tableName = tableName;
        this.metadata = metadata;
        this.store = [];
    }

    public list(): TableRowValueSchema[] {
        return this.store;
    }

    public insert(row: Omit<TableRowValueSchema, '_id'>, options?: TableMutationOptions): TableRowValueSchema {
        const transformedRow = this.transformRowData(row, true);

        this.store.push(transformedRow);

        if (!options?.silent) {
            this.publish({
                type: 'INSERT',
                table: this.tableName,
                payload: transformedRow,
            });
        }

        return transformedRow;
    }

    public update(row: TableRowValueSchema, options?: TableMutationOptions): TableRowValueSchema {
        const transformedRow = this.transformRowData(row);

        const index = this.findIndexRowById(transformedRow._id);

        if (index === -1) {
            // error
            throw new TableValidationError('Row not found', [
                {
                    column: '_id',
                    message: `found no records with value "${transformedRow._id}"`,
                },
            ]);
        }

        this.store[index] = transformedRow;

        if (!options?.silent) {
            this.publish({
                type: 'UPDATE',
                table: this.tableName,
                payload: transformedRow,
            });
        }

        return transformedRow;
    }

    public remove(_id: string, options?: TableMutationOptions): TableRowValueSchema {
        const index = this.findIndexRowById(_id);

        if (index === -1) {
            // error
            throw new TableValidationError('Row not found', [
                {
                    column: '_id',
                    message: `found no records with primary value "${_id}"`,
                },
            ]);
        }

        const deletedRow = { _id };

        this.store.splice(index, 1);

        if (!options?.silent) {
            this.publish({
                type: 'REMOVE',
                table: this.tableName,
                payload: deletedRow,
            });
        }

        return deletedRow;
    }

    protected findIndexRowById(_id: string | undefined): number {
        if (_id === undefined) {
            return -1;
        }

        return this.store.findIndex((current) => current._id === _id);
    }

    protected transformRowData(
        row: Omit<TableRowValueSchema, '_id'>,
        autogenerateId: boolean = false,
    ): TableRowValueSchema {
        const { columns } = this.metadata;

        const transformedRow: TableRowValueSchema = { _id: '' };
        const errors: Array<{ column: string; message: string }> = [];

        if (!row.hasOwnProperty('_id')) {
            if (autogenerateId) {
                transformedRow._id = this.generateObjectId();
            } else {
                errors.push({
                    column: '_id',
                    message: 'not found',
                });
            }
        } else {
            transformedRow._id = row._id as string;
        }

        for (const [name, column] of Object.entries(columns)) {
            const isEmpty = !row.hasOwnProperty(name);
            const dataType = typeof row[name];

            if (column.type === 'number') {
                if (!isEmpty && dataType !== 'number') {
                    errors.push({
                        message: `column "${name}" expected type "number" but got "${dataType}"`,
                        column: name,
                    });

                    continue;
                }

                transformedRow[name] = isEmpty ? column.defaults ?? 0 : row[name];
            } else if (column.type === 'string') {
                if (!isEmpty && dataType !== 'string') {
                    errors.push({
                        message: `column "${name}" expected type "string" but got "${dataType}"`,
                        column: name,
                    });

                    continue;
                }

                transformedRow[name] = isEmpty ? column.defaults ?? '' : row[name];
            } else if (column.type === 'date') {
                if (!isEmpty && dataType !== 'string' && dataType !== 'number') {
                    errors.push({
                        message: `column "${name}" expected type "string" or "number" but got "${dataType}"`,
                        column: name,
                    });

                    continue;
                }

                transformedRow[name] = isEmpty ? new Date(column.defaults ?? 0) : new Date(row[name]);
            } else if (column.type === 'enum') {
                if (!isEmpty && (dataType !== 'string' || !column.values.some((value) => value === row[name]))) {
                    errors.push({
                        message: `column "${name}" expected type "enum" but got "${dataType}"`,
                        column: name,
                    });

                    continue;
                }

                transformedRow[name] = isEmpty ? column.defaults : row[name];
            }
        }

        if (errors.length) {
            throw new TableValidationError('Invalid row schema', errors);
        }

        return transformedRow;
    }

    protected generateObjectId(): string {
        return generateObjectId();
    }
}
