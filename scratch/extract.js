const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\PKLHRD3\\.gemini\\antigravity\\brain\\c71c7176-fd81-4ac6-9dbf-b58095298b1d\\.system_generated\\logs\\overview.txt';
const outputPath = 'e:\\WordPress Plugins\\DKS Projects\\Tanzeem.org\\tanzeem--next\\scratch\\faq.html';

try {
    const content = fs.readFileSync(logPath, 'utf8');
    const lines = content.split('\n');
    let htmlContent = null;
    
    for (const line of lines) {
        if (!line.trim()) continue;
        try {
            const obj = JSON.parse(line);
            if (obj.step_index === 2440 || (obj.content && obj.content.includes('Tanzeem-e-Islami FAQs'))) {
                htmlContent = obj.content;
                break;
            }
        } catch (e) {
            // Ignore parse errors
        }
    }
    
    if (htmlContent) {
        // The user request starts with `<USER_REQUEST>\n` or similar, let's clean it if needed
        const cleanHtml = htmlContent.replace(/<USER_REQUEST>\n?/, '').replace(/\n?<\/USER_REQUEST>/, '');
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, cleanHtml, 'utf8');
        console.log('SUCCESS: Extracted FAQ HTML successfully to ' + outputPath);
    } else {
        console.log('FAILURE: Could not find step 2440 or matching content.');
    }
} catch (error) {
    console.error('Error during extraction:', error);
}
