// lib/gdrive.ts

import { getSession } from 'next-auth/react';
import { google } from 'googleapis';
import { Session } from 'next-auth';

const FOLDER_NAME = 'iNFORiA_Reports';

/**
 * Gets an authenticated Google Drive API client.
 * It uses the access token from the user's session.
 */
async function getDriveClient() {
  const session = await getSession();
  if (!session || !session.accessToken) {
    throw new Error('Not authenticated or no access token found');
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: session.accessToken });

  return google.drive({ version: 'v3', auth: oauth2Client });
}

/**
 * Finds or creates a dedicated folder for the application in Google Drive.
 * @param drive - Authenticated Google Drive API client.
 * @returns The ID of the application folder.
 */
async function getOrCreateAppFolder(drive: ReturnType<typeof getDriveClient>) {
  // Search for the folder first
  const res = await drive.files.list({
    q: `mimeType='application/vnd.google-apps.folder' and name='${FOLDER_NAME}' and trashed=false`,
    fields: 'files(id)',
  });

  if (res.data.files && res.data.files.length > 0) {
    return res.data.files[0].id;
  }

  // If not found, create it
  const folderMetadata = {
    name: FOLDER_NAME,
    mimeType: 'application/vnd.google-apps.folder',
  };
  const folder = await drive.files.create({
    resource: folderMetadata,
    fields: 'id',
  });

  return folder.data.id;
}

/**
 * Saves a text file to the user's Google Drive in the app folder.
 * @param fileName - The name of the file to save.
 * @param content - The text content of the file.
 * @returns The ID of the created file.
 */
export async function saveReportToDrive(fileName: string, content: string): Promise<string | undefined> {
  const drive = await getDriveClient();
  const folderId = await getOrCreateAppFolder(drive);

  const fileMetadata = {
    name: fileName,
    parents: folderId ? [folderId] : [],
  };

  const media = {
    mimeType: 'text/plain',
    body: content,
  };

  const res = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id',
  });

  return res.data.id;
}

/**
 * Lists all report files from the application's folder in Google Drive.
 * @returns An array of files with their IDs and names.
 */
export async function listReportsFromDrive(): Promise<{ id: string; name: string }[]> {
  const drive = await getDriveClient();
  const folderId = await getOrCreateAppFolder(drive);

  if (!folderId) {
    return [];
  }

  const res = await drive.files.list({
    q: `'${folderId}' in parents and mimeType='text/plain' and trashed=false`,
    fields: 'files(id, name)',
    orderBy: 'createdTime desc',
  });

  if (!res.data.files) {
    return [];
  }

  return res.data.files.map(file => ({
    id: file.id!,
    name: file.name!,
  }));
}

/**
 * Reads the content of a specific file from Google Drive.
 * @param fileId - The ID of the file to read.
 * @returns The content of the file as a string.
 */
export async function readReportFromDrive(fileId: string): Promise<string> {
  const drive = await getDriveClient();

  const res = await drive.files.get(
    { fileId: fileId, alt: 'media' },
    { responseType: 'stream' }
  );

  // The response is a stream. We need to read it to get the content.
  return new Promise((resolve, reject) => {
    let buf: any[] = [];
    res.data
      .on('data', (chunk) => buf.push(chunk))
      .on('end', () => {
        const content = Buffer.concat(buf).toString();
        resolve(content);
      })
      .on('error', (err) => {
        reject(new Error(`Error reading file content: ${err.message}`));
      });
  });
}
