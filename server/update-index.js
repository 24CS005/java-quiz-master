const fs = require('fs');
const path = require('path');

// Read the Index.tsx file
const indexPath = path.join(__dirname, '..', 'src', 'pages', 'Index.tsx');
let content = fs.readFileSync(indexPath, 'utf8');

// Check if already updated
if (content.includes('sessionId={quizSessionId}') && content.includes('QuizGame')) {
    // Check if both occurrences exist
    const quizGameMatch = content.match(/`<QuizGame[\s\S]*?\/>`/);
    if (quizGameMatch && quizGameMatch[0].includes('sessionId={quizSessionId}')) {
        console.log('Index.tsx already has sessionId parameter in QuizGame');
    // Need to add it
    } else {
        // Find and update QuizGame component
        content = content.replace(
            /(<QuizGame[\s]*questions={questions}[\s]*username={username}[\s]*onComplete={handleQuizComplete}[\s]*\/>)/,
            '<QuizGame\n            questions={questions}\n            username={username}\n            sessionId={quizSessionId}\n            onComplete={handleQuizComplete}\n          />'
        );
        fs.writeFileSync(indexPath, content);
        console.log('Index.tsx updated with sessionId in QuizGame');
    }
} else {
    // Update QuizGame component - try simpler match
    content = content.replace(
        /(<QuizGame[\s\S]*?onComplete={handleQuizComplete}\s*\/)/,
        function(match) {
            if (match.includes('sessionId')) {
                return match;
            }
            return match.replace(
                'onComplete={handleQuizComplete}',
                'sessionId={quizSessionId}\n            onComplete={handleQuizComplete}'
            );
        }
    );

    // Update QuizResult component
    content = content.replace(
        /(<QuizResult[\s\S]*?details={quizDetails}\s*\/)/,
        function(match) {
            if (match.includes('sessionId')) {
                return match;
            }
            return match.replace(
                'details={quizDetails}',
                'sessionId={quizSessionId}\n              details={quizDetails}'
            );
        }
    );

    fs.writeFileSync(indexPath, content);
    console.log('Index.tsx updated with sessionId parameters');
}
