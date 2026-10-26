const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ======================================================
// UPLOAD DIRECTORY
// ======================================================

const uploadDir = path.join(
  __dirname,
  '..',
  'uploads',
  'doctors'
);

// Folder automatically create ho jayega
// agar pehle se exist nahi karta.
fs.mkdirSync(uploadDir, {
  recursive: true
});

// ======================================================
// STORAGE
// ======================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${extension}`;

    cb(null, uniqueName);
  }
});

// ======================================================
// FILE FILTER
// ======================================================

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype &&
    file.mimetype.startsWith('image/')
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Only image files are allowed.'
      ),
      false
    );
  }
};

// ======================================================
// MULTER CONFIGURATION
// ======================================================

const upload = multer({
  storage,

  fileFilter,

  limits: {
    // Maximum 5 MB
    fileSize: 5 * 1024 * 1024
  }
});

module.exports = upload;