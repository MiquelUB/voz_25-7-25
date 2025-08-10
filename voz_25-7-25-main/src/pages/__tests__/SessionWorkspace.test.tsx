import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SessionWorkspace from '../SessionWorkspace';
import { useSession } from 'next-auth/react';
import { createClient } from '@/integrations/supabase/client';
import { GoogleDriveService } from '@/src/services/google.service';

jest.mock('next-auth/react');
jest.mock('@/src/services/google.service');
jest.mock('@/integrations/supabase/client', () => ({
    createClient: jest.fn(),
}));
jest.mock('@/components/ui/use-toast', () => ({
    useToast: () => ({
      toast: jest.fn(),
    }),
}));

describe('SessionWorkspace', () => {
    const mockSession = {
        accessToken: 'test-token',
        user: { id: '1', name: 'Test User', email: 'test@example.com' },
        expires: '1',
    };
    const mockSupabase = {
        auth: {
            getSession: jest.fn().mockResolvedValue({ data: { session: mockSession } }),
        },
        functions: {
            invoke: jest.fn(),
        },
    };

    beforeEach(() => {
        (useSession as jest.Mock).mockReturnValue({ data: mockSession, status: 'authenticated' });
        (createClient as jest.Mock).mockReturnValue(mockSupabase);
        (GoogleDriveService.prototype.listReportsFromDrive as jest.Mock).mockResolvedValue([]);
    });

    it('is a placeholder test', () => {
        expect(true).toBe(true);
    });
});
