const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../lib/db');
const jwt = require('jsonwebtoken');

const router = express.Router();



router.post('/register', async (req, res) => {
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

router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const user = await prisma.user.findFirst({ where: {
      OR: [
          { email: identifier },
          { username: identifier }
        ]
     }
   });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ 
        token ,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        }
    });


  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error logging in' });
  }

});

const authenticate = require('../middleware/authenticate');
const requireRole = require('../middleware/requireRole');

router.get('/me', authenticate, requireRole(['CANDIDATE', 'RECRUITER', 'ADMIN']), async (req, res) => {
  res.json({ user: req.user });
});


module.exports = router;