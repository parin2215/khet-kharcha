/**
 * Khet Kharcha — Storage Service
 * Firebase Storage operations for receipt photos
 */

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { getStorageInstance } from './firebaseInit.js';

/**
 * Convert a local file URI to a Blob (needed for React Native)
 * @param {string} uri
 * @returns {Promise<Blob>}
 */
const uriToBlob = (uri) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => resolve(xhr.response);
    xhr.onerror = () => reject(new TypeError('Network request failed'));
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });
};

/**
 * Upload a file with progress tracking
 * @param {string|File|Blob} fileOrUri - File URI (mobile) or File object (web)
 * @param {string} storagePath - e.g. "receipts/uid/farmId/expenseId.jpg"
 * @param {Function} [onProgress] - (percent: number) => void
 * @returns {Promise<string>} download URL
 */
export const uploadFile = async (fileOrUri, storagePath, onProgress) => {
  const storage = getStorageInstance();
  const storageRef = ref(storage, storagePath);

  let fileData;
  if (typeof fileOrUri === 'string') {
    // React Native: convert URI to blob
    fileData = await uriToBlob(fileOrUri);
  } else {
    // Web: already a File or Blob
    fileData = fileOrUri;
  }

  const metadata = {};
  if (fileData.type) {
    metadata.contentType = fileData.type;
  } else if (typeof fileOrUri === 'string') {
    if (storagePath.endsWith('.jpg') || storagePath.endsWith('.jpeg')) {
      metadata.contentType = 'image/jpeg';
    } else if (storagePath.endsWith('.png')) {
      metadata.contentType = 'image/png';
    } else if (storagePath.endsWith('.pdf')) {
      metadata.contentType = 'application/pdf';
    } else {
      metadata.contentType = 'image/jpeg';
    }
  }

  const uploadTask = uploadBytesResumable(storageRef, fileData, metadata);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        if (onProgress) onProgress(progress);
      },
      (error) => {
        // Free blob memory if applicable
        if (fileData.close) fileData.close();
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        // Free blob memory
        if (fileData.close) fileData.close();
        resolve(downloadURL);
      }
    );
  });
};

/**
 * Delete a file from Storage
 * @param {string} storagePath
 */
export const deleteFile = async (storagePath) => {
  const storage = getStorageInstance();
  const storageRef = ref(storage, storagePath);
  await deleteObject(storageRef);
};

/**
 * Get download URL for a file
 * @param {string} storagePath
 * @returns {Promise<string>}
 */
export const getFileURL = async (storagePath) => {
  const storage = getStorageInstance();
  const storageRef = ref(storage, storagePath);
  return getDownloadURL(storageRef);
};
