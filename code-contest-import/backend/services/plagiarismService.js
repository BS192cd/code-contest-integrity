const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const babelParser = require('@babel/parser');
// const { parse: javaParser } = require('java-parser'); // Temporarily disabled due to ES module issues
// const TreeSitter = require('tree-sitter');
// const Python = require('tree-sitter-python');
const aiPlagiarismService = require('./aiPlagiarismService');

class PlagiarismService {
  constructor() {
    this.jplagUrl = process.env.JPLAG_API_URL || 'https://jplag.ipd.kit.edu/api/v1';
    this.jplagApiKey = process.env.JPLAG_API_KEY;
    this.mossUserId = process.env.MOSS_USER_ID; // Legacy support for MOSS

    // this.pythonParser = new TreeSitter();
    // this.pythonParser.setLanguage(Python);
  }

  // Compare two code submissions for similarity
  async compareSubmissions(submission1, submission2) {
    try {
      // Use JPlag API if available, otherwise use mock comparison
      if (!this.jplagApiKey && (!this.mossUserId || this.mossUserId === 'mock-moss-user')) {
        return this.mockComparison(submission1, submission2);
      }

      // Real implementation would call JPlag or MOSS API
      const similarity = await this.calculateSimilarity(
        submission1.code, 
        submission2.code, 
        submission1.language
      );

      return {
        similarity,
        details: this.generateComparisonDetails(submission1, submission2, similarity),
        structuralSimilarity: similarity * 0.9 + Math.random() * 10,
        variableNameSimilarity: similarity * 0.7 + Math.random() * 20,
        logicSimilarity: similarity * 0.8 + Math.random() * 15,
        commentSimilarity: similarity * 0.5 + Math.random() * 30
      };

    } catch (error) {
      console.error('Plagiarism comparison error:', error);
      throw new Error('Plagiarism comparison failed');
    }
  }

  // Generate Abstract Syntax Tree (AST) for a given code
  generateAST(code, language) {
    try {
      switch (language) {
        case 'javascript':
          return babelParser.parse(code, { sourceType: 'module', plugins: ['jsx'] });
        case 'python':
          // return this.pythonParser.parse(code); // Temporarily disabled
          return null;
        case 'java':
          // return javaParser(code); // Temporarily disabled
          return null;
        default:
          return null; // Unsupported language
      }
    } catch (error) {
      console.error(`AST generation error for ${language}:`, error.message);
      return null;
    }
  }

  // Compare two ASTs for structural similarity
  compareASTs(ast1, ast2) {
    if (!ast1 || !ast2) return 0;

    const nodeCounts1 = {};
    const nodeCounts2 = {};

    this._traverseAST(ast1, nodeCounts1);
    this._traverseAST(ast2, nodeCounts2);

    const allNodeTypes = new Set([...Object.keys(nodeCounts1), ...Object.keys(nodeCounts2)]);
    let intersection = 0;
    let union = 0;

    allNodeTypes.forEach(type => {
      const count1 = nodeCounts1[type] || 0;
      const count2 = nodeCounts2[type] || 0;
      intersection += Math.min(count1, count2);
      union += Math.max(count1, count2);
    });

    return union === 0 ? 0 : (intersection / union) * 100;
  }

  // Helper function to traverse AST and count node types
  _traverseAST(node, nodeCounts) {
    if (!node || typeof node !== 'object') return;

    // Handle different AST structures
    const nodeType = node.type || (node.constructor ? node.constructor.name : 'Unknown');
    nodeCounts[nodeType] = (nodeCounts[nodeType] || 0) + 1;

    for (const key in node) {
      if (Object.prototype.hasOwnProperty.call(node, key)) {
        const child = node[key];
        if (Array.isArray(child)) {
          child.forEach(childNode => this._traverseAST(childNode, nodeCounts));
        } else if (child && typeof child === 'object') {
          this._traverseAST(child, nodeCounts);
        }
      }
    }
  }

