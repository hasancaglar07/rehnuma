
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    const backupDir = path.join(process.cwd(), 'backup', new Date().toISOString().replace(/[:.]/g, '-'));

    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    console.log(`Starting backup to ${backupDir}...`);

    try {
        const models = [
            'user',
            'subscription',
            'category',
            'article',
            'savedArticle',
            'readingProgress',
            'issue',
            'issueArticle',
            'authorProfile',
            'homepageContent',
            'session',
            'auditLog'
        ];

        for (const model of models) {
            console.log(`Backing up ${model}...`);
            // @ts-ignore - Dynamic model access
            const data = await prisma[model].findMany();
            fs.writeFileSync(
                path.join(backupDir, `${model}.json`),
                JSON.stringify(data, null, 2)
            );
            console.log(`  - ${data.length} records saved.`);
        }

        console.log('Backup completed successfully!');
    } catch (error) {
        console.error('Backup failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
