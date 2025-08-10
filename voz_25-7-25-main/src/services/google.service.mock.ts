import { GoogleDriveService, InvalidTokenError } from './google.service';

export class MockGoogleDriveService extends GoogleDriveService {
  private shouldThrowError = false;

  constructor(accessToken: string, shouldThrowError = false) {
    super(accessToken);
    this.shouldThrowError = shouldThrowError;
  }

  private checkForError() {
    if (this.shouldThrowError) {
      throw new InvalidTokenError('The access token is invalid or expired.');
    }
  }

  async listReportsFromDrive(): Promise<{ id: string; name: string }[]> {
    this.checkForError();
    console.log('Using mock listReportsFromDrive');
    return Promise.resolve([
      { id: '1', name: 'mock-report-1.txt' },
      { id: '2', name: 'mock-report-2.txt' },
    ]);
  }

  async saveReportToDrive(
    fileName: string,
    content: string
  ): Promise<string> {
    this.checkForError();
    console.log('Using mock saveReportToDrive');
    return Promise.resolve(`mock-file-id-${Date.now()}`);
  }

  async readReportFromDrive(fileId: string): Promise<string> {
    this.checkForError();
    console.log(`Using mock readReportFromDrive for fileId: ${fileId}`);
    return Promise.resolve(`This is the mock content for file ${fileId}`);
  }

  async deleteFile(fileId: string): Promise<void> {
    this.checkForError();
    console.log(`Using mock deleteFile for fileId: ${fileId}`);
    return Promise.resolve();
  }
}
