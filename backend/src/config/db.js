const mongoose = require('mongoose');

module.exports = async function connectDB(mongoUrl) {
  if (!mongoUrl) {
    console.error('Missing MONGO_URL environment variable.');
    process.exit(1);
  }
  try {
    await mongoose.connect(mongoUrl);
    console.log('MongoDB connected ✅');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};







// const mongoose=require('mongoose');
// module.exports=async function connectDB(mongoUrl){
//   try{
//     await mongoose.connect(mongoUrl)
//     console.log('connected to db ✅')
//   }
//   catch(err){
//     console.log(err)
//   }
// }