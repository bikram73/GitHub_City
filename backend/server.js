require('dotenv').config();
const express = require('express');
const cors = require('cors');
const githubRoutes = require('./routes/githubRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/github', githubRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

