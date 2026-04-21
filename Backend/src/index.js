require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'ROPA API is running' });
});

app.use('/api/auth', require('./routes/auth.js'));
app.use('/api/ropa', require('./routes/ropa.js'));
app.use('/api/users', require('./routes/users.js'));
app.use('/api/departments', require('./routes/departments.js'));
app.use('/api/dashboard', require('./routes/dashboard.js'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, prisma };