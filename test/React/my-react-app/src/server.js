const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { exec } = require('child_process');
const { MongoClient } = require('mongodb');

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['POST', 'GET'],
  allowedHeaders: ['Content-Type']
}));

const mongoUri = 'mongodb+srv://yanhui:yanhui@cluster0.sse7e.mongodb.net/TestCaseOutput1?retryWrites=true&w=majority';
const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
const dbName = 'TestCaseOutput1';
const collectionName = 'testCaseOutputs';

let db;
client.connect()
  .then(() => {
    db = client.db(dbName); // Select database
    console.log('Connected to MongoDB');
  })
  .catch((err) => console.error('Error connecting to MongoDB:', err));
app.get('/api/testResults', async (req, res) => {
try {
  const testResultsCollection = db.collection(collectionName);
  const testResults = await testResultsCollection.find().toArray();
  res.json(testResults);
} catch (err) {
  console.error('Error fetching test results:', err);
  res.status(500).json({
    error: 'Error fetching test results.',
    details: err.message
  });
}
});

// Define the exact target directory using absolute path
const uploadDir = path.join(__dirname, '..', '..', '..', 'test', 'src', 'main', 'java', 'com', 'test', 'test');

// Function to compile and run the uploaded Java file using Maven
async function compileAndRunJavaFileWithMaven(testFilePath, testClassName) {
  return new Promise((resolve, reject) => {
    // Use mvnw (Maven Wrapper) to compile and run the test
    const mvnCommand = process.platform === 'win32' ? 'mvnw.cmd' : './mvnw';

    // Compile using Maven Wrapper
    exec(`${mvnCommand} clean compile`, { cwd: path.join(__dirname, '..', '..', '..', 'test') }, (compileError, compileStdout, compileStderr) => {
      if (compileError) {
        reject(`Maven compilation failed: ${compileStderr}`);
        return;
      }

      console.log('Compilation output:', compileStdout);

      // Run the test using the Maven exec plugin and specify the main class
      exec(`${mvnCommand} exec:java -Dexec.mainClass="com.test.test.${testClassName}"`, { cwd: path.join(__dirname, '..', '..', '..', 'test') }, (runError, runStdout, runStderr) => {
        if (runError) {
          reject(`Test execution failed: ${runStderr}`);
          return;
        }

        resolve(runStdout);
      });
    });
  });
}

// File upload middleware setup
const fileFilter = (req, file, cb) => {
  if (file.originalname.endsWith('.java')) {
    cb(null, true);
  } else {
    cb(new Error('Only .java files are allowed!'), false);
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
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
  filename: function (req, file, cb) {
    let fileName = file.originalname;
    if (!fileName.endsWith('.java')) {
      fileName = fileName.replace('.java', '.java');
    }
    cb(null, fileName);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Handle file upload and processing
app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const uploadedFilePath = path.join(uploadDir, req.file.filename);
  console.log('File uploaded successfully:', uploadedFilePath);

  try {
    // Get the class name without .java extension
    const testClassName = req.file.filename.replace('.java', '');

    // Compile and run the uploaded test file using Maven
    console.log('Compiling and running test with Maven...');
    const testOutput = await compileAndRunJavaFileWithMaven(uploadedFilePath, testClassName);

    // Delete the uploaded file after execution
    fs.unlinkSync(uploadedFilePath);
    console.log('File deleted after execution');

    // Return the output from test execution
    res.json({
      success: true,
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      },
      testOutput,
      message: 'Test uploaded, executed, and source file deleted.'
    });

  } catch (err) {
    console.error('Error processing file:', err);
    res.status(500).json({
      error: 'Error processing file.',
      details: err.message
    });

    // Cleanup uploaded file in case of error
    try {
      if (fs.existsSync(uploadedFilePath)) {
        fs.unlinkSync(uploadedFilePath);
        console.log('File deleted after error.');
      }
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError);
    }
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
