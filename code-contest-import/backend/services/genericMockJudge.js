// Generic Mock Judge for stdin/stdout problems
// Handles any problem without custom wrappers

class GenericMockJudge {
    constructor() {
        this.submissions = new Map();
    }

    async submitCode(code, language, input, expectedOutput) {
        const token = `generic_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        this.submissions.set(token, {
            code,
            language,
            input,
            expectedOutput,
            timestamp: Date.now()
        });

        return { token };
    }

    async getSubmissionResult(token) {
        const submission = this.submissions.get(token);
        if (!submission) {
            return {
                status: { id: 11, description: 'Internal Error' },
                time: '0.000',
                memory: 0,
                stdout: null,
                stderr: 'Submission not found',
                token
            };
        }

        try {
            // Check if code has basic structure
            const hasInputHandling = submission.code.includes('input') ||
                submission.code.includes('Scanner') ||
                submission.code.includes('cin') ||
                submission.code.includes('readline');
            const hasOutputHandling = submission.code.includes('print') ||
                submission.code.includes('println') ||
                submission.code.includes('cout') ||
                submission.code.includes('console.log');

            // For Python, we don't require main function (scripts can run directly)
            // For Java/C++/JS, we check for main function
            const isPython = submission.language === 'python';
            const hasMainFunction = isPython ||
                submission.code.includes('main') ||
                submission.code.includes('__main__');

            // If code has proper structure, assume it's correct and return expected output
            if (hasInputHandling && hasOutputHandling && hasMainFunction) {
                return {
                    status: { id: 3, description: 'Accepted' },
                    time: this.getRandomTime(submission.language),
                    memory: this.getRandomMemory(submission.language),
                    stdout: submission.expectedOutput,
                    stderr: null,
                    compile_output: null,
                    token
                };
            } else {
                // Code doesn't have proper structure
                return {
                    status: { id: 6, description: 'Runtime Error (NZEC)' },
                    time: '0.000',
                    memory: 0,
                    stdout: null,
                    stderr: 'Code must have main function with input/output handling',
                    compile_output: null,
                    token
                };
            }
        } catch (error) {
            return {
                status: { id: 6, description: 'Runtime Error (NZEC)' },
                time: '0.000',
                memory: 0,
                stdout: null,
                stderr: error.message,
                token
            };
        }
    }

    getRandomTime(language) {
        const times = {
            python: (Math.random() * 0.05 + 0.08).toFixed(3),
            java: (Math.random() * 0.05 + 0.15).toFixed(3),
            javascript: (Math.random() * 0.03 + 0.04).toFixed(3),
            cpp: (Math.random() * 0.01 + 0.02).toFixed(3)
        };
        return times[language] || '0.050';
    }

    getRandomMemory(language) {
        const memory = {
            python: Math.floor(Math.random() * 5000 + 50000),
            java: Math.floor(Math.random() * 5000 + 63000),
            javascript: Math.floor(Math.random() * 5000 + 43000),
            cpp: Math.floor(Math.random() * 3000 + 36000)
        };
        return memory[language] || 45000;
    }
}

module.exports = GenericMockJudge;
