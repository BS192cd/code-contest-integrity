#!/usr/bin/env node

const { seedDatabase } = require('../seeders/seedDatabase');

console.log('🚀 Starting CodeContest Pro Database Seeding...\n');

// Run the seeding process
seedDatabase()
  .then(() => {
    console.log('\n✅ Seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  });