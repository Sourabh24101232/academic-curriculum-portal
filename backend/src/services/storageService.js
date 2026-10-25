import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { UPLOAD_DIR } from '../config/env.js';
import AppError from '../utils/AppError.js';

// Resolve and normalize absolute storage root directory
const storageRoot = path.resolve(UPLOAD_DIR);

// Ensure storage root directory exists
if (!fs.existsSync(storageRoot)) {
  fs.mkdirSync(storageRoot, { recursive: true });
}

/**
 * Validates that a file path resides strictly inside the authorized storage directory.
 * Defends against directory traversal attacks (e.g. ../../)
 * @param {string} targetPath - File path to inspect
 * @returns {string} Fully resolved safe path
 */
const assertInsideStorageRoot = (targetPath) => {
  const resolved = path.resolve(targetPath);
  if (!resolved.startsWith(storageRoot)) {
    throw new AppError('Access denied: Invalid file path or path traversal detected.', 403);
  }
  return resolved;
};

/**
 * Saves a binary file buffer to disk with an unguessable UUID filename and SHA-256 hash.
 * @param {Buffer} buffer - File buffer
 * @param {string} originalFilename - Original client filename
 * @returns {Object} Stored file details including storagePath, filename, size, and checksum
 */
export const saveFile = (buffer, originalFilename = 'document.pdf') => {
  if (!Buffer.isBuffer(buffer)) {
    throw new AppError('Invalid file payload: Buffer is required.', 400);
  }

  const sanitizedOriginal = path.basename(originalFilename).replace(/[^a-zA-Z0-9._-]/g, '_');
  const uniqueFilename = `offering-${crypto.randomUUID()}-${Date.now()}.pdf`;
  const targetPath = path.join(storageRoot, uniqueFilename);

  // Write file to disk
  fs.writeFileSync(targetPath, buffer);

  // Calculate SHA-256 checksum for bit-level integrity verification
  const checksum = crypto.createHash('sha256').update(buffer).digest('hex');

  return {
    storagePath: targetPath,
    filename: uniqueFilename,
    originalFilename: sanitizedOriginal,
    size: buffer.length,
    checksum
  };
};

/**
 * Safely removes a file from disk if it exists within the storage root.
 * @param {string} storagePath - Stored file path
 * @returns {boolean} True if deleted, false if file did not exist
 */
export const deleteFile = (storagePath) => {
  if (!storagePath) return false;

  const safePath = assertInsideStorageRoot(storagePath);

  if (fs.existsSync(safePath)) {
    fs.unlinkSync(safePath);
    return true;
  }

  return false;
};

/**
 * Validates path traversal defenses and confirms physical file presence on disk.
 * @param {string} storagePath - Stored file path
 * @returns {string} Fully resolved safe path for streaming
 */
export const getFilePath = (storagePath) => {
  if (!storagePath) {
    throw new AppError('Storage path is required.', 400);
  }

  const safePath = assertInsideStorageRoot(storagePath);

  if (!fs.existsSync(safePath)) {
    throw new AppError('Physical document file not found on server.', 404);
  }

  return safePath;
};

export default {
  saveFile,
  deleteFile,
  getFilePath,
  storageRoot
};
