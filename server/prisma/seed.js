const prisma = require('../lib/db');
const bcrypt = require('bcryptjs');

async function main() {

    const hashedPassword = await bcrypt.hash('password123', 10);

    await prisma.user.upsert({
        where: { email: 'candidate@test.com' },
        update: {},
        create: {
            username: 'Candidate User',
            email: 'candidate@test.com',
            password: hashedPassword,
            role: 'CANDIDATE'
        }
    });

    await prisma.user.upsert({
        where: { email: 'recruiter@test.com' },
        update: {},
        create: {
            username: 'Recruiter User',
            email: 'recruiter@test.com',
            password: hashedPassword,
            role: 'RECRUITER'
        }
    });

    await prisma.user.upsert({
        where: { email: 'admin@test.com' },
        update: {},
        create: {
            username: 'Admin User',
            email: 'admin@test.com',
            password: hashedPassword,
            role: 'ADMIN'
        }
    });

    console.log('Seeding complete');
}

main()
    .catch((error) => console.error(error))
    .finally(async () => {
        await prisma.$disconnect();
    });