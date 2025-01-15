//server.js

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { exec } = require('child_process');
const { MongoClient } = require('mongodb');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,  // use SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
        rejectUnauthorized: false
      }
});

transporter.verify(function(error, success) {
  if (error) {
    console.log('Email server connection error:', error);
  } else {
    console.log("Email server connection successful");
  }
});

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

async function sendReportEmail(recipientEmail, reportContent, filename) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: `Test Report for ${filename}`,
    html: `
      <h2>Test Execution Report</h2>
      <p>Please find attached the test execution report for ${filename}.</p>
      <p>Report generated at: ${new Date().toLocaleString()}</p>
    `,
    attachments: [
      {
        filename: 'TestReport.html',
        content: reportContent
      }
    ]
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Report email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

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

async function compileJavaFileWithMaven(testFilePath) {
  return new Promise((resolve, reject) => {
    const mvnCommand = process.platform === 'win32' ? 'mvnw.cmd' : './mvnw';
    const projectDir = path.join(__dirname, '..', '..', '..', 'test');

    exec(`${mvnCommand} clean compile`, { cwd: projectDir }, (compileError, compileStdout, compileStderr) => {
      if (compileError) {
        return reject(new Error(`Compilation failed: ${compileStderr}`));
      }
      resolve({
        success: true,
        output: compileStdout
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

  const recipientEmail = req.body.email; // Add this field to your form data
  if (!recipientEmail) {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  const uploadedFilePath = path.join(uploadDir, req.file.filename);
  const testClassName = req.file.filename.replace('.java', '');
  let result;

  try {
    // Step 1: Compile and run the Java file with Maven
    console.log('Compiling and running test with Maven...');
    result = await compileAndRunJavaFileWithMaven(uploadedFilePath, testClassName);

    // Step 2: If compilation is successful, save the Java file to the database
    const fileContent = fs.readFileSync(uploadedFilePath, 'utf8');

    // Step 3: If report exists, save the report to the database and send email
    if (fs.existsSync(result.reportPath)) {
      const reportContent = fs.readFileSync(result.reportPath, 'utf8');
      await saveTestReportToDB(reportContent, req.file.originalname);

      // Send email with report
      await sendReportEmail(recipientEmail, reportContent, req.file.originalname);
    }

    // Step 4: Clean up the uploaded file
    fs.unlinkSync(uploadedFilePath);

    // Respond with success
    res.json({
      success: true,
      message: 'Java file processed, report saved, and email sent.',
    });
  } catch (err) {
    console.error('Error processing file:', err);
    // If there is an error during any of the steps, clean up the uploaded file
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

  const uploadedFilePath = path.join(uploadDir, req.file.filename);

  try {
    // Step 1: Attempt to compile the Java file
    console.log('Compiling Java file...');
    await compileJavaFileWithMaven(uploadedFilePath);

    // Step 2: If compilation is successful, read the file content
    const fileContent = fs.readFileSync(uploadedFilePath, 'utf8');

    // Step 3: Save to database
    const codeDocument = {
      filename: req.file.originalname,
      content: fileContent,
      uploadDate: new Date(),
      size: req.file.size,
      compilationStatus: 'success'
    };
    await saveJavaFileToDB(req.file, fileContent);
    //const result = await db.collection('javaTestCodes').insertOne(codeDocument);

    // Step 4: Clean up the uploaded file
    fs.unlinkSync(uploadedFilePath);

    res.json({
      success: true,
      fileId: result.insertedId,
      filename: codeDocument.filename,
      message: 'File compiled successfully and saved to database'
    });

  } catch (err) {
    console.error('Compilation or upload error:', err);

    // Clean up the uploaded file in case of error
    if (fs.existsSync(uploadedFilePath)) {
      fs.unlinkSync(uploadedFilePath);
    }

    res.status(500).json({
      error: 'Compilation failed or upload error',
      details: err.message
    });
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




