import { db } from './src/db';
import { users } from './src/db/schema';

async function findAuthor() {
    const user = await db.query.users.findFirst();
    if (user) {
        console.log('AUTHOR_ID:', user.id);
    } else {
        console.log('NO_USER_FOUND');
    }
    process.exit(0);
}

findAuthor();
