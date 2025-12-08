const fs = require('fs');
const path = require('path');

const filesToUpdate = [
    'src/pages/Dashboard.tsx',
    'src/pages/RecruiterDashboard.tsx',
    'src/pages/JobList.tsx',
    'src/pages/JobDetail.tsx',
    'src/pages/ResumeUpload.tsx',
    'src/pages/ResumeList.tsx',
    'src/pages/BulkUpload.tsx',
    'src/pages/MatchReview.tsx',
    'src/pages/MatchingConfig.tsx',
    'src/pages/InterviewBot.tsx',
    'src/pages/InterviewResults.tsx',
    'src/components/NotificationPanel.tsx'
];

const frontendDir = 'c:/work/proctor/frontend';

filesToUpdate.forEach(file => {
    const filePath = path.join(frontendDir, file);

    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;

        // Replace all instances of http://localhost:5000/api with /api
        content = content.replace(/http:\/\/localhost:5000\/api/g, '/api');

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

console.log('\n✨ All files processed!');
