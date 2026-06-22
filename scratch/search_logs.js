const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\PKLHRD3\\.gemini\\antigravity\\brain';

function searchDir(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (item === '.system_generated') {
                const logPath = path.join(fullPath, 'logs', 'overview.txt');
                if (fs.existsSync(logPath)) {
                    const text = fs.readFileSync(logPath, 'utf8');
                    if (text.includes('Tanzeem-e-Islami FAQs') || text.includes('Can you describe Tanzeem-e-Islami')) {
                        console.log('FOUND MATCH IN LOG:', logPath);
                        // Let's find lines with the content
                        const lines = text.split('\n');
                        lines.forEach((line, idx) => {
                            if (line.includes('Tanzeem-e-Islami FAQs') || line.includes('Can you describe Tanzeem-e-Islami')) {
                                try {
                                    const parsed = JSON.parse(line);
                                    console.log(`Line ${idx + 1} Length:`, parsed.content.length);
                                    if (parsed.content.length > 5000) {
                                        // Save it!
                                        const outPath = 'e:\\WordPress Plugins\\DKS Projects\\Tanzeem.org\\tanzeem--next\\scratch\\found_faq.html';
                                        fs.writeFileSync(outPath, parsed.content, 'utf8');
                                        console.log('SUCCESSFULLY WRITTEN UNTRUNCATED TO:', outPath);
                                    }
                                } catch (e) {
                                    console.log('Match line error parsing JSON:', e.message);
                                }
                            }
                        });
                    }
                }
            } else {
                searchDir(fullPath);
            }
        }
    }
}

try {
    searchDir(brainDir);
} catch (e) {
    console.error('Error:', e);
}
