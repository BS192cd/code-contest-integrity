const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const db = mongoose.connection.db;
    const problem = await db.collection('problems').findOne({ title: /38.*Count/i });
    
    console.log('Title:', problem.title);
    console.log('\nHas metadata:', !!problem.metadata);
    console.log('\nMetadata:');
    console.log(JSON.stringify(problem.metadata, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

check();
