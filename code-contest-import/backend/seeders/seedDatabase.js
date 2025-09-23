require('dotenv').config();
const mongoose = require('mongoose');
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

// Combine all problems (200+ total)
const allCombinedProblems = [
  ...allProblems,
  ...additionalArrayProblems,
  ...additionalLinkedListProblems,
  ...additionalTreeProblems,
  ...additionalGraphProblems,
  ...additionalDPProblems,
  ...additionalStackQueueProblems,
  ...additionalHashingProblems,
  ...additionalMiscProblems
];

async function createAdminUser() {
  try {
    // Check if admin user already exists
    let adminUser = await User.findOne({ email: 'admin@codecontest.com' });
    
    if (!adminUser) {
      adminUser = new User({
        username: 'admin',
        email: 'admin@codecontest.com',
        passwordHash: 'admin123', // Will be hashed by pre-save middleware
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
    const problemsWithMetadata = allCombinedProblems.map((problem, index) => ({
      ...problem,
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
    }));
    
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
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours duration
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
      },
      {
        title: "Data Structures Challenge",
        description: "Advanced contest focusing on data structures including trees, graphs, and dynamic programming problems.",
        createdBy: adminUserId,
        startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours duration
        duration: 180,
        difficulty: "Hard",
        maxParticipants: 500,
        isPublic: true,
        registrationRequired: true,
        problems: problemIds.slice(10, 18).map((id, index) => ({
          problem: id,
          points: 150 + index * 25,
          order: index
        })),
        rules: {
          allowedLanguages: ['python', 'javascript', 'java', 'cpp'],
          maxSubmissions: 10,
          penalty: { enabled: true, points: 20 },
          plagiarismDetection: { enabled: true, threshold: 60 }
        },
        tags: ['advanced', 'data-structures'],
        statistics: {
          totalParticipants: 0,
          totalSubmissions: 0,
          averageScore: 0,
          completionRate: 0
        }
      },
      {
        title: "Algorithm Mastery Contest",
        description: "Expert-level contest with complex algorithmic problems requiring advanced problem-solving skills.",
        createdBy: adminUserId,
        startTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Two weeks from now
        endTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4 hours duration
        duration: 240,
        difficulty: "Expert",
        maxParticipants: 200,
        isPublic: true,
        registrationRequired: true,
        problems: problemIds.slice(20, 26).map((id, index) => ({
          problem: id,
          points: 200 + index * 50,
          order: index
        })),
        rules: {
          allowedLanguages: ['python', 'javascript', 'java', 'cpp'],
          maxSubmissions: 5,
          penalty: { enabled: true, points: 50 },
          plagiarismDetection: { enabled: true, threshold: 50 }
        },
        tags: ['expert', 'algorithms'],
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
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    // Create admin user
    const adminUser = await createAdminUser();
    
    // Seed problems
    const problemCount = await seedProblems(adminUser._id);
    
    // Get problem IDs for contest creation
    const problems = await Problem.find({}).select('_id');
    const problemIds = problems.map(p => p._id);
    
    // Create sample contests
    const contests = await createSampleContests(adminUser._id, problemIds);
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   👤 Admin user: ${adminUser.email}`);
    console.log(`   📚 Problems: ${problemCount}`);
    console.log(`   🏆 Contests: ${contests.length}`);
    console.log(`   🔗 Database: ${mongoose.connection.name}`);
    
    console.log('\n🔑 Admin Credentials:');
    console.log(`   Email: admin@codecontest.com`);
    console.log(`   Password: admin123`);
    
    console.log('\n📋 Next Steps:');
    console.log('   1. Start the backend server: npm start');
    console.log('   2. Start the frontend: npm run dev:local');
    console.log('   3. Login with admin credentials');
    console.log('   4. Create additional users and test the platform');
    
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