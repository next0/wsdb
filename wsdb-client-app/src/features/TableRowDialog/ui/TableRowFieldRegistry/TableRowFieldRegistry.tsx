import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import * as React from 'react';
import { UseFormReturn } from 'react-hook-form';

import { TableColumnMetadataSchema } from 'entities/table/types/TableColumnMetadataSchema';

import { cn } from 'shared/helpers/cn/cn';
import { Button } from 'shared/libs/ui/button';
import { Calendar } from 'shared/libs/ui/calendar';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from 'shared/libs/ui/form';
import { Input } from 'shared/libs/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from 'shared/libs/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'shared/libs/ui/select';

export const TableRowFieldRegistry: Record<
    TableColumnMetadataSchema['type'],
    (form: UseFormReturn, colName: string, column: TableColumnMetadataSchema) => React.ReactNode
> = {
    string: (form, colName) => {
        return (
            <FormField
                control={form.control}
                name={colName}
                render={({ field }) => (
                    <FormItem className='flex flex-col'>
                        <FormLabel>{colName}</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormDescription>Column type: string</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        );
    },

    number: (form, colName) => {
        return (
            <FormField
                control={form.control}
                name={colName}
                render={({ field }) => (
                    <FormItem className='flex flex-col'>
                        <FormLabel>{colName}</FormLabel>
                        <FormControl>
                            <Input
                                {...field}
                                type='number'
                                onChange={(event) => {
                                    const text = event.target.value;

                                    if (text) {
                                        const parsedValue = parseFloat(text);
                                        const value = isNaN(parsedValue) ? field.value : parsedValue;

                                        field.onChange(value);
                                    } else {
                                        field.onChange(null);
                                    }
                                }}
                            />
                        </FormControl>
                        <FormDescription>Column type: number</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        );
    },

    date: (form, colName) => {
        return (
            <FormField
                control={form.control}
                name={colName}
                render={({ field }) => (
                    <FormItem className='flex flex-col'>
                        <FormLabel>{colName}</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                        variant={'outline'}
                                        className={cn(
                                            'w-[240px] pl-3 text-left font-normal',
                                            !field.value && 'text-muted-foreground',
                                        )}
                                    >
                                        {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                        <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                    </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                                className='w-auto p-0'
                                align='start'
                            >
                                <Calendar
                                    mode='single'
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) => date < new Date('1900-01-01')}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <FormDescription>Column type: date</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        );
    },

    enum: (form, colName, column) => {
        return (
            <FormField
                control={form.control}
                name={colName}
                render={({ field }) => (
                    <FormItem className='flex flex-col'>
                        <FormLabel>{colName}</FormLabel>
                        <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {column.type === 'enum' &&
                                    column.values.map((value) => {
                                        return (
                                            <SelectItem
                                                key={value}
                                                value={value}
                                            >
                                                {value}
                                            </SelectItem>
                                        );
                                    })}
                            </SelectContent>
                        </Select>
                        <FormDescription>Column type: enum</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        );
    },
};
