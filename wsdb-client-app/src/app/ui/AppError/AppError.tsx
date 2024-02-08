export interface AppErrorProps {
    error: Error;
}

export function AppError({ error }: AppErrorProps) {
    return (
        <div className='mx-auto flex w-full flex-col justify-center h-[800px]'>
            <div className='flex flex-col space-y-2 text-center'>
                <h1 className='text-2xl font-semibold tracking-tight'>Ooops... Runtime Error.</h1>
                <p className='text-sm text-muted-foreground'>{error?.message}</p>
            </div>
        </div>
    );
}
