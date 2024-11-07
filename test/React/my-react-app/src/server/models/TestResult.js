const mongoose = require('mongoose');

// Define the schema for the test results
const TestResultSchema = new mongoose.Schema({
  testCaseId: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  success: { type: Boolean, required: true },
  errorMessage: { type: String, required: false },
}, { collection: 'TestResult' }); // Specify the collection name

// Create the model using the defined schema
const TestResult = mongoose.model('TestResult', TestResultSchema);

// Export the model
module.exports = TestResult;