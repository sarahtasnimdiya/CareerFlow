const express = require('express');
const prisma = require('../lib/db');
const authenticate = require('../middleware/authenticate');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

router.post('/', authenticate, requireRole(['CANDIDATE']), async (req, res) => {
    const { positionId } = req.body;
    const userId = req.user.userId;

    try {
        const cv = await prisma.cV.create({
            data: {
                userId,
                positionId
            }
        });
        res.status(201).json(cv);
    } catch (error) {
        console.error(error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'CV for this position already exists' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:id', authenticate, async (req, res) => {
    const cvId = parseInt(req.params.id);
    const requesterId = req.user.userId;
    const requesterRole = req.user.role;

    try {
        const cv = await prisma.cV.findFirst({
            where: { 
                id: cvId, 
                 OR: [
                    { userId: requesterId },
                    { isPublished: true }
                ]
            },
            include: {
                position: {
                    include: {
                        attributes: { include: { attribute: true } }
                    }
                },
                user: {
                    include: {
                        profileValues: {
                            include: {
                                attribute: true
                            }
                        }
                    }
                }
            }
        });

        if (!cv) {
            return res.status(404).json({ error: 'CV not found' });
        }

        const isOwner = cv.userId === requesterId;
        const isStaff = requesterRole === 'RECRUITER' || requesterRole === 'ADMIN';
        if (!isOwner && !isStaff) {
            return res.status(403).json({ error: 'Not authorized to view this CV' });
        }

        const projects = await prisma.project.findMany({
            where: { userId: cv.userId, tags: { hasSome: cv.position.projectTags } },
            take: cv.position.maxProjects,
            orderBy: { createdAt: 'desc' }
        });

        res.json({ 
            cvId: cv.id, 
            isPublished: cv.isPublished,
            position: cv.position, profileValues: cv.user.profileValues, 
            projects 
        });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });


router.put('/:id/publish', authenticate, async (req, res) => {
    const cvId = parseInt(req.params.id);
    const userId = req.user.userId;

    try {
        const cv = await prisma.cV.findFirst({
            where: { id: cvId, userId },
            include: {
                position: {
                    include: {
                        attributes: { include: { attribute: true } }
                    }
                },
                user: {
                    include: {
                        profileValues: { 
                            include: {
                                attribute: true
                            }
                        }
                    }
                }
            }
        });

        if (!cv) {
            return res.status(404).json({ error: 'CV not found' });
        }

        const positionAttributes = cv.position.attributes;
        const userProfileValues = cv.user.profileValues;

        const allAttributesFilled = positionAttributes.every(attr => {
            const matchingProfileValue = userProfileValues.find(pv => pv.attributeId === attr.attributeId);
            return matchingProfileValue && matchingProfileValue.value.trim() !== '';
        });

        if (!allAttributesFilled) {
            return res.status(400).json({ error: 'Not all required attributes have non-empty values' });
        }

        const updatedCv = await prisma.cV.update({
            where: { id: cvId },
            data: { isPublished: true }
        });

        res.json(updatedCv);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;