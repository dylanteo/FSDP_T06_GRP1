// server.js
const cron = require('node-cron');
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { exec } = require('child_process');
const { MongoClient } = require('mongodb');
const nodemailer = require('nodemailer');
require('dotenv').config();
const { router: authRouter, authMiddleware } = require('./authRoutes');

// === OpenAI (new style) ===
const { OpenAI } = require("openai");
// Provide your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use('/api', authRouter);
//app.use('/api', authMiddleware);
app.use((req, res, next) => {
  req.user = { role: 'admin', permissions: ['*'] }; // Mock an "authorized" user with full access
  next();
});
// ==============================
// 1. TestCounter logic inlined
// ==============================
const fsPromises = fs.promises;


const scheduleSchema = {
  type: String,  // 'daily' or 'monthly'
  time: String,  // HH:mm format
  dayOfMonth: Number,  // 1-31, only used for monthly
  email: String,
  selectedFiles: [String],
  active: Boolean,
  lastModified: Date
};

/**
 * Count test cases by browser from a given Java file with a @DataProvider.
 */

async function countTestCasesByBrowser(filePath) {
  try {
    const content = await fsPromises.readFile(filePath, "utf8");

    const dataProviderRegex =
      /@DataProvider\s*\(.*?\)\s*public\s*Object\[\]\[\]\s*\w+\s*\(\)\s*\{([\s\S]*?)\};/;
    const match = content.match(dataProviderRegex);

    if (match) {
      const dataProviderContent = match[1];

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

function calculateReplicas(testCount) {
  return Math.ceil(testCount / 3);
}

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

// Setup Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
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

// Basic CORS setup
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['POST', 'GET'],
  allowedHeaders: ['Content-Type']
}));

// MongoDB connect
const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
const dbName = 'TestCaseOutput1';
const collectionName = 'testCaseOutputs';
let db;

client.connect()
  .then(() => {
    db = client.db(dbName);
    console.log('Connected to MongoDB');
    return initializeSchedules();
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

// Endpoint to fetch test results from MongoDB
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

// Serve HTML reports
app.use('/reports', express.static(path.join(__dirname, '..', '..', '..', 'test', 'test-output')));

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

// Setup directories
const uploadDir = path.join(__dirname, '..', '..', '..', 'test', 'src', 'main', 'java', 'com', 'test', 'test');
const testOutputDir = path.join(__dirname, '..', '..', '..', 'test', 'test-output');

if (!fs.existsSync(testOutputDir)) {
  fs.mkdirSync(testOutputDir, { recursive: true });
}

// Multer setup
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
    fileSize: 5 * 1024 * 1024
  }
});
function setupScheduledJob(schedule) {
  let cronExpression;

  if (schedule.type === 'daily') {
    const [hours, minutes] = schedule.time.split(':');
    cronExpression = `${minutes} ${hours} * * *`;
  } else if (schedule.type === 'monthly') {
    const [hours, minutes] = schedule.time.split(':');
    cronExpression = `${minutes} ${hours} ${schedule.dayOfMonth} * *`;
  }

  console.log(`Setting up ${schedule.type} schedule for ${schedule.email} at ${schedule.time}`);
  console.log(`Cron expression: ${cronExpression}`);
  console.log(`Selected files: ${schedule.selectedFiles.join(', ')}`);

  const job = cron.schedule(cronExpression, async () => {
    console.log(`Running scheduled tests for schedule ${schedule._id}:`, new Date());
    console.log(`Files to process: ${schedule.selectedFiles.join(', ')}`);

    try {
      // Run each selected file
      for (const filename of schedule.selectedFiles) {
        console.log(`Processing file: ${filename}`);

        // Get the file content from the database
        const javaFilesCollection = db.collection('javaTestCodes');
        const fileDoc = await javaFilesCollection.findOne({ filename });

        if (!fileDoc) {
          console.error(`File not found in database: ${filename}`);
          continue;
        }

        // Create form data for the file
        const formData = new FormData();
        const blob = new Blob([fileDoc.content], { type: 'text/x-java' });
        formData.append('file', blob, filename);
        formData.append('email', schedule.email);

        // Execute the test
        const response = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`Failed to execute test for ${filename}: ${response.statusText}`);
        }

        console.log(`Successfully executed test for ${filename}`);
      }

      console.log(`Completed scheduled execution for schedule ${schedule._id}`);
    } catch (error) {
      console.error(`Error in scheduled job for schedule ${schedule._id}:`, error);
      // You might want to send an email notification about the failure
    }
  });

  return job;
}

const activeJobs = new Map();

