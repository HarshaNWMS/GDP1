// server.js

const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use('/CSS', express.static(path.join(__dirname, 'CSS')));
app.use('/JavaScript', express.static(path.join(__dirname, 'JavaScript')));
app.use('/HTML', express.static(path.join(__dirname, 'HTML')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Serve index.html on the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'HTML', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
