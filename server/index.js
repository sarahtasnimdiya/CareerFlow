const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT ||3000;
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

app.use(cors());
app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('/health', (req, res) => {
  res.status(200).json({ message: 'OK' });
});

app.get('/db-health', async (req, res) => {
  const count = await prisma.user.count();
  res.json({ message: `Database is healthy. User count: ${count}` });
  
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});