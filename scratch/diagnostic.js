const fs = require('fs');

const logPath = 'C:\\Users\\PKLHRD3\\.gemini\\antigravity\\brain\\c71c7176-fd81-4ac6-9dbf-b58095298b1d\\.system_generated\\logs\\overview.txt';

try {
    const content = fs.readFileSync(logPath, 'utf8');
    console.log('Total content length:', content.length);
    const lines = content.split('\n');
    console.log('Total lines:', lines.length);
    
    lines.forEach((line, index) => {
        if (line.includes('Tanzeem-e-Islami FAQs') || line.includes('Frequently Asked Questions')) {
            console.log(`Line ${index + 1}: length = ${line.length}`);
            console.log('Line snippet:', line.substring(0, 200));
        }
    });
} catch (error) {
    console.error('Error:', error);
}
