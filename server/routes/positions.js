 const express = require('express');
 const prisma = require('../lib/db');
 const authenticate = require('../middleware/authenticate');
 const requireRole = require('../middleware/requireRole');

 const router = express.Router();


 router.get('/',authenticate, async (req, res) => {

    try {
        const positions = await prisma.position.findMany({
            include: {
                attributes: { include: { attribute: true } }
            }
        });
        res.json(positions);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching positions' });
    }

});

router.get('/:id', authenticate, async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const position = await prisma.position.findUnique({
            where: { id },
            include: {
                attributes: { include: { attribute: true } }
            }
        });
        if (!position) {
            return res.status(404).json({ message: 'Position not found' });
        }
        res.json(position);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching position' });
    }
});

router.post('/', authenticate, requireRole(['RECRUITER', 'ADMIN']), async (req, res) => {
    const { title, shortDescription, isPublic, maxProjects,projectTags, attributeIds } = req.body;
    try {
        const position = await prisma.position.create({
            data: {
                title, 
                shortDescription,
                isPublic,
                maxProjects,
                projectTags,
                attributes: {
                    create: attributeIds.map(attributeId => ({ attributeId }))
                    }

            },
            include: {
                attributes: { include: { attribute: true } }
            }
        });
        res.status(201).json(position);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating position' });
    }
});

router.put('/:id', authenticate, requireRole(['RECRUITER', 'ADMIN']), async (req, res) => {
    const id = parseInt(req.params.id);
    const { title, shortDescription, isPublic, maxProjects, projectTags, attributeIds } = req.body;
    try {
        const position = await prisma.position.update({
            where: { id },
            data: {
                title,
                shortDescription,
                isPublic,
                maxProjects,
                projectTags,
                attributes: {
                    deleteMany: {  positionId: id } ,
                    createMany: { data: attributeIds.map(attributeId => ({ attributeId })) }
                }
            },
            include: {
                attributes: { include: { attribute: true } }
            }
        });
        res.json(position);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating position' });
    }
});


router.delete('/:id', authenticate, requireRole(['RECRUITER', 'ADMIN']), async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const position = await prisma.position.delete({
            where: { id }
        });
        res.json(position);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting position' });
    }
});

module.exports = router;
