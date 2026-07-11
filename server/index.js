const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT ||3000;
const path = require('path');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const bcrypt = require('bcryptjs');

app.use(cors());
app.use(express.static(path.join(__dirname, '../client/dist')));
app.use(express.json());

app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
          username,
          email,
          password: hashedPassword,
          role: 'CANDIDATE'
        }
      });
      res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating user' });
  }
});


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