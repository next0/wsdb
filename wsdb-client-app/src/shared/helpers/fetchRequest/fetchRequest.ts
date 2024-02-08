export interface FetchRequestErrorPayload<TReqSchema, TResSchema> {
    status: number;
    description: string;
    req: { url: string; data: TReqSchema };
    res: TResSchema;
    time: number;
}

export class FetchRequestError<TReqSchema, TResSchema>
    extends Error
    implements FetchRequestErrorPayload<TReqSchema, TResSchema>
{
    public readonly status: number;
    public readonly description: string;
    public readonly req: { url: string; data: TReqSchema };
    public readonly res: TResSchema;
    public readonly time: number;

    constructor(message: string, payload: FetchRequestErrorPayload<TReqSchema, TResSchema>) {
        super(message);

        this.status = payload.status;
        this.description = payload.description;
        this.req = payload.req;
        this.res = payload.res;
        this.time = payload.time;

        Object.setPrototypeOf(this, FetchRequestError.prototype);
    }

    public serialize(): FetchRequestErrorPayload<TReqSchema, TResSchema> {
        return {
            status: this.status,
            description: this.description,
            req: this.req,
            res: this.res,
            time: this.time,
        };
    }
}

export function fetchRequest<TReqSchema, TResSchema>(
    url: string,
    data: TReqSchema,
    options?: RequestInit,
): Promise<TResSchema> {
    const startTime = performance.now();
    const method = options?.method ?? 'GET';

    const headers: Record<string, string> = {};

    if (method !== 'GET') {
        headers['content-type'] = 'application/json';
    }

    return fetch(url, {
        ...options,
        method,
        body: method !== 'GET' ? JSON.stringify(data) : undefined,
        headers,
        credentials: 'same-origin',
    })
        .catch((error) => {
            const time = performance.now() - startTime;

            throw new FetchRequestError<TReqSchema, unknown>([method, url, 'NETWORK_ERROR'].join(' '), {
                status: 0,
                description: error?.message ?? 'NETWORK_ERROR',
                req: {
                    url,
                    data,
                },
                res: undefined,
                time,
            });
        })
        .then((res) => {
            const time = performance.now() - startTime;

            if (!res.ok) {
                return res
                    .json()
                    .catch((error) => {
                        throw new FetchRequestError<TReqSchema, unknown>([method, url, res.status].join(' '), {
                            status: res.status,
                            description: error?.message ?? 'PARSING_ERROR',
                            req: {
                                url,
                                data,
                            },
                            res: undefined,
                            time,
                        });
                    })
                    .then((payload) => {
                        throw new FetchRequestError<TReqSchema, unknown>([method, url, res.status].join(' '), {
                            status: res.status,
                            description: 'HTTP_ERROR',
                            req: {
                                url,
                                data,
                            },
                            res: payload,
                            time,
                        });
                    });
            }

            return res.json();
        });
}
