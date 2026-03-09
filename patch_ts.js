const fs = require('fs');
const path = require('path');

function patchFile(relPath, patchFn) {
    const fullPath = path.join(__dirname, relPath);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        content = patchFn(content);
        fs.writeFileSync(fullPath, content);
    }
}

// Fix Next 15 promises in API dynamic routes
const dynamicRoutes = [
    'src/app/api/books/[id]/route.ts',
    'src/app/api/magazines/[id]/route.ts',
    'src/app/api/menus/[id]/route.ts',
    'src/app/api/sliders/[id]/route.ts',
    'src/app/api/users/[id]/route.ts'
];
for (const p of dynamicRoutes) {
    patchFile(p, (content) => {
        let c = content.replace(/\{ params \}: \{ params: \{ id: string;? \} \}/g, '{ params }: { params: Promise<{ id: string }> }')
            .replace(/\{ params \}: \{ params: \{ id: string \} \}/g, '{ params }: { params: Promise<{ id: string }> }');

        // Also fix `const { id } = params;`  => `const { id } = await params;` if the user destructured it without await.
        // I'll just blindly replace it if it's there.
        c = c.replace(/const \{\s*id\s*\} = params;/g, 'const { id } = await params;');
        c = c.replace(/const id = params\.id;/g, 'const { id } = await params;');

        return c;
    });
}

// Fix users route.ts getCurrentUser missing req param
patchFile('src/app/api/users/[id]/route.ts', (c) => c.replace(/getCurrentUser\(\)/g, 'getCurrentUser(req)'));
patchFile('src/app/api/users/route.ts', (c) => c.replace(/getCurrentUser\(\)/g, 'getCurrentUser(req)'));

// Fix conditions: any[] = [] for Drizzle ORM where filters
const listRoutes = [
    'src/app/api/audio/route.ts',
    'src/app/api/books/route.ts',
    'src/app/api/contact/route.ts',
    'src/app/api/events/route.ts',
    'src/app/api/pages/route.ts',
    'src/app/api/videos/route.ts'
];
for (const p of listRoutes) {
    patchFile(p, (c) => {
        let n = c.replace(/const conditions = \[\];/g, 'const conditions: any[] = [];');
        // also `request` instead of `req` in some getCurrentUser 
        n = n.replace(/getCurrentUser\(\)/g, 'getCurrentUser(req)');
        return n;
    });
}

// Fix settings route.ts
patchFile('src/app/api/settings/route.ts', (c) => c.replace(/const newSettings = \[\];/g, 'const newSettings: any[] = [];'));

// Fix schema.ts mode
// MySQL text doesn't support { mode: "long" } in Drizzle.
patchFile('src/db/schema.ts', (c) => c.replace(/text\("([^"]+)",\s*\{\s*mode:\s*"long"\s*\}\)/g, 'text("$1")'));

// Fix HomepageManager
patchFile('src/components/admin/HomepageManager.tsx', (c) => c.replace(/hideHeader=\{true\}/g, ''));

console.log("Patching complete.");
