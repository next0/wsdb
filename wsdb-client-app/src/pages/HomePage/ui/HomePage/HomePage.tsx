export function HomePage() {
    return (
        <div className='mx-auto flex w-full flex-col justify-center h-[500px]'>
            <div className='flex flex-col space-y-2 text-center'>
                <h1 className='text-2xl font-semibold tracking-tight'>Welcome to WebSocket DB</h1>
                <p className='text-sm text-muted-foreground'>Select you table in sidebar and enjoy.</p>
            </div>
        </div>
    );
}
