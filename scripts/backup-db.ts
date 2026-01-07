
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
            'corporateContent',
            'session',
            'auditLog',
            'payment',
            'paymentConsent'
        ];

        for (const model of models) {
            try {
                console.log(`Backing up ${model}...`);
                // @ts-ignore - Dynamic model access
                const data = await prisma[model].findMany();
                fs.writeFileSync(
                    path.join(backupDir, `${model}.json`),
                    JSON.stringify(data, null, 2)
                );
                console.log(`  - ${data.length} records saved.`);
            } catch (error: any) {
                if (error.code === 'P2021') {
                    console.warn(`  - Table for ${model} does not exist in database. Skipping.`);
                } else {
                    console.error(`  - Failed to backup ${model}:`, error.message);
                }
            }
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
