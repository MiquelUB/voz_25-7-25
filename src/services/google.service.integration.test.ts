import { GoogleDriveService } from './google.service';

// To run these integration tests, you need a valid Google OAuth2 access token
// with the 'https://www.googleapis.com/auth/drive.file' scope.
// You can obtain one by signing in to the application and extracting it from the session.
// Set it as an environment variable named GOOGLE_ACCESS_TOKEN.
const accessToken = process.env.GOOGLE_ACCESS_TOKEN;

const isConfigured = accessToken;

describe('GoogleDriveService Integration Tests', () => {
  let service: GoogleDriveService;
  const testFileName = `test-report-${Date.now()}.txt`;
  const testFileContent = 'This is a test report.';
  let createdFileId: string | null = null;

  beforeAll(() => {
    if (!isConfigured) {
      console.warn(
        'Skipping Google Drive integration tests. GOOGLE_ACCESS_TOKEN not set.'
      );
      return;
    }
    service = new GoogleDriveService(accessToken!);
  });

  // Cleanup any created file
  afterAll(async () => {
    if (createdFileId && service) {
      try {
        await service.deleteFile(createdFileId);
        console.log(`Cleaned up test file: ${createdFileId}`);
      } catch (error) {
        console.error(`Failed to clean up test file ${createdFileId}:`, error);
      }
    }
  });

  (isConfigured ? test : test.skip)('should list reports without errors', async () => {
    await expect(service.listReportsFromDrive()).resolves.toBeInstanceOf(Array);
  });

  (isConfigured ? test : test.skip)('should perform full lifecycle of a report', async () => {
    // 1. Save the report
    const fileId = await service.saveReportToDrive(
      testFileName,
      testFileContent
    );
    expect(fileId).toBeDefined();
    expect(typeof fileId).toBe('string');
    createdFileId = fileId; // Store for cleanup

    // 2. Read the report
    const content = await service.readReportFromDrive(fileId);
    expect(content).toBe(testFileContent);

    // 3. (Implicit) Verify it appears in the list
    const reports = await service.listReportsFromDrive();
    const found = reports.find((report) => report.id === fileId);
    expect(found).toBeDefined();
    expect(found?.name).toBe(testFileName);
  });
});
