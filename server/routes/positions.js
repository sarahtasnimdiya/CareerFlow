 const express = require('express');
 const prisma = require('../lib/db');
 const authenticate = require('../middleware/authenticate');
 const requireRole = require('../middleware/requireRole');

 const router = express.Router();


 router.get('/',authenticate, async (req, res) => {

    const { prefix, attributeId } = req.query;
    const where = {};

    if (prefix) {
        where.title = { startsWith: prefix, mode: 'insensitive' };
    }

    if (attributeId) {
        where.attributes = {
            some: { attributeId: parseInt(attributeId) }
        };
    }

    try {
        const positions = await prisma.position.findMany({
            where,
            include: {
                attributes: { include: { attribute: true } },
                accessRules: { include: { attribute: true } }
            }
        });
        res.json(positions);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching positions' });
    }

});

router.get('/latest', async (req, res) => {
  try {
    const positions = await prisma.position.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    res.json(positions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching latest positions' });
  }
});

router.get('/popular', async (req, res) => {
  try {
    const positions = await prisma.position.findMany({
      where: { isPublic: true },
      include: { _count: { select: { cvs: true } } },
      orderBy: { cvs: { _count: 'desc' } },
      take: 5
    });
    res.json(positions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching popular positions' });
  }
});

router.get('/tags', async (req, res) => {
  try {
    const positions = await prisma.position.findMany({
      where: { isPublic: true },
      select: { projectTags: true }
    });

    const counts = {};
    positions.forEach(p => {
      p.projectTags.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });

    res.json(counts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching tags' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const position = await prisma.position.findUnique({
            where: { id },
            include: {
                attributes: { include: { attribute: true } },
                accessRules: { include: { attribute: true } }
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
    const { title, shortDescription, isPublic, maxProjects,projectTags, attributeIds, accessRules } = req.body;
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
                    },
                accessRules: {
                    create: accessRules.map(rule => ({
                        attributeId: rule.attributeId,
                        operator: rule.operator,
                        value: rule.value
                    }))
                }
            },
            include: {
                attributes: { include: { attribute: true } },
                accessRules: { include: { attribute: true } }
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
    const { title, shortDescription, isPublic, maxProjects, projectTags, attributeIds, accessRules } = req.body;
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
                },
                accessRules: {
                    deleteMany: { positionId: id },
                    createMany: { data: accessRules.map(rule => ({
                        attributeId: rule.attributeId,
                        operator: rule.operator,
                        value: rule.value
                    })) }
                }
            },
            include: {
                attributes: { include: { attribute: true } },
                accessRules: { include: { attribute: true } }
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
