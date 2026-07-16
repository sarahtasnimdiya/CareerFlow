const express = require('express');
const prisma = require('../lib/db');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {

    try {
        const projects = await prisma.project.findMany({
            where: { userId: req.user.userId },
            orderBy: { startDate: 'desc' }
        });
        res.json(projects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching projects' });
    }
});


router.post('/', authenticate, async (req, res) => {

    const { name, startDate, endDate, description, tags } = req.body;

    try { 
        const project = await prisma.project.create({
            data: {
                userId: req.user.userId,
                name,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                description,
                tags
            }
        });
        res.status(201).json(project);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating project' });
    }
});


router.put('/:id', authenticate, async (req, res) => {

    const id = parseInt(req.params.id);
    const { name, startDate, endDate, description, tags, version } = req.body;

    try {
        const project = await prisma.project.update({
            where: { id, userId: req.user.userId, version },
            data: {
                name,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                description,
                tags,
                version: { increment: 1 }
            }
        });
        res.json(project);
    } catch (error) {
        console.error(error);
        if (error.code === 'P2025') {
            return res.status(409).json({ message: 'Project not found or not yours or version mismatch' });
        }
        res.status(500).json({ message: 'Error updating project' });
    }
});


router.delete('/:id', authenticate, async (req, res) => {

    const id = parseInt(req.params.id);

    try {
        await prisma.project.delete({
            where: { id, userId: req.user.userId }
        });
        res.json({ message: 'Project deleted' });
    } catch (error) {
        console.error(error);
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Project not found or not yours' });
        }
        res.status(500).json({ message: 'Error deleting project' });
    }
});

module.exports = router;