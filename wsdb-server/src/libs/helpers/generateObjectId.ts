const HEX_RADIX = 16;
const SECOND = 1000;

/**
 * inspired by MongoDB ObjectID
 */
export function generateObjectId(): string {
    const timestamp = ((Date.now() / SECOND) | 0).toString(HEX_RADIX);

    return (
        timestamp +
        'xxxxxxxxxxxxxxxx'
            .replace(/x/g, function () {
                return ((Math.random() * HEX_RADIX) | 0).toString(HEX_RADIX);
            })
            .toLowerCase()
    );
}
