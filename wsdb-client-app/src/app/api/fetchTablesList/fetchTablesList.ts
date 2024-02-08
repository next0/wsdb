import { fetchRequest } from 'shared/helpers/fetchRequest/fetchRequest';

export interface FetchTablesListResponse {
    status: number;
    payload: Array<{ _id: string }>;
}

export function fetchTablesList() {
    return fetchRequest<unknown, FetchTablesListResponse>('/api/v1/table', {});
}
