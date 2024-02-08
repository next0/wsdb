import { TableEventSchema } from 'types/TableEventSchema';

import { Table } from 'libs/storage/Table';

function mockTableNextObjectId(table: Table, _id: string) {
    vi.spyOn(table, 'generateObjectId' as never).mockReturnValueOnce(_id);
}

describe('Table', () => {
    let table: Table;

    beforeEach(() => {
        table = new Table('activity_records', {
            columns: {
                uid: {
                    type: 'number',
                },
                name: {
                    type: 'string',
                },
                type: {
                    type: 'enum',
                    values: ['TEXT', 'IMAGE', 'VIDEO'],
                    defaults: 'TEXT',
                },
                userId: {
                    type: 'string',
                },
                eventTime: {
                    type: 'date',
                },
            },
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('metadata', () => {
        expect(table.tableName).toBe('activity_records');
    });

    describe('insert', () => {
        it('normal', () => {
            mockTableNextObjectId(table, '6598864039d81bc75a5a9ee8');

            table.insert({
                uid: 1,
                name: 'lorem',
                type: 'TEXT',
                userId: '0123456789abcdf',
                eventTime: '2024-01-05T22:43:39.652Z',
            });

            expect(table.list()).toMatchInlineSnapshot(`
              [
                {
                  "_id": "6598864039d81bc75a5a9ee8",
                  "eventTime": 2024-01-05T22:43:39.652Z,
                  "name": "lorem",
                  "type": "TEXT",
                  "uid": 1,
                  "userId": "0123456789abcdf",
                },
              ]
            `);

            mockTableNextObjectId(table, '6598880083096578af01042d');

            table.insert({
                uid: 2,
                name: 'ipsum',
                type: 'TEXT',
                userId: '0123456789abcdf',
                eventTime: '2024-01-04T12:15:55.451Z',
            });

            expect(table.list()).toMatchInlineSnapshot(`
              [
                {
                  "_id": "6598864039d81bc75a5a9ee8",
                  "eventTime": 2024-01-05T22:43:39.652Z,
                  "name": "lorem",
                  "type": "TEXT",
                  "uid": 1,
                  "userId": "0123456789abcdf",
                },
                {
                  "_id": "6598880083096578af01042d",
                  "eventTime": 2024-01-04T12:15:55.451Z,
                  "name": "ipsum",
                  "type": "TEXT",
                  "uid": 2,
                  "userId": "0123456789abcdf",
                },
              ]
            `);
        });

        it('default', () => {
            mockTableNextObjectId(table, '6598864039d81bc75a5a9ee8');

            table.insert({
                type: 'TEXT',
                userId: '0123456789abcdf',
            });

            expect(table.list()).toMatchInlineSnapshot(`
              [
                {
                  "_id": "6598864039d81bc75a5a9ee8",
                  "eventTime": 1970-01-01T00:00:00.000Z,
                  "name": "",
                  "type": "TEXT",
                  "uid": 0,
                  "userId": "0123456789abcdf",
                },
              ]
            `);
        });

        it('validation', () => {
            expect(() =>
                table.insert({
                    uid: '1',
                    name: 1,
                    type: 'FOO',
                    userId: '0123456789abcdf',
                    eventTime: 'bar',
                }),
            ).toThrowErrorMatchingInlineSnapshot(`
              {
                "details": [
                  {
                    "column": "uid",
                    "message": "column "uid" expected type "number" but got "string"",
                  },
                  {
                    "column": "name",
                    "message": "column "name" expected type "string" but got "number"",
                  },
                  {
                    "column": "type",
                    "message": "column "type" expected type "enum" but got "string"",
                  },
                ],
                "error": "TableValidationError",
                "message": "Invalid row schema",
              }
            `);
        });

        it('publish event', () => {
            mockTableNextObjectId(table, '6598864039d81bc75a5a9ee8');

            const callback = vi.fn();

            table.subscribe(callback);

            table.insert({
                uid: 1,
                name: 'lorem',
                type: 'TEXT',
                userId: '0123456789abcdf',
                eventTime: '2024-01-05T22:43:39.652Z',
            });

            expect(callback).toHaveBeenCalledOnce();

            const event: TableEventSchema = {
                type: 'INSERT',
                table: 'activity_records',
                payload: {
                    _id: '6598864039d81bc75a5a9ee8',
                    uid: 1,
                    name: 'lorem',
                    type: 'TEXT',
                    userId: '0123456789abcdf',
                    eventTime: new Date('2024-01-05T22:43:39.652Z'),
                },
            };

            expect(callback).toBeCalledWith(event, JSON.stringify(event));

            table.insert(
                {
                    uid: 1,
                    name: 'lorem',
                    type: 'TEXT',
                    userId: '0123456789abcdf',
                    eventTime: '2024-01-05T22:43:39.652Z',
                },
                { silent: true },
            );

            expect(callback).toHaveBeenCalledOnce();
        });
    });

    describe('update', () => {
        beforeEach(() => {
            mockTableNextObjectId(table, '6598864039d81bc75a5a9ee8');

            table.insert({
                uid: 1,
                name: 'lorem',
                type: 'TEXT',
                userId: '0123456789abcdf',
                eventTime: '2024-01-05T22:43:39.652Z',
            });
        });

        it('normal', () => {
            table.update({
                _id: '6598864039d81bc75a5a9ee8',
                uid: 2,
                name: 'lorem',
                type: 'TEXT',
                userId: '0123456789abcdf',
                eventTime: '2024-01-05T22:43:39.652Z',
            });

            expect(table.list()).toMatchInlineSnapshot(`
              [
                {
                  "_id": "6598864039d81bc75a5a9ee8",
                  "eventTime": 2024-01-05T22:43:39.652Z,
                  "name": "lorem",
                  "type": "TEXT",
                  "uid": 2,
                  "userId": "0123456789abcdf",
                },
              ]
            `);

            table.update({
                _id: '6598864039d81bc75a5a9ee8',
                uid: 2,
                name: 'ipsum',
                type: 'TEXT',
                userId: '0123456789abcdf',
                eventTime: '2024-01-04T12:15:55.451Z',
            });

            expect(table.list()).toMatchInlineSnapshot(`
              [
                {
                  "_id": "6598864039d81bc75a5a9ee8",
                  "eventTime": 2024-01-04T12:15:55.451Z,
                  "name": "ipsum",
                  "type": "TEXT",
                  "uid": 2,
                  "userId": "0123456789abcdf",
                },
              ]
            `);
        });

        it('validation', () => {
            expect(() =>
                table.update({
                    _id: '6598864039d81bc75a5a9ee8',
                    uid: '1',
                    name: 1,
                    type: 'FOO',
                    userId: '0123456789abcdf',
                    eventTime: 'bar',
                }),
            ).toThrowErrorMatchingInlineSnapshot(`
              {
                "details": [
                  {
                    "column": "uid",
                    "message": "column "uid" expected type "number" but got "string"",
                  },
                  {
                    "column": "name",
                    "message": "column "name" expected type "string" but got "number"",
                  },
                  {
                    "column": "type",
                    "message": "column "type" expected type "enum" but got "string"",
                  },
                ],
                "error": "TableValidationError",
                "message": "Invalid row schema",
              }
            `);
        });

        it('publish event', () => {
            const callback = vi.fn();

            table.subscribe(callback);

            table.update({
                _id: '6598864039d81bc75a5a9ee8',
                uid: 1,
                name: 'lorem',
                type: 'IMAGE',
                userId: '0123456789abcdf',
                eventTime: '2024-01-05T22:43:39.652Z',
            });

            expect(callback).toHaveBeenCalledOnce();

            const event: TableEventSchema = {
                type: 'UPDATE',
                table: 'activity_records',
                payload: {
                    _id: '6598864039d81bc75a5a9ee8',
                    uid: 1,
                    name: 'lorem',
                    type: 'IMAGE',
                    userId: '0123456789abcdf',
                    eventTime: new Date('2024-01-05T22:43:39.652Z'),
                },
            };

            expect(callback).toBeCalledWith(event, JSON.stringify(event));

            table.update(
                {
                    _id: '6598864039d81bc75a5a9ee8',
                    uid: 2,
                    name: 'lorem',
                    type: 'IMAGE',
                    userId: '0123456789abcdf',
                    eventTime: '2024-01-05T22:43:39.652Z',
                },
                { silent: true },
            );

            expect(callback).toHaveBeenCalledOnce();
        });
    });

    describe('delete', () => {
        beforeEach(() => {
            mockTableNextObjectId(table, '6598864039d81bc75a5a9ee8');

            table.insert({
                uid: 1,
                name: 'lorem',
                type: 'TEXT',
                userId: '0123456789abcdf',
                eventTime: '2024-01-05T22:43:39.652Z',
            });

            mockTableNextObjectId(table, '6598880083096578af01042d');

            table.insert({
                uid: 2,
                name: 'ipsum',
                type: 'TEXT',
                userId: '0123456789abcdf',
                eventTime: '2024-01-04T12:15:55.451Z',
            });
        });

        it('normal', () => {
            table.remove('6598864039d81bc75a5a9ee8');

            expect(table.list()).toMatchInlineSnapshot(`
              [
                {
                  "_id": "6598880083096578af01042d",
                  "eventTime": 2024-01-04T12:15:55.451Z,
                  "name": "ipsum",
                  "type": "TEXT",
                  "uid": 2,
                  "userId": "0123456789abcdf",
                },
              ]
            `);

            table.remove('6598880083096578af01042d');

            expect(table.list()).toMatchInlineSnapshot(`[]`);
        });

        it('validation', () => {
            expect(() => table.remove('a598880083096578af01042d')).toThrowErrorMatchingInlineSnapshot(`
              {
                "details": [
                  {
                    "column": "_id",
                    "message": "found no records with primary value "a598880083096578af01042d"",
                  },
                ],
                "error": "TableValidationError",
                "message": "Row not found",
              }
            `);
        });

        it('publish event', () => {
            const callback = vi.fn();

            table.subscribe(callback);

            table.remove('6598864039d81bc75a5a9ee8');

            expect(callback).toHaveBeenCalledOnce();

            const event: TableEventSchema = {
                type: 'REMOVE',
                table: 'activity_records',
                payload: {
                    _id: '6598864039d81bc75a5a9ee8',
                },
            };

            expect(callback).toBeCalledWith(event, JSON.stringify(event));

            table.remove('6598880083096578af01042d', { silent: true });

            expect(callback).toHaveBeenCalledOnce();
        });
    });
});
