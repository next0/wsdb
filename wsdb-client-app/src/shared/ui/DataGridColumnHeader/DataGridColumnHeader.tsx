import { ArrowDownIcon, ArrowUpIcon, CaretSortIcon, EyeNoneIcon } from '@radix-ui/react-icons';
import { Column } from '@tanstack/react-table';

import { cn } from 'shared/helpers/cn/cn';
import { Button } from 'shared/libs/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from 'shared/libs/ui/dropdown-menu';

interface DataGridColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
    column: Column<TData, TValue>;
    title: string;
    enableHiding?: boolean;
}

export function DataGridColumnHeader<TData, TValue>({
    className,
    column,
    title,
    enableHiding,
}: DataGridColumnHeaderProps<TData, TValue>) {
    if (!column.getCanSort()) {
        return <div className={cn(className)}>{title}</div>;
    }

    return (
        <div className={cn('flex items-center space-x-2', className)}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant='ghost'
                        size='sm'
                        className='-ml-3 h-8 data-[state=open]:bg-accent'
                    >
                        <span>{title}</span>

                        {column.getIsSorted() === 'desc' ? (
                            <ArrowDownIcon className='ml-2 h-4 w-4' />
                        ) : column.getIsSorted() === 'asc' ? (
                            <ArrowUpIcon className='ml-2 h-4 w-4' />
                        ) : (
                            <CaretSortIcon className='ml-2 h-4 w-4' />
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='start'>
                    <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
                        <ArrowUpIcon className='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
                        Asc
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
                        <ArrowDownIcon className='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
                        Desc
                    </DropdownMenuItem>

                    {enableHiding && (
                        <>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
                                <EyeNoneIcon className='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
                                Hide
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
