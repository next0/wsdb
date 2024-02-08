import { useQuery } from '@tanstack/react-query';
import * as React from 'react';
import { NavLink } from 'react-router-dom';

import { fetchTablesList } from 'app/api/fetchTablesList/fetchTablesList';

import { cn } from 'shared/helpers/cn/cn';
import { buttonVariants } from 'shared/libs/ui/button';

interface AppSidebarNavProps {
    className?: string;
}

export function AppSidebarNav({ className }: AppSidebarNavProps) {
    const { isPending, data } = useQuery({
        queryKey: ['tablesList'],
        queryFn: fetchTablesList,
    });

    const items = React.useMemo<Array<{ href: string; title: string }>>(() => {
        return (data?.payload ?? []).map(({ _id: tableName }) => {
            return {
                title: tableName,
                href: '/table/' + tableName,
            };
        });
    }, [data]);

    return (
        <nav className={cn('flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1', className)}>
            {isPending ? (
                <span className={cn(buttonVariants({ variant: 'ghost' }), 'justify-start')}>Loading...</span>
            ) : (
                items.map((item) => (
                    <NavLink
                        key={item.href}
                        to={item.href}
                        className={({ isActive }) =>
                            cn(
                                buttonVariants({ variant: 'ghost' }),
                                isActive ? 'bg-muted hover:bg-muted' : 'hover:bg-transparent hover:underline',
                                'justify-start',
                            )
                        }
                    >
                        {item.title}
                    </NavLink>
                ))
            )}
        </nav>
    );
}
