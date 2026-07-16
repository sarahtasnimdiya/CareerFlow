const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../lib/db');
const jwt = require('jsonwebtoken');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.get('/me', authenticate, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                version: true,
                createdAt: true,
                profileValues: { include: { attribute: true } }
            }
        });
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/values', authenticate, async (req, res) => {
    const { attributeId, value, version } = req.body;
    const userId = req.user.userId;

    try {
        const existing = await prisma.profileValue.findUnique({
            where: { 
                userId_attributeId: { 
                    userId, 
                    attributeId } }
            });

        if (!existing) {
            const created = await prisma.profileValue.create({
                data: { userId, attributeId, value }
            });
            return res.status(201).json(created);
            }

    const updated = await prisma.profileValue.update({
        where: { 
            userId_attributeId: { 
                userId, 
                attributeId }, 
            version },
        data: { value, 
            version: { increment: 1 } }
        });
        res.json(updated);

    } catch (error) {
        console.error(error);
        if (error.code === 'P2025') {
        return res.status(409).json({ message: 'Value was changed elsewhere. Please refresh.' });
        }
        res.status(500).json({ message: 'Error saving value' });
    }
});

router.delete('/values/:attributeId', authenticate, async (req, res) => {
    const attributeId = parseInt(req.params.attributeId);

    try {
        await prisma.profileValue.delete({
            where: {
                userId_attributeId: {
                    userId: req.user.userId,
                    attributeId
                }
            }
        });
        res.json({ message: 'Removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error removing attribute' });
    }
});

module.exports = router;