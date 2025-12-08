const fs = require('fs');
const path = require('path');

const cssFiles = [
    'src/styles/ResumeUpload.css',
    'src/styles/BulkUpload.css',
    'src/styles/InterviewBot.css'
];

const frontendDir = 'c:/work/proctor/frontend';

cssFiles.forEach(file => {
    const filePath = path.join(frontendDir, file);

    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;

        // Replace color: white; with color: #2563eb; in submit-btn sections
        // This regex finds .submit-btn { ... color: white; ... } and replaces the color
        content = content.replace(
            /(\.submit-btn\s*{[^}]*color:\s*)white(\s*;[^}]*})/g,
            '$1#2563eb$2'
        );

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Updated: ${file}`);
        } else {
            console.log(`⏭️  Skipped (no changes): ${file}`);
        }
    } catch (error) {
        console.log(`❌ Error updating ${file}:`, error.message);
    }
});

console.log('\n✨ All CSS files processed!');
