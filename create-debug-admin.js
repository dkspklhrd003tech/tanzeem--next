
const { db } = require('./src/lib/db');
const { users } = require('./src/db/schema');
const { hashPassword } = require('./src/lib/auth');
const crypto = require('crypto');

async function createDebugAdmin() {
    const email = "debug@tanzeem.org";
    const password = "debug123";
    const hashedPassword = await hashPassword(password);
    
    try {
        await db.insert(users).values({
            id: crypto.randomUUID(),
            email: email,
            name: "Debug Admin",
            password: hashedPassword,
            role: "admin",
            isActive: true,
        });
        console.log("Debug Admin created: " + email + " / " + password);
    } catch (error) {
        console.error("Error creating debug admin:", error);
    } finally {
        process.exit(0);
    }
}

createDebugAdmin();