async function initializeSchedules() {
  if (!db) {
    console.error('Cannot initialize schedules: Database not connected');
    return;
  }

  try {
    console.log('Starting to initialize schedules...');
    const schedulesCollection = db.collection('schedules');
    const activeSchedules = await schedulesCollection.find({ active: true }).toArray();

    console.log(`Found ${activeSchedules.length} active schedules`);


// Helper functions

    // Clear any existing jobs
    for (const [scheduleId, job] of activeJobs.entries()) {
      console.log(`Stopping existing job for schedule ${scheduleId}`);
      job.stop();
    }
    activeJobs.clear();

    // Set up new jobs for each active schedule
    for (const schedule of activeSchedules) {
      console.log(`Initializing schedule ${schedule._id}:`);
      console.log(`- Type: ${schedule.type}`);
      console.log(`- Time: ${schedule.time}`);
      console.log(`- Email: ${schedule.email}`);
      console.log(`- Files: ${schedule.selectedFiles.join(', ')}`);

      const job = setupScheduledJob(schedule);
      activeJobs.set(schedule._id.toString(), job);
    }

    console.log('Schedule initialization completed');
    console.log(`Total active jobs: ${activeJobs.size}`);
  } catch (error) {
    console.error('Error initializing schedules:', error);
  }
}
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
        return reject(new Error(`Failed to read JSON report: ${err.message}`));
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

