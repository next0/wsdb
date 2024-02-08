import * as React from 'react';
import { Control, FieldPath, FieldValues, useController } from 'react-hook-form';

import { Alert, AlertDescription, AlertTitle } from 'shared/libs/ui/alert';

export interface FormErrorProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
    name: TName;
    control: Control<TFieldValues>;
    title?: React.ReactNode;
}

export function FormError<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ name, control, title }: FormErrorProps<TFieldValues, TName>) {
    const { fieldState } = useController({
        name,
        control,
    });

    const error = fieldState.error;

    if (!error) {
        return;
    }

    return (
        <Alert variant='destructive'>
            {Boolean(title) && <AlertTitle>{title}</AlertTitle>}
            <AlertDescription>{error.message}</AlertDescription>
        </Alert>
    );
}
