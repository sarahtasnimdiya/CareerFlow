const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.set('trust proxy', 1);

const port = process.env.PORT ||3000;
const prisma = require('./lib/db');

const authRoutes = require('./routes/auth');
const oauthRoutes = require('./routes/oauth');

const passport = require('./config/passport');

app.use(cors());
app.use(express.static(path.join(__dirname, '../client/dist')));
app.use(express.json());
app.use(passport.initialize());

app.use('/api', authRoutes);
app.use('/api/auth', oauthRoutes);




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