async function sendReportEmail(recipientEmail, reportContent, filename) {
  // Parse the JSON content
  const report = JSON.parse(reportContent);

  // Generate status summary
  const totalTests = report.testResults.length;
  const passedTests = report.testResults.filter(test => test.status === 'pass').length;
  const failedTests = report.testResults.filter(test => test.status === 'fail').length;

  // Calculate success rate
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);

  // Format duration to be more readable
  const formatDuration = (ms) => {
    const seconds = (ms / 1000).toFixed(2);
    return `${seconds}s`;
  };

  // Format timestamp to be more readable
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  // Generate the HTML content
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .summary { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .summary-box {
          padding: 15px;
          border-radius: 5px;
          text-align: center;
          flex: 1;
          margin: 0 10px;
        }
        .test-case {
          background-color: #fff;
          border: 1px solid #ddd;
          border-radius: 5px;
          padding: 15px;
          margin-bottom: 15px;
        }
        .pass { color: #28a745; }
        .fail { color: #dc3545; }
        .info { color: #17a2b8; }
        .steps { margin-left: 20px; }
        .step { margin: 10px 0; }
        .timestamp { color: #666; font-size: 0.9em; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Test Execution Report - ${report.testName}</h2>
          <p>Report generated at: ${new Date().toLocaleString()}</p>
        </div>

        <div class="summary">
          <div class="summary-box" style="background-color: #e8f5e9;">
            <h3>Total Tests</h3>
            <p style="font-size: 24px;">${totalTests}</p>
          </div>
          <div class="summary-box" style="background-color: #e3f2fd;">
            <h3>Success Rate</h3>
            <p style="font-size: 24px;">${successRate}%</p>
          </div>
          <div class="summary-box" style="background-color: #e8f5e9;">
            <h3>Passed</h3>
            <p style="font-size: 24px;" class="pass">${passedTests}</p>
          </div>
          <div class="summary-box" style="background-color: #ffebee;">
            <h3>Failed</h3>
            <p style="font-size: 24px;" class="fail">${failedTests}</p>
          </div>
        </div>

        <h3>Test Cases Details</h3>
        ${report.testResults.map(test => `
          <div class="test-case">
            <h4>${test.testName} <span class="${test.status}">[${test.status.toUpperCase()}]</span></h4>
            <p>
              <strong>Browser:</strong> ${test.browser} |
              <strong>Duration:</strong> ${formatDuration(test.duration)} |
              <strong>Thread:</strong> ${test.threadName}
            </p>
            <p><strong>Test Steps:</strong></p>
            <div class="steps">
              ${test.steps.map(step => `
                <div class="step">
                  <strong class="${step.status}">${step.name}</strong>: ${step.message}
                  <div class="timestamp">${formatTimestamp(step.timestamp)}</div>
                </div>
              `).join('')}
            </div>
            ${test.error ? `
              <p class="fail">
                <strong>Error:</strong><br>
                <pre style="white-space: pre-wrap;">${test.error}</pre>
              </p>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: `Test Report: ${report.testName} - Success Rate: ${successRate}%`,
    html: htmlContent,
    attachments: [{
      filename: 'TestReport.json',
      content: reportContent
    }]
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

function compileAndRunJavaFileWithMaven(testFilePath, testClassName) {
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

function compileJavaFileWithMaven(testFilePath) {
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
    // 1. Count test cases
    const browserCounts = await countTestCasesByBrowser(uploadedFilePath);
    console.log(`Test case counts by browser: ${JSON.stringify(browserCounts, null, 2)}`);

    // 2. Update & apply K8s
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

    console.log('Compiling and running test with Maven...');
    await compileAndRunJavaFileWithMaven(uploadedFilePath, testClassName);


    // 4. Read JSON report
    const reportPath = path.join(repoRoot, 'test', 'test', 'test-results.json');
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    let attempts = 0;
    const maxAttempts = 20;
    while (!fs.existsSync(reportPath) && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    if (!fs.existsSync(reportPath)) {
      throw new Error(`Report file not found after ${maxAttempts} seconds`);
    }

    const reportContent = fs.readFileSync(reportPath, 'utf8');

    // 5. Save JSON report to DB & send email
    await saveJSONReportToDB(reportContent);
    await sendReportEmail(recipientEmail, reportContent, req.file.originalname);

    // 6. Clean up
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
    // 1: Compile only
    console.log('Compiling Java file...');
    await compileJavaFileWithMaven(uploadedFilePath);

    // 2: Read & save
    const fileContent = fs.readFileSync(uploadedFilePath, 'utf8');
    const result = await saveJavaFileToDB(req.file, fileContent);

    // 3: Cleanup
    fs.unlinkSync(uploadedFilePath);

    res.json({
      success: true,
      fileId: result.insertedId,
      filename: req.file.originalname,
      message: 'File compiled successfully and saved to database'
    });

  } catch (err) {
    console.error('Compilation or upload error:', err);

    if (fs.existsSync(uploadedFilePath)) {
      fs.unlinkSync(uploadedFilePath);
    }

    res.status(500).json({
      error: 'Compilation failed or upload error',
      details: err.message
    });
  }
});

// === OpenAI (new style) Endpoint ===
app.use(express.json()); // parse JSON body
app.post('/api/ai-insights', async (req, res) => {
  try {
    const { errorMessage } = req.body;
    if (!errorMessage) {
      return res.status(400).json({ error: 'Missing errorMessage in request body.' });
    }

    // Build a short prompt
    const prompt = `
      The following Selenium test step failed with this error message:
      "${errorMessage}"

      Provide a short explanation and possible solutions:
    `;

    // Notice we're now using openai.chat.completions.create
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: prompt }
      ],
      max_tokens: 200,
      temperature: 0.7
    });

    // Extract the AI answer
    const aiAnswer = response.choices?.[0]?.message?.content || '';
    res.json({ insight: aiAnswer });

  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    res.status(500).json({
      error: 'Failed to retrieve AI insight',
      details: error.message
    });
  }
});

// Global error handler for Multer or other issues
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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// ===========================================
// Additional endpoints for DB data retrieval
// ===========================================
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
app.get('/api/schedule', async (req, res) => {
  if (!db) {
    return res.status(500).json({ error: 'Database not connected' });
  }
  try {
    const schedulesCollection = db.collection('schedules');
    const currentSchedule = await schedulesCollection.findOne({ active: true });
    res.json(currentSchedule || null);
  } catch (err) {
    console.error('Error fetching schedule:', err);
    res.status(500).json({
      error: 'Error fetching schedule',
      details: err.message
    });
  }
});

// Create or update schedule
// Replace the POST /api/schedule endpoint in server.js with this implementation:

app.post('/api/schedule', async (req, res) => {
  if (!db) {
    return res.status(500).json({ error: 'Database not connected' });
  }

  const { type, time, dayOfMonth, email, selectedFiles } = req.body;

  // Validation
  if (!type || !time || !email || !selectedFiles || !selectedFiles.length) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (type === 'monthly' && (!dayOfMonth || dayOfMonth < 1 || dayOfMonth > 31)) {
    return res.status(400).json({ error: 'Invalid day of month' });
  }

  try {
    const schedulesCollection = db.collection('schedules');

    // Deactivate any existing schedule
    await schedulesCollection.updateMany(
      { active: true },
      { $set: { active: false } }
    );

    // Create new schedule
    const newSchedule = {
      type,
      time,
      dayOfMonth: type === 'monthly' ? dayOfMonth : null,
      email,
      selectedFiles,
      active: true,
      lastModified: new Date()
    };

    const result = await schedulesCollection.insertOne(newSchedule);

    // Set up the scheduled job
    const job = setupScheduledJob(newSchedule);
    activeJobs.set(result.insertedId.toString(), job);

    res.json({
      success: true,
      message: 'Schedule created successfully',
      schedule: {
        ...newSchedule,
        _id: result.insertedId
      }
    });

  } catch (err) {
    console.error('Error creating schedule:', err);
    res.status(500).json({
      error: 'Error creating schedule',
      details: err.message
    });
  }
});

// Delete schedule
app.delete('/api/schedule/:id', async (req, res) => {
  if (!db) {
    return res.status(500).json({ error: 'Database not connected' });
  }

  try {
    const schedulesCollection = db.collection('schedules');
    const result = await schedulesCollection.deleteOne({
      _id: new MongoClient.ObjectId(req.params.id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    res.json({
      success: true,
      message: 'Schedule deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting schedule:', err);
    res.status(500).json({
      error: 'Error deleting schedule',
      details: err.message
    });
  }
});
