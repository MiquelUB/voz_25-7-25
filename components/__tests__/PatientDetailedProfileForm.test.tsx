import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PatientDetailedProfileForm from '../PatientDetailedProfileForm';
import { Patient } from '@/types/patient';

describe('PatientDetailedProfileForm', () => {
    const mockPatient: Patient = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123456789',
        generalNotes: 'Initial notes.',
    };

    it('renders the form with initial values', () => {
        render(<PatientDetailedProfileForm patient={mockPatient} onSubmit={jest.fn()} isSubmitting={false} />);
        expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
        expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
        expect(screen.getByDisplayValue('123456789')).toBeInTheDocument();
    });

    it('calls onSubmit with the updated data', async () => {
        const onSubmit = jest.fn();
        const user = userEvent.setup();
        render(<PatientDetailedProfileForm patient={mockPatient} onSubmit={onSubmit} isSubmitting={false} />);

        const nameInput = screen.getByLabelText(/Nombre Completo/i);
        const updatedValue = 'John Doe Updated';

        await user.clear(nameInput);
        await user.type(nameInput, updatedValue);

        const saveButton = screen.getByRole('button', { name: /Guardar Cambios/i });
        await user.click(saveButton);

        expect(onSubmit).toHaveBeenCalledWith(
            expect.objectContaining({
                name: updatedValue,
            }),
            expect.anything() // Ignore the event object
        );
    });
});
