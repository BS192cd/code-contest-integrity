const mongoose = require('mongoose');
const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/codecontest_dev';
console.log('Testing URI (masked):', uri.replace(/(mongodb(?:\\+srv)?:\\/\\/)([^:]+):([^@]+)@/i, (_, p, u) => `${p}${u}:***@`));
mongoose.connect(uri).then(() => {
  console.log('Connected OK'); process.exit(0);
}).catch(err => {
  console.error('Connect ERROR:', err.message); process.exit(1);
});