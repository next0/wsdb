export type TableValidationErrorDetailsSchema = Array<{ column: string; message: string }>;

export class TableValidationError extends Error {
    public readonly details: TableValidationErrorDetailsSchema;

    constructor(message: string, details: TableValidationErrorDetailsSchema) {
        super(message);
        this.details = details;
        Object.setPrototypeOf(this, TableValidationError.prototype);
    }

    public toString() {
        return this.message + '\n' + JSON.stringify(this.details);
    }
}
