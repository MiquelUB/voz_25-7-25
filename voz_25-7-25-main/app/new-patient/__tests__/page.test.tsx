import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NewPatientPage from '../page';
import { useSession } from 'next-auth/react';
import { GoogleDriveService } from '@/src/services/google.service';
import { useRouter } from 'next/navigation';

jest.mock('next-auth/react');
jest.mock('@/src/services/google.service');
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));
jest.mock('@/components/ui/use-toast', () => ({
    useToast: () => ({
      toast: jest.fn(),
    }),
}));
jest.mock('uuid', () => ({
    v4: () => 'mock-uuid',
}));

describe('NewPatientPage', () => {
    const mockSession = {
        accessToken: 'test-token',
        user: { id: '1', name: 'Test User', email: 'test@example.com' },
        expires: '1',
    };
    const mockRouter = {
        push: jest.fn(),
    };

    beforeEach(() => {
        (useSession as jest.Mock).mockReturnValue({ data: mockSession, status: 'authenticated' });
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        (GoogleDriveService.prototype.readFile as jest.Mock).mockResolvedValue(JSON.stringify([]));
        (GoogleDriveService.prototype.saveFile as jest.Mock).mockResolvedValue('file-id');
    });

    it('renders the form correctly', () => {
        render(<NewPatientPage />);
        expect(screen.getByLabelText(/Nombre Completo/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Teléfono/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Guardar Paciente/i })).toBeInTheDocument();
    });

    it('submits the form and calls the drive service', async () => {
        render(<NewPatientPage />);

        fireEvent.change(screen.getByLabelText(/Nombre Completo/i), { target: { value: 'Test Patient' } });
        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'patient@test.com' } });
        fireEvent.change(screen.getByLabelText(/Teléfono/i), { target: { value: '11223344' } });

        fireEvent.click(screen.getByRole('button', { name: /Guardar Paciente/i }));

        await waitFor(() => {
            expect(GoogleDriveService.prototype.saveFile).toHaveBeenCalledWith(
                'patients.json',
                JSON.stringify(
                    [{ id: 'mock-uuid', name: 'Test Patient', email: 'patient@test.com', phone: '11223344', generalNotes: "" }],
                    null,
                    2
                )
            );
            expect(mockRouter.push).toHaveBeenCalledWith('/patient-list');
        });
    });
});
