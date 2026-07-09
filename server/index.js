const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT ||3000;

app.use(cors());

app.get('/health', (req, res) => {
  res.status(200).json({ message: 'OK' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});