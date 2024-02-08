interface ErrorDetails extends Error {
    details: unknown;
}

expect.addSnapshotSerializer({
    serialize(val, config, indentation, depth, refs, printer) {
        const error = val as ErrorDetails;
        return printer(
            {
                error: error.constructor.name,
                message: error.message,
                details: error.details,
            },
            config,
            indentation,
            depth,
            refs,
        );
    },
    test(val) {
        return val && val instanceof Error && Object.prototype.hasOwnProperty.call(val, 'details');
    },
});
