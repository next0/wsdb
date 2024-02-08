import { TableMetadataSchema } from 'types/TableMetadataSchema';

import { Table } from 'libs/storage/Table';

export class Database {
    protected database: Map<string, Table>;

    constructor(metadata: Record<string, TableMetadataSchema>) {
        const database = new Map<string, Table>();

        for (const [name, tableMetadata] of Object.entries(metadata)) {
            database.set(name, new Table(name, tableMetadata));
        }

        this.database = database;
    }

    public list(): Array<{ _id: string }> {
        return [...this.database.keys()].map((key) => ({
            _id: key,
        }));
    }

    public table(name: string): Table | undefined {
        return this.database.get(name);
    }

    public removeTable(name: string): void {
        this.database.delete(name);
    }
}
