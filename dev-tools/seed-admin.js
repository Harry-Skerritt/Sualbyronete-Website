// seed-admin.js
import { createClient } from '@libsql/client';
import crypto from 'crypto';
import readline from 'readline/promises';
import { fileURLToPath } from 'url';
import path from 'path';


function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
}

async function main() {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const client = createClient({
        url: `file:${path.resolve(__dirname, '../local.db')}`,
    });

    const rl = new readline.Interface({
        input: process.stdin,
        output: process.stdout
    });

    console.log(`\x1b[36m========== Sualbyronete Admin Provisioner Tool ==========\x1b[0m\n`);

    let addingUsers = true;

    while (addingUsers) {
        try {
            const name = await rl.question('Enter Admin Full Name: ');
            if (!name.trim()) {
                console.log('\x1b[33mName cannot be blank.\x1b[0m\n');
                continue;
            }

            const username = await rl.question('Enter Username: ');
            const email = await rl.question('Enter Email Address: ');

            // 👇 Clean and simple plain text collection
            const rawPassword = await rl.question('Enter Password: ');

            if (!rawPassword.trim()) {
                console.log('\x1b[33mPassword cannot be empty. User skipped.\x1b[0m\n');
                continue;
            }

            console.log(`Syncing database records for ${name}...`);

            const userId = crypto.randomUUID();
            const passwordHash = hashPassword(rawPassword);

            await client.execute({
                sql: `INSERT INTO admin_users (id, name, username, email, password_hash, role, is_active)
                      VALUES (?, ?, ?, ?, ?, 'admin', 1)`,
                args: [userId, name.trim(), username.trim().toLowerCase(), email.trim().toLowerCase(), passwordHash]
            });

            console.log(`\x1b[32m✔ Success! User "${name}" successfully written to local.db!\x1b[0m\n`);

        } catch (error) {
            console.log();
            if (error.message.includes('UNIQUE constraint failed')) {
                console.error(`\x1b[31mError: That username or email address already exists.\x1b[0m\n`);
            } else {
                console.error("Database Insertion Failed:", error, "\n");
            }
        }

        const answer = await rl.question('Would you like to add another user? (y/N): ');
        if (answer.trim().toLowerCase() !== 'y') {
            addingUsers = false;
        }
        console.log();
    }

    console.log(`\x1b[35mConfiguration closed. Terminal session ended safely.\x1b[0m`);
    rl.close();
}

main();