import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { AppLayout } from 'app/ui/AppLayout/AppLayout';

test('renders app content', () => {
    render(
        <MemoryRouter>
            <AppLayout sidebar='sidebar' />
        </MemoryRouter>,
    );
    const headElement = screen.getByText(/WSDB Client/i);
    expect(headElement).toBeInTheDocument();
});
