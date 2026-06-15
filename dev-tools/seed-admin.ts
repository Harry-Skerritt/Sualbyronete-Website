// dev-tools/seed-admin.ts
import { createClient } from '@libsql/client';
import crypto from 'crypto';
import readline from 'readline/promises';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


function hashPassword(password: string) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
}

async function main() {
    const currentFilePath: string = fileURLToPath(import.meta.url);
    const customDirname: string = path.dirname(currentFilePath);

    const seedFilePath = path.resolve(customDirname, './temp-admin-seed.sql');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })

    console.log(`\x1b[36m========== Sualbyronete Admin Provisioner Tool ==========\x1b[0m\n`);

    let sqlStatements = '';
    let addingUsers = true;

    while (addingUsers) {
        const name = await rl.question('Enter Admin Full Name: ');
        if (!name.trim()) {
            console.log('\x1b[33mName cannot be blank.\x1b[0m\n');
            continue;
        }

        const username = await rl.question('Enter Username: ');
        const email = await rl.question('Enter Email Address: ');
        const rawPassword = await rl.question('Enter Password: ');


        if (!rawPassword.trim()) {
            console.log('\x1b[33mPassword cannot be empty. User skipped.\x1b[0m\n');
            continue;
        }


        const userId = crypto.randomUUID();
        const passwordHash = hashPassword(rawPassword);

        const safeName = name.trim().replace(/'/g, "''");
        const safeUsername = username.trim().toLowerCase().replace(/'/g, "''");
        const safeEmail = email.trim().toLowerCase().replace(/'/g, "''");

        sqlStatements += `INSERT INTO admin_users (id, name, username, email, password_hash, role, is_active) VALUES ('${userId}', '${safeName}', '${safeUsername}', '${safeEmail}', '${passwordHash}', 'admin', 1);\n`;

        console.log(`\x1b[32m✔ User queued for generation!\x1b[0m\n`);

        const answer = await rl.question('Would you like to add another user? (y/N): ');
        if (answer.trim().toLowerCase() !== 'y') {
            addingUsers = false;
        }
        console.log();
    }

    if (sqlStatements) {
        fs.writeFileSync(seedFilePath, sqlStatements);
        console.log(`\x1b[35m✔ Temporary SQL generation complete.\x1b[0m`);
    }

    rl.close();
}

main();