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

    const builtInAttrs = [
    { name: 'First Name', description: 'Given name', type: 'STRING' },
    { name: 'Last Name', description: 'Family name', type: 'STRING' },
    { name: 'Location', description: 'City/country', type: 'STRING' },
    { name: 'Personal Photo', description: 'Profile picture', type: 'IMAGE' }
    ];
    const personalInfoCategory = await prisma.category.findUnique({ where: { name: 'Personal Information' } });

    for (const attr of builtInAttrs) {
    await prisma.attribute.upsert({
        where: { name: attr.name },
        update: {},
        create: { ...attr, categoryId: personalInfoCategory.id, isBuiltIn: true }
    });
    }

    console.log('Seeding complete');
}

main()
    .catch((error) => console.error(error))
    .finally(async () => {
        await prisma.$disconnect();
    });