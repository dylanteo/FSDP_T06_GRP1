//server.js

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { exec } = require('child_process');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['POST', 'GET'],
  allowedHeaders: ['Content-Type']
}));

// MongoDB setup
const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
const dbName = 'TestCaseOutput1';
const collectionName = 'testCaseOutputs';
let db;

// Connect to MongoDB
client.connect()
  .then(() => {
    db = client.db(dbName);
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

// Fetch test results from MongoDB
app.get('/api/testResults', async (req, res) => {
  if (!db) {
    return res.status(500).json({ error: 'Database not connected' });
  }
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

// Serve static files from the test-output directory
app.use('/reports', express.static(path.join(__dirname, '..', '..', '..', 'test', 'test-output')));

// Add endpoint to get the latest report
app.get('/api/latest-report', (req, res) => {
  const reportsDir = path.join(__dirname, '..', '..', '..', 'test', 'test-output');
  try {
    if (!fs.existsSync(reportsDir)) {
      return res.status(404).json({ error: 'No reports directory found' });
    }

    const files = fs.readdirSync(reportsDir)
      .filter(file => file.endsWith('.html'))
      .map(file => ({
        name: file,
        time: fs.statSync(path.join(reportsDir, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);

    if (files.length === 0) {
      return res.status(404).json({ error: 'No reports found' });
    }

    res.json({
      reportUrl: `/reports/${files[0].name}`,
      lastModified: new Date(files[0].time).toISOString()
    });
  } catch (err) {
    console.error('Error reading reports directory:', err);
    res.status(500).json({ error: 'Error reading reports' });
  }
});

// Upload directory setup
const uploadDir = path.join(__dirname, '..', '..', '..', 'test', 'src', 'main', 'java', 'com', 'test', 'test');

// Ensure test-output directory exists
const testOutputDir = path.join(__dirname, '..', '..', '..', 'test', 'test-output');
if (!fs.existsSync(testOutputDir)) {
  fs.mkdirSync(testOutputDir, { recursive: true });
}

// File upload middleware setup
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
      fileName = `${fileName}.java`;
    }
    cb(null, fileName);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.originalname.endsWith('.java')) {
      cb(null, true);
    } else {
      cb(new Error('Only .java files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});
//compile and run java files uploaded
async function compileAndRunJavaFileWithMaven(testFilePath, testClassName) {
  return new Promise((resolve, reject) => {
    const mvnCommand = process.platform === 'win32' ? 'mvnw.cmd' : './mvnw';
    const projectDir = path.join(__dirname, '..', '..', '..', 'test');

    exec(`${mvnCommand} clean compile`, { cwd: projectDir }, (compileError, compileStdout, compileStderr) => {
      if (compileError) {
        return reject(new Error(`Compilation failed: ${compileStderr}`));
      }
      exec(`${mvnCommand} exec:java -Dexec.mainClass="com.test.test.${testClassName}"`, { cwd: projectDir }, (runError, runStdout, runStderr) => {
        if (runError) {
          return reject(new Error(`Execution failed: ${runStderr}`));
        }
        resolve({
          output: runStdout,
          reportPath: path.join(projectDir, 'test-output', 'ExtentReports.html'),
        });
      });
    });
  });
}

//saves the java file uploaded to database
async function saveJavaFileToDB(file, fileContent) {
  const javaFilesCollection = db.collection('javaTestCodes');
  const javaFileDocument = {
    filename: file.filename,
    originalName: file.originalname,
    size: file.size,
    content: fileContent,
    uploadDate: new Date(),
  };
  const existingFile = await javaFilesCollection.findOne({ filename: file.filename });
  if (existingFile) {
    return javaFilesCollection.updateOne({ filename: file.filename }, { $set: javaFileDocument });
  }
  return javaFilesCollection.insertOne(javaFileDocument);
}

//saves the report file to the database
async function saveTestReportToDB(reportContent, javaFile) {
  const reportsCollection = db.collection('testReports');
  const reportDocument = {
    reportName: 'ExtentReports.html',
    content: reportContent,
    reportDate: new Date(),
    javaFile,
  };
  return reportsCollection.insertOne(reportDocument);
}

// Endpoint: Upload and run Java file
app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const uploadedFilePath = path.join(uploadDir, req.file.filename);
  try {
    const fileContent = fs.readFileSync(uploadedFilePath, 'utf8');
    await saveJavaFileToDB(req.file, fileContent);

    const testClassName = req.file.filename.replace('.java', '');
    const result = await compileAndRunJavaFileWithMaven(uploadedFilePath, testClassName);

    if (fs.existsSync(result.reportPath)) {
      const reportContent = fs.readFileSync(result.reportPath, 'utf8');
      await saveTestReportToDB(reportContent, req.file.originalname);
    }

    fs.unlinkSync(uploadedFilePath);

    res.json({
      success: true,
      message: 'Java file processed and report saved.',
    });
  } catch (err) {
    console.error('Error processing file:', err);
    if (fs.existsSync(uploadedFilePath)) {
      fs.unlinkSync(uploadedFilePath);
    }
    res.status(500).json({ error: 'Error processing file.', details: err.message });
  }
});

app.post('/api/upload-code', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const codeDocument = {
      filename: req.file.originalname,
      content: req.file.buffer.toString('utf8'),
      uploadDate: new Date(),
      size: req.file.size
    };

    const result = await db.collection('javaTestCodes').insertOne(codeDocument);

    res.json({
      success: true,
      fileId: result.insertedId,
      filename: codeDocument.filename
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
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
  // For other errors
  return res.status(500).json({ error: 'Server error: ' + err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Fetch all Java code from MongoDB
app.get('/api/all-java-code', async (req, res) => {
  if (!db) {
    return res.status(500).json({ error: 'Database not connected' });
  }
  try {
    const javaFilesCollection = db.collection('javaTestCodes');
    const javaFiles = await javaFilesCollection.find().toArray();
    res.json(javaFiles);
  } catch (err) {
    console.error('Error fetching Java files:', err);
    res.status(500).json({
      error: 'Error fetching Java files.',
      details: err.message
    });
  }
});

// Fetch all reports from MongoDB
app.get('/api/all-reports', async (req, res) => {
  if (!db) {
    return res.status(500).json({ error: 'Database not connected' });
  }
  try {
    const reportsCollection = db.collection('testReports');
    const reports = await reportsCollection.find().toArray();
    res.json(reports);
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({
      error: 'Error fetching reports.',
      details: err.message
    });
  }
});

// Handle file upload and processing
//app.post('/api/upload', upload.single('file'), async (req, res) => {
//  if (!req.file) {
//    return res.status(400).json({ error: 'No file uploaded.' });
//  }
//
//  const uploadedFilePath = path.join(uploadDir, req.file.filename);
//  console.log('File uploaded successfully:', uploadedFilePath);
//
//  try {
//    // Read the content of the uploaded Java file
//    const fileContent = fs.readFileSync(uploadedFilePath, 'utf8');
//    console.log('File content read successfully.');
//
//    // Define the document to insert or update in MongoDB
//    const javaFileDocument = {
//      filename: req.file.filename,
//      originalName: req.file.originalname,
//      size: req.file.size,
//      content: fileContent,   // Store the entire content of the uploaded Java file
//      uploadDate: new Date(),  // Timestamp when the file was uploaded
//    };
//
//    // Use a new collection to store Java files
//    const javaFilesCollection = db.collection('javaTestCodes');
//
//    // Check if a document with the same filename already exists
//    const existingFile = await javaFilesCollection.findOne({ filename: req.file.filename });
//
//    if (existingFile) {
//      // If the file already exists, update the existing document
//      const updateResult = await javaFilesCollection.updateOne(
//        { filename: req.file.filename },  // Find by filename
//        { $set: javaFileDocument }        // Update the document with new content
//      );
//      console.log('Java file updated in MongoDB:', updateResult);
//    } else {
//      // If the file doesn't exist, insert a new document
//      const insertResult = await javaFilesCollection.insertOne(javaFileDocument);
//      console.log('Java file saved to MongoDB:', insertResult);
//    }
//
//    const testClassName = req.file.filename.replace('.java', '');
//    console.log('Compiling and running test with Maven...');
//    const result = await compileAndRunJavaFileWithMaven(uploadedFilePath, testClassName);
//
//    // After running tests, read the ExtentReports.html
//    const reportFilePath = path.join('../../../test/test/test-output', 'ExtentReports.html');
//    console.log(reportFilePath);
//    if (fs.existsSync(reportFilePath)) {
//      const reportContent = fs.readFileSync(reportFilePath, 'utf8');
//
//      // Define the document to insert/update for the test report
//      const reportDocument = {
//        reportName: 'ExtentReports.html',
//        content: reportContent,
//        reportDate: new Date(),  // Timestamp when the report was generated
//        javaFile:req.file.originalname,
//      };
//
//      const reportsCollection = db.collection('testReports');  // Use a separate collection for test reports
//
//      // Insert the report into the database
//      const insertReportResult = await reportsCollection.insertOne(reportDocument);
//      console.log('Test report saved to MongoDB:', insertReportResult);
//    } else {
//      console.log('Test report not found.');
//    }
//
//    // Optionally delete the file after it's saved to DB
//    fs.unlinkSync(uploadedFilePath);
//    console.log('File deleted after saving to DB.');
//
//    // Respond to the client
//    res.json({
//      success: true,
//      file: {
//        filename: req.file.filename,
//        originalName: req.file.originalname,
//        size: req.file.size
//      },
//      message: 'Java file uploaded and saved to MongoDB, and report saved to DB.',
//    });
//
//  } catch (err) {
//    console.error('Error processing file:', err);
//    res.status(500).json({
//      error: 'Error processing file.',
//      details: err.message
//    });
//
//    // Cleanup uploaded file in case of error
//    try {
//      if (fs.existsSync(uploadedFilePath)) {
//        fs.unlinkSync(uploadedFilePath);
//        console.log('File deleted after error.');
//      }
//    } catch (cleanupError) {
//      console.error('Error during cleanup:', cleanupError);
//    }
//  }
//});

//// Function to compile and run the uploaded Java file using Maven
//async function compileAndRunJavaFileWithMaven(testFilePath, testClassName) {
//  return new Promise((resolve, reject) => {
//    const mvnCommand = process.platform === 'win32' ? 'mvnw.cmd' : './mvnw';
//    const projectDir = path.join(__dirname, '..', '..', '..', 'test');
//
//    console.log('Project directory:', projectDir);
//    console.log('Running command:', `${mvnCommand} clean compile`);
//
//    exec(`${mvnCommand} clean compile`, { cwd: projectDir }, (compileError, compileStdout, compileStderr) => {
//      if (compileError) {
//        console.error('Compilation stderr:', compileStderr);
//        console.error('Compilation stdout:', compileStdout);
//        reject(new Error(`Maven compilation failed: ${compileStderr}`));
//        return;
//      }
//
//      console.log('Compilation successful. Running tests...');
//
//      exec(`${mvnCommand} exec:java -Dexec.mainClass="com.test.test.${testClassName}"`,
//        { cwd: projectDir },
//        (runError, runStdout, runStderr) => {
//          if (runError) {
//            console.error('Test execution stderr:', runStderr);
//            console.error('Test execution stdout:', runStdout);
//            reject(new Error(`Test execution failed: ${runStderr}`));
//            return;
//          }
//
//          // Check if report was generated
//          const reportPath = path.join(projectDir, 'test-output', 'ExtentReports.html');
//          if (fs.existsSync(reportPath)) {
//            console.log('Test report generated successfully');
//          }
//
//          resolve({
//            output: runStdout,
//            reportPath: '/reports/ExtentReports.html'
//          });
//      });
//    });
//  });
//}


