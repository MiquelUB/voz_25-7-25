import { render, screen, waitFor } from '@testing-library/react';
import PatientListPage from '../page';
import { useSession } from 'next-auth/react';
import { GoogleDriveService } from '@/src/services/google.service';
import { Patient } from '@/types/patient';

jest.mock('next-auth/react');
jest.mock('@/src/services/google.service');
jest.mock('next/navigation', () => ({
    useRouter: () => ({
      push: jest.fn(),
    }),
}));
jest.mock('@/components/ui/use-toast', () => ({
    useToast: () => ({
      toast: jest.fn(),
    }),
}));


describe('PatientListPage', () => {
    const mockSession = {
        accessToken: 'test-token',
        user: { id: '1', name: 'Test User', email: 'test@example.com' },
        expires: '1',
    };

    beforeEach(() => {
        (useSession as jest.Mock).mockReturnValue({ data: mockSession, status: 'authenticated' });
    });

    it('renders a loading state initially', () => {
        render(<PatientListPage />);
        expect(screen.getByText(/Cargando pacientes.../i)).toBeInTheDocument();
    });

    it('fetches and displays a list of patients', async () => {
        const mockPatients: Patient[] = [
            { id: '1', name: 'John Doe', email: 'john@example.com', phone: '123456789', generalNotes: '' },
            { id: '2', name: 'Jane Doe', email: 'jane@example.com', phone: '987654321', generalNotes: '' },
        ];
        (GoogleDriveService.prototype.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockPatients));

        render(<PatientListPage />);

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Jane Doe')).toBeInTheDocument();
        });
    });

    it('shows a message when no patients are found', async () => {
        (GoogleDriveService.prototype.readFile as jest.Mock).mockResolvedValue(null);
        render(<PatientListPage />);

        await waitFor(() => {
            expect(screen.getByText(/No tienes pacientes registrados todavía/i)).toBeInTheDocument();
        });
    });
});
