const multer = require("multer");

/**
 * Multer Upload Middleware
 *
 * Multer handles the encoding used for file uploads
 *
 * Restrictions:
 * - Accepted MIME types : PDF and Word documents only (for CV / cover letter).
 * - Max file size        : 3 MB
 */
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error("Only PDF and Word documents are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3 MB in bytes
  },
});

module.exports = upload;
