import * as React from 'react';
import { NavLink } from 'react-router-dom';

import { Separator } from 'shared/libs/ui/separator';

export interface AppLayoutProps {
    className?: string;
    sidebar: React.ReactNode;
}

export const AppLayout: React.FC<React.PropsWithChildren<AppLayoutProps>> = function AppLayout({ sidebar, children }) {
    return (
        <div className='space-y-6 p-10 pb-16 md:block'>
            <div className='flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0'>
                <aside
                    className='lg:min-w-[200px] lg:max-w-[250px]'
                    data-testid='aside'
                >
                    <NavLink to='/'>
                        <h2 className='text-2xl font-bold tracking-tight'>WSDB Client</h2>
                    </NavLink>
                    <Separator className='my-4' />
                    {sidebar}
                </aside>
                <div className='flex-1 lg:max-w-1xl'>{children}</div>
            </div>
        </div>
    );
};
