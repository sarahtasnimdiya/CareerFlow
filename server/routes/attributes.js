 const express = require('express');
 const prisma = require('../lib/db');
 const authenticate = require('../middleware/authenticate');
 const requireRole = require('../middleware/requireRole');

 const router = express.Router();

 router.get('/', authenticate, async (req, res) => {
    const {prefix, categoryId} = req.query;

    const where = {};

    if (prefix) {
        where.name = { startsWith: prefix , mode: 'insensitive' };
    }

    if (categoryId) {
        where.categoryId = parseInt(categoryId);
    }

    try {
        const attributes = await prisma.attribute.findMany({
            where,
            include: {
                category: true
            }
        });
        res.json(attributes);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching attributes' });
    }

 });

 router.get('/:id', authenticate, async (req, res) => {
    const id = parseInt(req.params.id);

    try {
        const attribute = await prisma.attribute.findUnique({
            where: { id },
            include: {
                category: true
            }
        });

        if (!attribute) {
            return res.status(404).json({ message: 'Attribute not found' });
        }
        res.json(attribute);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching attribute' });
    }
 });

 router.post('/', authenticate, requireRole(['RECRUITER', 'ADMIN']), async (req, res) => {

    const { name, description, type, categoryId } = req.body;

    try {
        const nameExists = await prisma.attribute.findUnique({ where: { name } });

        if (nameExists) {
            return res.status(400).json({ message: 'Attribute with this name already exists' });
        }

        const attribute = await prisma.attribute.create({
            data: {
                name,
                description,
                type,
                categoryId
            }
        });

        res.status(201).json(attribute);
    }
    catch (error) {
        console.error(error);
        if (error.code === 'P2003') {
            return res.status(400).json({ message: 'Invalid categoryId, no such category exists' });
        }
        res.status(500).json({ message: 'Error creating attribute' });
    }
 });

 router.put('/:id', authenticate, requireRole(['RECRUITER', 'ADMIN']), async (req, res) => {
    const id = parseInt(req.params.id);
    const { name, description, type, categoryId, version } = req.body;

    try {
        const attribute = await prisma.attribute.update({
            where: { id: id, version: version },
            data: {
                name,
                description,
                type,
                categoryId,
                version: { increment: 1 }   
            }
        });

        res.json(attribute);
    }
    catch (error) {
        console.error(error);
        if (error.code === 'P2025') {
            return res.status(409).json({ message: 'Attribute not found or version mismatch' });
        }
        res.status(500).json({ message: 'Error updating attributes' });
        
    }
 });

 router.delete('/:id', authenticate, requireRole(['RECRUITER', 'ADMIN']), async (req, res) => {
    const id = parseInt(req.params.id);

    try {
        const attribute = await prisma.attribute.delete({
            where: { id }
        });

        res.status(200).json(attribute);
    }
    catch (error) {
        console.error(error);
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Attribute not found' });
        }
        res.status(500).json({ message: 'Error deleting attribute' });
    }
 });

 module.exports = router;