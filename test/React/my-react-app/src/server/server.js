const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const TestResult = require('./models/TestResult'); // Import the TestResult model
const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/FSDP', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
});

app.get('/', (req, res) => {
  res.send('MongoDB server is running');
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.post('/api/test-results', async (req, res) => {
  const results = req.body; // Expecting an array of results

  try {
    const savedResults = await TestResult.insertMany(results); // Save all results in bulk
    res.status(201).json(savedResults);
  } catch (error) {
    console.error('Error saving test results:', error);
    res.status(500).send('Internal Server Error');
  }
});

