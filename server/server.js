require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./src/config/db');

const app = express(); 

app.use(helmet());
app.use(cors()); 
app.use(express.json());


app.get('/api/health', (req, res) => {
  res.status(200).json({ message: "DocuGuard Server is running perfectly!" });
});

const PORT = process.env.PORT || 5000; 

// 11. Only start listening if this file is run directly (useful for testing later)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is cooking on port ${PORT}`);
  });
}

connectDB()

// 12. Export the app for our testing robots
module.exports = app;