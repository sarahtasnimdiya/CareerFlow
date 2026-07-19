const express = require('express');
const prisma = require('../lib/db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [totalPositions, totalCandidates, totalRecruiters, totalCVs, recentCVs] = await Promise.all([
      prisma.position.count(),
      prisma.user.count({ where: { role: 'CANDIDATE' } }),
      prisma.user.count({ where: { role: 'RECRUITER' } }),
      prisma.cV.count(),
      prisma.cV.count({ where: { createdAt: { gte: twentyFourHoursAgo } } })
    ]);

    res.json({ totalPositions, totalCandidates, totalRecruiters, totalCVs, recentCVs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

module.exports = router;