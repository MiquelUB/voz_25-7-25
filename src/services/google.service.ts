import { google, drive_v3 } from 'googleapis';
import { GaxiosError } from 'gaxios';

const FOLDER_NAME = 'iNFORiA_Reports';
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

export class GoogleDriveService {
  private drive: drive_v3.Drive;

  constructor(accessToken: string) {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    this.drive = google.drive({ version: 'v3', auth: oauth2Client });
  }

  private async executeWithRetry<T>(
    apiCall: () => Promise<T>,
    retryCount = 0
  ): Promise<T> {
    try {
      return await apiCall();
    } catch (error) {
      if (
        error instanceof GaxiosError &&
        error.response &&
        (error.response.status === 429 || error.response.status >= 500) &&
        retryCount < MAX_RETRIES
      ) {
        const backoff = INITIAL_BACKOFF_MS * Math.pow(2, retryCount);
        console.log(`Retrying API call after ${backoff}ms...`);
        await new Promise((resolve) => setTimeout(resolve, backoff));
        return this.executeWithRetry(apiCall, retryCount + 1);
      }
      throw error;
    }
  }

  private async getOrCreateAppFolder(): Promise<string | null> {
    const apiCall = () =>
      this.drive.files.list({
        q: `mimeType='application/vnd.google-apps.folder' and name='${FOLDER_NAME}' and trashed=false`,
        fields: 'files(id)',
        spaces: 'drive',
      });

    const res = await this.executeWithRetry(apiCall);

    if (res.data.files && res.data.files.length > 0 && res.data.files[0].id) {
      return res.data.files[0].id;
    }

    const createCall = () =>
      this.drive.files.create({
        requestBody: {
          name: FOLDER_NAME,
          mimeType: 'application/vnd.google-apps.folder',
        },
        fields: 'id',
      });

    const folder = await this.executeWithRetry(createCall);
    return folder.data.id ?? null;
  }

  async listReportsFromDrive(): Promise<{ id: string; name: string }[]> {
    const folderId = await this.getOrCreateAppFolder();
    if (!folderId) {
      console.error('Could not find or create the app folder.');
      return [];
    }

    const apiCall = () =>
      this.drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        fields: 'files(id, name)',
        orderBy: 'createdTime desc',
        spaces: 'drive',
      });

    const res = await this.executeWithRetry(apiCall);

    if (!res.data.files) {
      return [];
    }

    return res.data.files.map((file) => ({
      id: file.id!,
      name: file.name!,
    }));
  }

  async saveReportToDrive(
    fileName: string,
    content: string
  ): Promise<string> {
    const folderId = await this.getOrCreateAppFolder();
    if (!folderId) {
      throw new Error('Could not find or create the app folder.');
    }

    const apiCall = () =>
      this.drive.files.create({
        requestBody: {
          name: fileName,
          parents: [folderId],
          mimeType: 'text/plain',
        },
        media: {
          mimeType: 'text/plain',
          body: content,
        },
        fields: 'id',
      });

    const res = await this.executeWithRetry(apiCall);

    if (!res.data.id) {
      throw new Error('Failed to create file in Google Drive.');
    }

    return res.data.id;
  }

  async readReportFromDrive(fileId: string): Promise<string> {
    const apiCall = () => this.drive.files.get({ fileId, alt: 'media' });
    const res = await this.executeWithRetry(apiCall);

    // The response for media is a string in gaxios now
    if (typeof res.data === 'string') {
        return res.data;
    }

    // Fallback for stream
    return new Promise((resolve, reject) => {
        const chunks: any[] = [];
        // @ts-ignore
        res.data.on('data', (chunk) => chunks.push(chunk));
        // @ts-ignore
        res.data.on('end', () => resolve(Buffer.concat(chunks).toString()));
        // @ts-ignore
        res.data.on('error', (err) => reject(err));
    });
  }

  async deleteFile(fileId: string): Promise<void> {
    const apiCall = () => this.drive.files.delete({ fileId });
    await this.executeWithRetry(apiCall);
  }

  private async findFileIdByName(
    fileName: string,
    parentId?: string
  ): Promise<string | null> {
    let query = `name='${fileName}' and trashed=false`;
    if (parentId) {
      query += ` and '${parentId}' in parents`;
    } else {
      query += ` and 'root' in parents`;
    }

    const apiCall = () =>
      this.drive.files.list({
        q: query,
        fields: 'files(id)',
        spaces: 'drive',
      });

    const res = await this.executeWithRetry(apiCall);
    if (res.data.files && res.data.files.length > 0 && res.data.files[0].id) {
      return res.data.files[0].id;
    }
    return null;
  }

  async saveFile(
    fileName: string,
    content: string,
    parentId?: string
  ): Promise<string> {
    const fileId = await this.findFileIdByName(fileName, parentId);

    if (fileId) {
      // File exists, update it
      const apiCall = () =>
        this.drive.files.update({
          fileId: fileId,
          media: {
            mimeType: 'application/json',
            body: content,
          },
        });
      const res = await this.executeWithRetry(apiCall);
      if (!res.data.id) {
        throw new Error('Failed to update file in Google Drive.');
      }
      return res.data.id;
    } else {
      // File does not exist, create it
      const requestBody = {
        name: fileName,
        mimeType: 'application/json',
        ...(parentId && { parents: [parentId] }),
      };
      const apiCall = () =>
        this.drive.files.create({
          requestBody,
          media: {
            mimeType: 'application/json',
            body: content,
          },
          fields: 'id',
        });
      const res = await this.executeWithRetry(apiCall);
      if (!res.data.id) {
        throw new Error('Failed to create file in Google Drive.');
      }
      return res.data.id;
    }
  }

  async readFile(
    fileName: string,
    parentId?: string
  ): Promise<string | null> {
    const fileId = await this.findFileIdByName(fileName, parentId);
    if (!fileId) {
      return null;
    }
    return this.readReportFromDrive(fileId);
  }
}
