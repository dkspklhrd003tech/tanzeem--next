import { db } from "../src/lib/db";
import { users } from "../src/db/schema";
import { hashPassword } from "../src/lib/auth";
import { eq } from "drizzle-orm";

async function main() {
    const adminEmail = "admin@tanzeem.org";

    const existing = await db.query.users.findFirst({
        where: eq(users.email, adminEmail)
    });

    if (existing) {
        console.log("Admin user already exists");
        return;
    }

    const hashedPassword = await hashPassword("admin123");

    await db.insert(users).values({
        id: crypto.randomUUID(),
        email: adminEmail,
        name: "Admin",
        password: hashedPassword,
        role: "admin",
        isActive: true,
    });

    console.log("Admin seeded successfully.");
}

main().catch(console.error).then(() => process.exit(0));
