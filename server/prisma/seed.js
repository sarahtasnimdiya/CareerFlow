const prisma = require('../lib/db');
const bcrypt = require('bcryptjs');

async function main() {

    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = [
        {
            username: 'Candidate User',
            email: 'candidate@test.com',
            password: hashedPassword,
            role: 'CANDIDATE'
        },
        {
            username: 'Recruiter User',
            email: 'recruiter@test.com',
            password: hashedPassword,
            role: 'RECRUITER'
        },
        {
            username: 'Admin User',
            email: 'admin@test.com',
            password: hashedPassword,
            role: 'ADMIN'
        }
    ];

    for (const user of users) {
        await prisma.user.upsert({
            where: { email: user.email },
            update: {},
            create: user
        });
    }
    
    
    const categoryNames = [
    'Certification',
    'Domain Knowledge',
    'Personal Information',
    'Technical Skills',
    'Soft Skills',
    'Languages'
    ];

    for (const name of categoryNames) {
    await prisma.category.upsert({
        where: { name },
        update: {},
        create: { name }
    });
    }

    console.log('Seeding complete');
}

main()
    .catch((error) => console.error(error))
    .finally(async () => {
        await prisma.$disconnect();
    });