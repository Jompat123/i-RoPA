const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname)));

app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-api.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Test page: http://localhost:${PORT}/test`);
});