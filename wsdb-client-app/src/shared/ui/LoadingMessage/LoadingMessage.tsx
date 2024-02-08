export interface LoadingMessageProps {
    message: string;
}

export function LoadingMessage({ message }: LoadingMessageProps) {
    return (
        <div className='mx-auto flex w-full flex-col justify-center h-[500px]'>
            <div className='flex flex-col space-y-2 text-center'>
                <h3 className='text-2xl font-semibold tracking-tight'>{message}</h3>
            </div>
        </div>
    );
}
