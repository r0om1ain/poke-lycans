import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOADS_ROOT = path.join(__dirname, '..', '..', 'public', 'uploads');

function makeStorage(subdir) {
  const dest = path.join(UPLOADS_ROOT, subdir);
  fs.mkdirSync(dest, { recursive: true });
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dest),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || '.jpg';
      cb(null, `${crypto.randomUUID()}${ext}`);
    },
  });
}

const imageFileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Seuls les fichiers image sont acceptés'));
  }
  cb(null, true);
};

export const uploadAuctionPhotos = multer({
  storage: makeStorage('auctions'),
  fileFilter: imageFileFilter,
  limits: { fileSize: 8 * 1024 * 1024, files: 8 },
});

export const uploadMessageImage = multer({
  storage: makeStorage('messages'),
  fileFilter: imageFileFilter,
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
});

export function publicUploadPath(subdir, filename) {
  return `/uploads/${subdir}/${filename}`;
}
