const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const mongoose = require('mongoose');
// Safe model imports to avoid OverwriteModelError if loaded multiple times
const Problem = require('../models/Problem');
const User = require('../models/User');
const Contest = require('../models/Contest');
const { allProblems } = require('./problemSeeder');
const {
  additionalArrayProblems,
  additionalLinkedListProblems,
  additionalTreeProblems,
  additionalGraphProblems,
  additionalDPProblems,
  additionalStackQueueProblems,
  additionalHashingProblems,
  additionalMiscProblems
} = require('./extendedProblems');

// Filter function to remove problems with titles shorter than 5 characters
function filterProblemsByTitleLength(problems) {
  return problems.filter(problem => {
    const titleLength = problem.title ? problem.title.length : 0;
    if (titleLength < 5) {
      console.log(`⚠️  Removing problem with short title: "${problem.title}" (${titleLength} characters)`);
      return false;
    }
    return true;
  });
}

// Combine all problems (200+ total) and filter out short titles
const allCombinedProblems = [
  ...filterProblemsByTitleLength(allProblems),
  ...filterProblemsByTitleLength(additionalArrayProblems),
  ...filterProblemsByTitleLength(additionalLinkedListProblems),
  ...filterProblemsByTitleLength(additionalTreeProblems),
  ...filterProblemsByTitleLength(additionalGraphProblems),
  ...filterProblemsByTitleLength(additionalDPProblems),
  ...filterProblemsByTitleLength(additionalStackQueueProblems),
  ...filterProblemsByTitleLength(additionalHashingProblems),
  ...filterProblemsByTitleLength(additionalMiscProblems)
];

