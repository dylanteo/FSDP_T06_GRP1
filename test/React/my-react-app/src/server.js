const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['POST', 'GET'],
  allowedHeaders: ['Content-Type']
}));

// Define the exact target directory using absolute path
const uploadDir = path.join(__dirname, '..','..','..', 'test', 'src', 'main', 'java', 'com', 'test', 'test');

console.log('Upload directory set to:', uploadDir);

const fileFilter = (req, file, cb) => {
  if (file.originalname.endsWith('.java')) {
    cb(null, true);
  } else {
    cb(new Error('Only .java files are allowed!'), false);
  }
};

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      try {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log('Created upload directory successfully');
      } catch (error) {
        console.error('Error creating directory:', error);
        return cb(new Error('Failed to create upload directory'));
      }
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const filePath = path.join(uploadDir, file.originalname);
    // If file exists, delete it before saving the new one
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`Existing file ${file.originalname} deleted successfully`);
      } catch (error) {
        console.error('Error deleting existing file:', error);
        return cb(new Error('Failed to overwrite existing file'));
      }
    }
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size is too large. Max size is 5MB.' });
    }
    return res.status(400).json({ error: err.message });
  }
  return res.status(400).json({ error: err.message });
});

// Handle file upload
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const uploadedFilePath = path.join(uploadDir, req.file.filename);

  console.log('File uploaded successfully:', {
    filename: req.file.filename,
    path: uploadedFilePath,
    size: req.file.size
  });

  // Verify file exists in correct location
  if (fs.existsSync(uploadedFilePath)) {
    console.log('File verified at:', uploadedFilePath);
  } else {
    console.error('File not found at expected location:', uploadedFilePath);
  }

  // List all files in directory
  const files = fs.readdirSync(uploadDir);
  console.log('Files in directory:', files);

  res.json({
    success: true,
    file: {
      filename: req.file.filename,
      path: uploadedFilePath,
      originalName: req.file.originalname,
      size: req.file.size
    },
    directoryContents: files
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  try {
    fs.accessSync(uploadDir, fs.constants.W_OK);
    const files = fs.readdirSync(uploadDir);
    res.json({
      status: 'ok',
      uploadPath: uploadDir,
      writable: true,
      currentFiles: files
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      uploadPath: uploadDir,
      writable: false,
      error: err.message
    });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  // Verify directory on startup
  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    fs.accessSync(uploadDir, fs.constants.W_OK);
    const files = fs.readdirSync(uploadDir);
    console.log('Current files in directory:', files);
    console.log('Upload directory is accessible and writable');
  } catch (error) {
    console.error('WARNING: Directory issue:', error);
  }

  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Upload directory: ${uploadDir}`);
});