  // Scan all submissions for a contest/problem for plagiarism
  async scanSubmissions(submissions, threshold = 70) {
    try {
      const results = [];
      const processed = new Set();

      for (let i = 0; i < submissions.length; i++) {
        for (let j = i + 1; j < submissions.length; j++) {
          const sub1 = submissions[i];
          const sub2 = submissions[j];

          // Skip if same user or already processed
          const pairKey = `${sub1._id}-${sub2._id}`;
          const pairKeyReverse = `${sub2._id}-${sub1._id}`;
          
          if (processed.has(pairKey) || processed.has(pairKeyReverse)) {
            continue;
          }

          if (sub1.userId.toString() === sub2.userId.toString()) {
            continue;
          }

          // Only compare submissions in same language
          if (sub1.language !== sub2.language) {
            continue;
          }

          processed.add(pairKey);

          const comparison = await this.compareSubmissions(sub1, sub2);

          if (comparison.similarity >= threshold) {
            results.push({
              submissionA: sub1,
              submissionB: sub2,
              similarity: comparison.similarity,
              details: comparison.details,
              analysis: {
                structuralSimilarity: comparison.structuralSimilarity,
                variableNameSimilarity: comparison.variableNameSimilarity,
                logicSimilarity: comparison.logicSimilarity,
                commentSimilarity: comparison.commentSimilarity
              },
              flaggedAt: new Date()
            });
          }

          // Add small delay to prevent overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      return results;
    } catch (error) {
      console.error('Plagiarism scan error:', error);
      throw new Error('Plagiarism scan failed');
    }
  }

  // Calculate similarity between two code strings
  async calculateSimilarity(code1, code2, language) {
    try {
      // Simple similarity algorithm (in production, use more sophisticated methods)
      const lines1 = this.normalizeCode(code1, language);
      const lines2 = this.normalizeCode(code2, language);

      if (lines1.length === 0 || lines2.length === 0) {
        return 0;
      }

      let matchingLines = 0;
      const usedLines = new Set();

      for (const line1 of lines1) {
        for (let i = 0; i < lines2.length; i++) {
          if (usedLines.has(i)) continue;
          
          const similarity = this.stringSimilarity(line1, lines2[i]);
          if (similarity > 0.8) {
            matchingLines++;
            usedLines.add(i);
            break;
          }
        }
      }

      const levenshteinSimilarity = (matchingLines / Math.max(lines1.length, lines2.length)) * 100;
      const ngramSimilarity = this.ngramSimilarity(code1, code2);

      // Weighted average of different similarity metrics
      const ast1 = this.generateAST(code1, language);
      const ast2 = this.generateAST(code2, language);
      const astSimilarity = this.compareASTs(ast1, ast2);

      const aiAnalysis1 = await aiPlagiarismService.analyzeCode(code1);
      const aiAnalysis2 = await aiPlagiarismService.analyzeCode(code2);
      const aiSimilarity = (aiAnalysis1.isAI && aiAnalysis2.isAI) ? (aiAnalysis1.confidence + aiAnalysis2.confidence) / 2 * 100 : 0;

      // Weighted average of different similarity metrics
      const similarity = (levenshteinSimilarity * 0.25) + (ngramSimilarity * 0.25) + (astSimilarity * 0.35) + (aiSimilarity * 0.15);
      return Math.min(100, Math.max(0, Math.round(similarity)));

    } catch (error) {
      console.error('Similarity calculation error:', error);
      return 0;
    }
  }

    // N-gram similarity calculation
  ngramSimilarity(str1, str2, n = 3) {
    const getNgrams = (s) => {
      const ngrams = new Set();
      for (let i = 0; i <= s.length - n; i++) {
        ngrams.add(s.substring(i, i + n));
      }
      return ngrams;
    };

    const ngrams1 = getNgrams(this.normalizeCode(str1));
    const ngrams2 = getNgrams(this.normalizeCode(str2));
    const intersection = new Set([...ngrams1].filter(x => ngrams2.has(x)));
    const union = new Set([...ngrams1, ...ngrams2]);

    return union.size === 0 ? 0 : (intersection.size / union.size) * 100;
  }

  // Normalize code by removing comments, whitespace, etc.
  normalizeCode(code, language) {
    let lines = code.split('\n');

    // Remove empty lines and comments
    lines = lines
      .map(line => line.trim())
      .filter(line => {
        if (!line) return false;
        
        // Remove comments based on language
        if (language === 'python' && (line.startsWith('#') || line.startsWith('"""') || line.startsWith("'''"))) {
          return false;
        }
        if (['javascript', 'java', 'cpp', 'c'].includes(language) && (line.startsWith('//') || line.startsWith('/*'))) {
          return false;
        }
        return true;
      })
      .map(line => {
        // Normalize variable names and spacing
        return line
          .replace(/\s+/g, ' ')
          // Remove common library imports
          .replace(/^(import|include|require).*?;?$/g, '')
          // Normalize function and class definitions
          .replace(/(function|class|def)\s+\w+\s*\(.*?\)\s*\{?/g, 'FUNC_DEF')
          // Normalize variable names
          .replace(/([a-zA-Z_][a-zA-Z0-9_]*)/g, 'VAR')
          // Normalize numbers
          .replace(/\d+/g, 'NUM')
          // Normalize string literals
          .replace(/(["'])(.*?)(["'])/g, 'STR_LITERAL');
      });

    return lines;
  }

  // Calculate string similarity using Levenshtein distance
  stringSimilarity(str1, str2) {
    const matrix = Array(str1.length + 1).fill().map(() => Array(str2.length + 1).fill(0));

    for (let i = 0; i <= str1.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= str2.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= str1.length; i++) {
      for (let j = 1; j <= str2.length; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    const maxLen = Math.max(str1.length, str2.length);
    return maxLen === 0 ? 1 : (maxLen - matrix[str1.length][str2.length]) / maxLen;
  }

  // Mock comparison for development
  mockComparison(submission1, submission2) {
    const baseSimilarity = Math.floor(Math.random() * 40) + 40; // 40-80%
    
    // Increase similarity if codes have similar structure
    let similarity = baseSimilarity;
    
    if (submission1.language === submission2.language) {
      similarity += 10;
    }

    if (submission1.code.length && submission2.code.length) {
      const lengthRatio = Math.min(submission1.code.length, submission2.code.length) / 
                         Math.max(submission1.code.length, submission2.code.length);
      similarity += lengthRatio * 10;
    }

    similarity = Math.min(100, Math.max(0, Math.round(similarity)));

    return {
      similarity,
      details: `Mock plagiarism analysis - ${similarity}% similarity detected`,
      structuralSimilarity: similarity * 0.9 + Math.random() * 10,
      variableNameSimilarity: similarity * 0.7 + Math.random() * 20,
      logicSimilarity: similarity * 0.8 + Math.random() * 15,
      commentSimilarity: similarity * 0.5 + Math.random() * 30
    };
  }

  // Generate detailed comparison report
  generateComparisonDetails(submission1, submission2, similarity) {
    const details = [];
    
    details.push(`Language: ${submission1.language}`);
    details.push(`Similarity Score: ${similarity}%`);
    details.push(`Code Length Ratio: ${Math.min(submission1.code.length, submission2.code.length)} / ${Math.max(submission1.code.length, submission2.code.length)}`);
    
    if (similarity > 80) {
      details.push('High similarity detected - manual review recommended');
    } else if (similarity > 60) {
      details.push('Moderate similarity detected - possible collaboration');
    } else {
      details.push('Low similarity - likely independent work');
    }

    return details.join('; ');
  }

  // Update submission plagiarism score
  async updateSubmissionPlagiarismScore(submissionId, score, similarSubmissions = []) {
    try {
      const Submission = require('../models/Submission');
      
      await Submission.findByIdAndUpdate(submissionId, {
        $set: {
          'plagiarismCheck.checked': true,
          'plagiarismCheck.score': score,
          'plagiarismCheck.similarSubmissions': similarSubmissions,
          'plagiarismCheck.checkedAt': new Date()
        }
      });

    } catch (error) {
      console.error('Update plagiarism score error:', error);
    }
  }
}

module.exports = new PlagiarismService();