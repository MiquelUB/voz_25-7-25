import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SessionWorkspace from '../SessionWorkspace';

// Mock dependencies
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: { access_token: 'mock-token' } },
      }),
    },
    functions: {
      invoke: jest.fn().mockResolvedValue({ data: { report: 'Mock AI report' } }),
    },
  },
}));

jest.mock('../../../lib/gdrive', () => ({
  saveReportToDrive: jest.fn().mockResolvedValue('mock-file-id'),
  listReportsFromDrive: jest.fn().mockResolvedValue([]),
  readReportFromDrive: jest.fn().mockResolvedValue('Mock report content'),
}));

const mockToast = jest.fn();
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock child components to simplify testing
jest.mock('@/components/DashboardHeader', () => {
  return function DummyDashboardHeader() {
    return <div data-testid="dashboard-header"></div>;
  };
});
jest.mock('@/components/ui/toaster', () => ({
  Toaster: function DummyToaster() {
    return <div data-testid="toaster"></div>;
  },
}));


describe('SessionWorkspace', () => {
  let localStorageMock: { [key: string]: string };
  let mediaDevicesMock: { getUserMedia: jest.Mock };

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    mockToast.mockClear();

    // Mock localStorage
    localStorageMock = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key) => localStorageMock[key] || null),
        setItem: jest.fn((key, value) => {
          localStorageMock[key] = value.toString();
        }),
        removeItem: jest.fn((key) => {
          delete localStorageMock[key];
        }),
        clear: jest.fn(() => {
          localStorageMock = {};
        }),
      },
      writable: true,
    });

    // Mock MediaDevices
    mediaDevicesMock = {
      getUserMedia: jest.fn().mockResolvedValue({
        getTracks: () => [{ stop: jest.fn() }],
      }),
    };
    Object.defineProperty(navigator, 'mediaDevices', {
      value: mediaDevicesMock,
      writable: true,
    });

    // Mock URL.createObjectURL
    Object.defineProperty(window.URL, 'createObjectURL', {
      value: jest.fn(() => 'mock-object-url'),
      writable: true,
    });

    // Mock Audio
    Object.defineProperty(window, 'Audio', {
        value: jest.fn().mockImplementation(() => ({
          play: jest.fn(),
          // Mock onloadedmetadata to fire immediately for duration calculation
          // This is a simplified mock. A real scenario might need more detail.
          set onloadedmetadata(callback: () => void) {
            callback();
          },
          duration: 123, // mock duration in seconds
        })),
        writable: true,
    });

    // Mock Fetch
    global.fetch = jest.fn((url: RequestInfo | URL) =>
      Promise.resolve({
        blob: () => Promise.resolve(new Blob(['mock-blob-from-fetch'], { type: 'audio/mp3' })),
      } as Response)
    );

    // Mock FileReader
    Object.defineProperty(window, 'FileReader', {
      value: jest.fn().mockImplementation(() => {
        const reader = {
          result: '',
          onloadend: null as (() => void) | null,
          onerror: null as (() => void) | null,
          onload: null as ((e: any) => void) | null,
          readAsDataURL: jest.fn(function(this: any, blob: Blob) {
            this.result = `data:${blob.type};base64,mock-base64-data`;
            // Use setTimeout to simulate the async nature and ensure onloadend is set before being called.
            setTimeout(() => {
              if (this.onloadend) {
                this.onloadend();
              }
            }, 0);
          }),
          readAsText: jest.fn(function(this: any, blob: Blob) {
            this.result = 'mock file content';
            setTimeout(() => {
                if (this.onload) {
                    this.onload({ target: { result: this.result } });
                }
            }, 0)
          }),
        };
        return reader;
      }),
      writable: true,
    });
  });

  test('renders the component in its initial state', async () => {
    render(<SessionWorkspace />);

    // Check for main title
    expect(screen.getByText('Registro de Sesión')).toBeInTheDocument();

    // Check for initial buttons
    expect(screen.getByText('Empezar Grabación')).toBeInTheDocument();
    expect(screen.getByText('Adjuntar Audio')).toBeInTheDocument();
    expect(screen.getByText('Adjuntar Notas')).toBeInTheDocument();
    expect(screen.getByText('Guardar Borrador')).toBeInTheDocument();
    expect(screen.getByText('Generar Informe con IA')).toBeInTheDocument();

    // Check that the timer starts at 00:00
    expect(screen.getByText('00:00')).toBeInTheDocument();
  });

  test('allows attaching an audio file and updates UI', async () => {
    render(<SessionWorkspace />);

    const audioInput = screen.getByTestId('audio-input');
    const mockAudioFile = new File(['mock-audio-content'], 'session.mp3', { type: 'audio/mp3' });

    fireEvent.change(audioInput, { target: { files: [mockAudioFile] } });

    await waitFor(() => {
      // The "finished recording" card should appear
      expect(screen.getByText('Grabación finalizada')).toBeInTheDocument();
    });

    // Check if the duration is displayed (based on the mock Audio object)
    expect(screen.getByText('Duración: 02:03')).toBeInTheDocument();
  });

  test('allows attaching a notes file and updates textarea', async () => {
    render(<SessionWorkspace />);

    const notesInput = screen.getByTestId('notes-input');
    const mockNotesFile = new File(['mock file content'], 'notes.txt', { type: 'text/plain' });

    // The placeholder is visible initially
    const textarea = screen.getByPlaceholderText(/Tus notas se guardan automáticamente/);
    expect(textarea).toHaveValue('');

    fireEvent.change(notesInput, { target: { files: [mockNotesFile] } });

    await waitFor(() => {
      // The textarea should be populated with the file content from our mock FileReader
      expect(textarea).toHaveValue('mock file content');
    });
  });

  test('saves notes and audio to localStorage when "Guardar Borrador" is clicked', async () => {
    render(<SessionWorkspace />);

    // 1. Set up the state by typing notes and attaching a file
    const textarea = screen.getByPlaceholderText(/Tus notas se guardan automáticamente/);
    fireEvent.change(textarea, { target: { value: 'These are my draft notes.' } });

    const audioInput = screen.getByTestId('audio-input');
    const mockAudioFile = new File(['mock-audio'], 'draft.wav', { type: 'audio/wav' });
    fireEvent.change(audioInput, { target: { files: [mockAudioFile] } });

    // Ensure the file is processed and state is updated before saving
    await screen.findByRole('button', { name: /delete audio/i });

    // 2. Click the save draft button
    const saveDraftButton = screen.getByRole('button', { name: /Guardar Borrador/i });
    fireEvent.click(saveDraftButton);

    // 3. Assert that localStorage.setItem was called
    await waitFor(() => {
      // Wait for the async save to complete
      expect(window.localStorage.setItem).toHaveBeenCalledTimes(2);
    });

    // Check the calls individually
    expect(window.localStorage.setItem).toHaveBeenCalledWith('draftNotes', 'These are my draft notes.');
    expect(window.localStorage.setItem).toHaveBeenCalledWith('draftAudio', 'data:audio/wav;base64,mock-base64-data');

    // 4. Assert that a success toast is shown
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Borrador Guardado',
        })
      );
    });
  });

  test('loads draft from localStorage on initial render', async () => {
    // 1. Set up localStorage before rendering
    window.localStorage.setItem('draftNotes', 'Loaded from draft.');
    window.localStorage.setItem('draftAudio', 'data:audio/mp3;base64,mock-base64-data-for-load-test');

    // 2. Render the component
    render(<SessionWorkspace />);

    // 3. Assert that the state is updated from localStorage
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Tus notas se guardan automáticamente/)).toHaveValue('Loaded from draft.');
    });

    await waitFor(() => {
      expect(screen.getByText('Grabación finalizada')).toBeInTheDocument();
    });

    // 4. Assert that a success toast is shown
    await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Borrador Cargado',
          })
        );
      });
  });

  describe('Generate AI Report flow', () => {
    test('button is disabled initially and when only one condition is met', async () => {
      render(<SessionWorkspace />);
      const generateButton = screen.getByRole('button', { name: /Generar Informe con IA/i });

      // 1. Initially disabled
      expect(generateButton).toBeDisabled();

      // 2. Disabled with only notes
      const textarea = screen.getByPlaceholderText(/Tus notas se guardan automáticamente/);
      fireEvent.change(textarea, { target: { value: 'Some notes' } });
      expect(generateButton).toBeDisabled();

      // 3. Disabled with only audio
      fireEvent.change(textarea, { target: { value: '' } }); // Clear notes
      const audioInput = screen.getByTestId('audio-input');
      const mockAudioFile = new File(['audio'], 'session.mp3', { type: 'audio/mp3' });
      fireEvent.change(audioInput, { target: { files: [mockAudioFile] } });
      await screen.findByRole('button', { name: /delete audio/i }); // Wait for audio to be processed
      expect(generateButton).toBeDisabled();
    });

    test('button is enabled when both notes and audio are present', async () => {
      render(<SessionWorkspace />);
      const generateButton = screen.getByRole('button', { name: /Generar Informe con IA/i });
      const textarea = screen.getByPlaceholderText(/Tus notas se guardan automáticamente/);
      const audioInput = screen.getByTestId('audio-input');
      const mockAudioFile = new File(['audio'], 'session.mp3', { type: 'audio/mp3' });

      // Add notes and audio
      fireEvent.change(textarea, { target: { value: 'Final notes for report.' } });
      fireEvent.change(audioInput, { target: { files: [mockAudioFile] } });
      await screen.findByRole('button', { name: /delete audio/i });

      // Now the button should be enabled
      expect(generateButton).toBeEnabled();
    });

    test('calls Supabase function on click and displays report on success', async () => {
      const { supabase } = jest.requireMock('@/integrations/supabase/client');
      render(<SessionWorkspace />);

      // 1. Enable the button
      const generateButton = screen.getByRole('button', { name: /Generar Informe con IA/i });
      const textarea = screen.getByPlaceholderText(/Tus notas se guardan automáticamente/);
      const audioInput = screen.getByTestId('audio-input');
      const mockAudioFile = new File(['audio'], 'session.mp3', { type: 'audio/mp3' });
      fireEvent.change(textarea, { target: { value: 'Final notes for report.' } });
      fireEvent.change(audioInput, { target: { files: [mockAudioFile] } });
      await screen.findByRole('button', { name: /delete audio/i });

      // 2. Click the button
      fireEvent.click(generateButton);

      // 3. Check loading state
      await waitFor(() => {
          expect(screen.getByText('Generando...')).toBeInTheDocument();
          expect(generateButton).toBeDisabled();
      });

      // 4. Check for supabase call
      await waitFor(() => {
          expect(supabase.functions.invoke).toHaveBeenCalledWith(
              'informe-inteligente',
              expect.objectContaining({
                  body: expect.any(FormData)
              })
          );
      });

      // 5. Check for success UI
      await waitFor(() => {
          expect(screen.getByText('Informe Generado por IA')).toBeInTheDocument();
          expect(screen.getByText('Mock AI report')).toBeInTheDocument();
          expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
              title: 'Informe Generado'
          }));
      });
    });
  });
});
