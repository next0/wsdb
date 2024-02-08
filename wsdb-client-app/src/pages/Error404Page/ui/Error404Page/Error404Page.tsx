import { NavLink } from 'react-router-dom';

export function Error404Page() {
    return (
        <div className='mx-auto flex w-full flex-col justify-center h-[500px]'>
            <div className='flex flex-col space-y-2 text-center'>
                <h1 className='text-2xl font-semibold tracking-tight'>404. Page not found</h1>
                <p className='text-sm text-muted-foreground'>
                    You can easy go to{' '}
                    <NavLink
                        className='underline underline-offset-4 hover:text-primary'
                        to='/'
                    >
                        home page
                    </NavLink>
                    .
                </p>
            </div>
        </div>
    );
}