async function createAdminUser() {
  try {
    // Check if admin user already exists
    let adminUser = await User.findOne({ email: 'admin@codecontest.com' });
    
    if (!adminUser) {
      adminUser = new User({
        username: 'admin',
        email: 'admin@codecontest.com',
        passwordHash: 'admin123',
        fullName: 'System Administrator',
        role: 'admin',
        isActive: true,
        statistics: {
          totalSubmissions: 0,
          acceptedSubmissions: 0,
          totalScore: 0,
          averageScore: 0,
          contestsParticipated: 0,
          problemsSolved: 0,
          streak: 0,
          badges: ['admin']
        }
      });
      
      await adminUser.save();
      console.log('✅ Created admin user');
    } else {
      console.log('✅ Admin user already exists');
    }
    
    return adminUser;
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
}

async function seedProblems(adminUserId) {
  try {
    console.log('🌱 Starting comprehensive problem seeding...');
    
    // Clear existing problems
    await Problem.deleteMany({});
    console.log('🗑️  Cleared existing problems');
    
    // Add metadata to all problems
    const problemsWithMetadata = allCombinedProblems.map((problem, index) => {
      const normalizedTestCases = (problem.testCases || []).map((tc, i) => {
        const input = (tc.input ?? '').toString().trim();
        let expectedOutput = (tc.expectedOutput ?? '').toString().trim();
        if (tc.expectedOutput == null) {
          console.log(`⚠️  [Seed] "${problem.title}" testCase #${i} missing expectedOutput → set to empty string`);
        }
        if (tc.input !== input || (tc.expectedOutput || '') !== expectedOutput) {
          console.log(`🧹 [Seed] Normalized whitespace for "${problem.title}" testCase #${i}`);
        }
        return { ...tc, input, expectedOutput };
      });

      return {
        ...problem,
        testCases: normalizedTestCases,
        createdBy: adminUserId,
        isPublic: true,
        isActive: true,
        statistics: {
          totalSubmissions: 0,
          acceptedSubmissions: 0,
          acceptanceRate: 0,
          averageScore: 0
        },
        hints: [
          {
            level: 1,
            content: `Think about the ${problem.tags[0]} approach for this problem.`
          },
          {
            level: 2,
            content: `Consider the time complexity requirements: ${problem.timeLimit}s time limit.`
          },
          {
            level: 3,
            content: `Look at the constraints: this will guide your algorithm choice.`
          }
        ],
        solutionTemplate: {
          python: `def solve():\n    # Your solution here\n    pass\n\n# Read input\n# Process\n# Output result`,
          javascript: `function solve() {\n    // Your solution here\n}\n\n// Read input\n// Process\n// Output result`,
          java: `public class Solution {\n    public static void main(String[] args) {\n        // Your solution here\n    }\n}`,
          cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your solution here\n    return 0;\n}`
        }
      };
    });
    
    // Insert problems in batches for better performance
    const batchSize = 50;
    let insertedCount = 0;
    
    for (let i = 0; i < problemsWithMetadata.length; i += batchSize) {
      const batch = problemsWithMetadata.slice(i, i + batchSize);
      const insertedBatch = await Problem.insertMany(batch);
      insertedCount += insertedBatch.length;
      console.log(`📦 Inserted batch ${Math.floor(i/batchSize) + 1}: ${insertedBatch.length} problems`);
    }
    
    console.log(`✅ Successfully seeded ${insertedCount} problems`);
    
    // Log detailed statistics
    const categoryStats = {};
    allCombinedProblems.forEach(problem => {
      const category = problem.category || 'Other';
      categoryStats[category] = (categoryStats[category] || 0) + 1;
    });
    
    const difficultyStats = {};
    allCombinedProblems.forEach(problem => {
      difficultyStats[problem.difficulty] = (difficultyStats[problem.difficulty] || 0) + 1;
    });
    
    console.log('\n📊 Problem Statistics:');
    console.log('By Category:');
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} problems`);
    });
    
    console.log('By Difficulty:');
    Object.entries(difficultyStats).forEach(([difficulty, count]) => {
      console.log(`   ${difficulty}: ${count} problems`);
    });
    
    return insertedCount;
  } catch (error) {
    console.error('❌ Error seeding problems:', error);
    throw error;
  }
}

async function createSampleContests(adminUserId, problemIds) {
  try {
    console.log('🏆 Creating sample contests...');
    
    // Clear existing contests
    await Contest.deleteMany({});
    
    // Create different types of contests
    const contests = [
      {
        title: "Beginner Programming Contest",
        description: "A contest designed for beginners to practice basic programming concepts including arrays, strings, and simple algorithms.",
        createdBy: adminUserId,
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        duration: 120,
        difficulty: "Easy",
        maxParticipants: 1000,
        isPublic: true,
        registrationRequired: true,
        problems: problemIds.slice(0, 5).map((id, index) => ({
          problem: id,
          points: 100,
          order: index
        })),
        rules: {
          allowedLanguages: ['python', 'javascript', 'java', 'cpp'],
          maxSubmissions: -1,
          penalty: { enabled: false, points: 0 },
          plagiarismDetection: { enabled: true, threshold: 70 }
        },
        tags: ['beginner', 'practice'],
        statistics: {
          totalParticipants: 0,
          totalSubmissions: 0,
          averageScore: 0,
          completionRate: 0
        }
      }
    ];
    
    const insertedContests = await Contest.insertMany(contests);
    console.log(`✅ Created ${insertedContests.length} sample contests`);
    
    return insertedContests;
  } catch (error) {
    console.error('❌ Error creating sample contests:', error);
    throw error;
  }
}

async function seedDatabase() {
  try {
    console.log('🚀 Starting comprehensive database seeding...');
    console.log('📡 Connecting to MongoDB...');
    
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/codecontest_dev';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    const adminUser = await createAdminUser();
    const problemCount = await seedProblems(adminUser._id);
    
    const problems = await Problem.find({}).select('_id');
    const problemIds = problems.map(p => p._id);
    
    const contests = await createSampleContests(adminUser._id, problemIds);
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   👤 Admin user: ${adminUser.email}`);
    console.log(`   📚 Problems: ${problemCount}`);
    console.log(`   🏆 Contests: ${contests.length}`);
    
    console.log('\n🔑 Admin Credentials:');
    console.log(`   Email: admin@codecontest.com`);
    console.log(`   Password: admin123`);
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('📡 Database connection closed');
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = {
  seedDatabase,
  createAdminUser,
  seedProblems,
  createSampleContests
};