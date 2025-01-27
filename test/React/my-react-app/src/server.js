// server.js

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

// ==============================
// 1. TestCounter logic inlined
// ==============================
const fsPromises = fs.promises;

/**
 * Count test cases by browser from a given Java file with a @DataProvider.
 */
async function countTestCasesByBrowser(filePath) {
  try {
    const content = await fsPromises.readFile(filePath, "utf8");

    // Regex to find the @DataProvider block (handles multiline content)
    const dataProviderRegex =
      /@DataProvider\s*\(.*?\)\s*public\s*Object\[\]\[\]\s*\w+\s*\(\)\s*\{([\s\S]*?)\};/;
    const match = content.match(dataProviderRegex);

    if (match) {
      const dataProviderContent = match[1];

      // Regex to find all test cases within the 2D array
      const testCaseRegex = /\{["'](chrome|firefox|edge)["'],/g;
      const browserCounts = { chrome: 0, firefox: 0, edge: 0 };

      let testCaseMatch;
      while ((testCaseMatch = testCaseRegex.exec(dataProviderContent)) !== null) {
        const browser = testCaseMatch[1].toLowerCase();
        if (browserCounts[browser] !== undefined) {
          browserCounts[browser]++;
        }
      }
      return browserCounts;
    } else {
      console.error("No @DataProvider method found in the file.");
      return { chrome: 0, firefox: 0, edge: 0 };
    }
  } catch (error) {
    console.error(`Error reading or parsing the file: ${error.message}`);
    return { chrome: 0, firefox: 0, edge: 0 };
  }
}

/**
 * Calculate how many replicas are needed based on the number of test cases.
 * Example: 1 replica per 3 tests, rounded up.
 */
function calculateReplicas(testCount) {
  return Math.ceil(testCount / 3);
}

/**
 * Update the 'replicas:' field in a Kubernetes deployment YAML file.
 */
async function updateKubernetesDeployment(deploymentFilePath, replicas) {
  try {
    const deploymentContent = await fsPromises.readFile(deploymentFilePath, "utf8");
    const replicasRegex = /replicas:\s*\d+/;
    const updatedContent = deploymentContent.replace(replicasRegex, `replicas: ${replicas}`);

    await fsPromises.writeFile(deploymentFilePath, updatedContent, "utf8");
    console.log(`Updated replicas to ${replicas} in ${path.basename(deploymentFilePath)}.`);
    return true;
  } catch (error) {
    console.error(`Error updating deployment file: ${error.message}`);
    return false;
  }
}

/**
 * Apply a Kubernetes deployment using kubectl.
 */
function applyKubernetesDeployment(deploymentFilePath) {
  return new Promise((resolve, reject) => {
    exec(`kubectl apply -f ${deploymentFilePath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error applying ${deploymentFilePath}: ${stderr}`);
        return reject(error);
      }
      console.log(`Applied ${deploymentFilePath} successfully: ${stdout}`);
      resolve(stdout);
    });
  });
}
// ==============================
// End of TestCounter logic
// ==============================


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
const multerStorage = multer.diskStorage({
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
  storage: multerStorage,
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

/**
 * Helper to read JSON test report from a known location.
 */
async function readJSONReport(repoRoot) {
  return new Promise((resolve, reject) => {
    const reportPath = path.join(repoRoot, 'test', 'test', 'test-results.json');
    console.log('reportPath', reportPath);
    fs.readFile(reportPath, 'utf8', (err, data) => {
      if (err) {
        console.error(`Failed to read JSON report at path: ${reportPath}`);
        reject(new Error(`Failed to read JSON report: ${err.message}`));
        return;
      }
      try {
        const jsonContent = JSON.parse(data);
        resolve(jsonContent);
      } catch (error) {
        reject(new Error('Invalid JSON format in test results file'));
      }
    });
  });
}

/**
 * Helper to send the test report via email.
 */
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

/**
 * Compile and run Java file with Maven (clean compile + exec:java).
 */
async function compileAndRunJavaFileWithMaven(testFilePath, testClassName) {
  return new Promise((resolve, reject) => {
    const mvnCommand = process.platform === 'win32' ? 'mvnw.cmd' : './mvnw';
    const projectDir = path.join(__dirname, '..', '..', '..', 'test');
    exec(`${mvnCommand} clean compile`, { cwd: projectDir }, (compileError, compileStdout, compileStderr) => {
      if (compileError) {
        return reject(new Error(`Compilation failed: ${compileStderr}`));
      }
      exec(
        `${mvnCommand} exec:java -Dexec.mainClass="com.test.test.${testClassName}"`,
        { cwd: projectDir },
        (runError, runStdout, runStderr) => {
          if (runError) {
            return reject(new Error(`Execution failed: ${runStderr}`));
          }
          resolve({
            output: runStdout,
            reportPath: path.join(projectDir, 'test-output', 'ExtentReports.html'),
          });
        }
      );
    });
  });
}

/**
 * Only compile (no run).
 */
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

/**
 * Save the Java file contents to the MongoDB.
 */
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

/**
 * Save JSON test report to MongoDB.
 */
async function saveJSONReportToDB(reportContent) {
  const reportsCollection = db.collection('JSONREPORTS');
  const currentDate = new Date();
  const reportDocument = {
    date: currentDate.toISOString().split('T')[0],
    content: reportContent,
  };
  return reportsCollection.insertOne(reportDocument);
}

/**
 * Save the test report (HTML) to MongoDB.
 */
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

// ===========================================
// Endpoint: Upload and run Java file
// ===========================================
app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const recipientEmail = req.body.email;
  if (!recipientEmail) {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  const uploadedFilePath = path.join(uploadDir, req.file.filename);
  const testClassName = req.file.filename.replace('.java', '');
  const repoRoot = path.join(__dirname, '..', '..', '..', '..');

  try {
    // 1. Compile and run the Java file with Maven
    console.log('Compiling and running test with Maven...');
    const result = await compileAndRunJavaFileWithMaven(uploadedFilePath, testClassName);

    // 2. Now count the test cases by browser from the uploaded file
    const browserCounts = await countTestCasesByBrowser(uploadedFilePath);
    console.log(`Test case counts by browser: ${JSON.stringify(browserCounts, null, 2)}`);

    // 3. Update and apply the Kubernetes deployments based on test counts
    // Adjust the directory if your YAML files are elsewhere
    const deploymentDir = path.join(__dirname, '..', '..', '..');
    const deploymentPaths = {
      chrome: path.join(deploymentDir, "selenium-node-chrome-deployment.yaml"),
      firefox: path.join(deploymentDir, "selenium-node-firefox-deployment.yaml"),
      edge: path.join(deploymentDir, "selenium-node-edge-deployment.yaml")
    };

    const updateAndApplyPromises = Object.entries(deploymentPaths).map(async ([browser, deploymentFilePath]) => {
      const testCount = browserCounts[browser] || 0;
      const replicas = calculateReplicas(testCount);
      if (replicas > 0) {
        const updated = await updateKubernetesDeployment(deploymentFilePath, replicas);
        if (updated) {
          await applyKubernetesDeployment(deploymentFilePath);
        }
      } else {
        console.log(`No test cases for ${browser}. Deployment not updated.`);
      }
    });

    await Promise.all(updateAndApplyPromises);

    // 4. Read JSON report (wait until the file is created)
    const reportPath = path.join(repoRoot, 'test', 'test', 'test-results.json');
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    // Wait up to 20 seconds for the file to exist
    let attempts = 0;
    const maxAttempts = 20;
    while (!fs.existsSync(reportPath) && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      attempts++;
    }

    if (!fs.existsSync(reportPath)) {
      throw new Error(`Report file not found after ${maxAttempts} seconds`);
    }

    const reportContent = fs.readFileSync(reportPath, 'utf8');

    // 5. Save JSON report to DB and send email
    await saveJSONReportToDB(reportContent);
    await sendReportEmail(recipientEmail, reportContent, req.file.originalname);

    // 6. Clean up the uploaded .java file if desired
    fs.unlinkSync(uploadedFilePath);

    res.json({
      success: true,
      message: 'Java file processed, JSON report saved, and email sent.'
    });

  } catch (err) {
    console.error('Error processing file:', err);
    if (fs.existsSync(uploadedFilePath)) {
      fs.unlinkSync(uploadedFilePath);
    }
    res.status(500).json({
      error: 'Error processing file.',
      details: err.message
    });
  }
});

// ===========================================
// Endpoint: Upload code (compile only)
// ===========================================
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
     const result = await saveJavaFileToDB(req.file, fileContent);
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
  return res.status(500).json({ error: 'Server error: ' + err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// ===========================================
// Additional endpoints for DB data retrieval
// ===========================================

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

// Fetch JSON reports from MongoDB
app.get('/api/json-reports', async (req, res) => {
  if (!db) {
    return res.status(500).json({ error: 'Database not connected' });
  }
  try {
    const reportsCollection = db.collection('JSONREPORTS');
    const reports = await reportsCollection.find()
      .sort({ date: -1 })
      .toArray();

    res.json(reports);
  } catch (err) {
    console.error('Error fetching JSON reports:', err);
    res.status(500).json({
      error: 'Error fetching reports.',
      details: err.message
    });
  }
});
