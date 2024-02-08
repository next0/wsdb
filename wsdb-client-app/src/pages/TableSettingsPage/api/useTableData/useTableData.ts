import * as React from 'react';

import { DBConnector, DBConnectorTableState } from 'entities/app/libs/DBConnector/DBConnector';
import { TableMetadataSchema } from 'entities/table/types/TableMetadataSchema';
import { TableRowValueSchema } from 'entities/table/types/TableRowValueSchema';

export interface UseTableDataState {
    isLoading: boolean;
    metadata?: TableMetadataSchema;
    data?: TableRowValueSchema[];
}

export function useTableData(table: string) {
    const [state, setState] = React.useState<UseTableDataState>({ isLoading: true });

    React.useEffect(() => {
        if (!table) {
            setState({
                isLoading: false,
                data: [],
                metadata: {
                    columns: {},
                },
            });
            return;
        }

        const db = DBConnector.getInstance({ immutable: true });

        setState({
            isLoading: true,
        });

        // auto unsubscribe
        return db.subscribe(table, function update(state: DBConnectorTableState) {
            setState({
                isLoading: false,
                ...state,
            });
        });
    }, [table]);

    return state;
}
