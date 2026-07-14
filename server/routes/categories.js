const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../lib/db');
const jwt = require('jsonwebtoken');
const authenticate = require('../middleware/authenticate');

const router = express.Router();


router.get('/',authenticate, async (req, res) => {
    try {
        const categories = await prisma.category.findMany();
        res.json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching categories' });
    }
});

module.exports = router;