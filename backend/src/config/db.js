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
//   if(!mongoUrl){
//     console.log('the mongo db url is not matching')
//     process.exit(1)
//   }
//   try{
//     await mongoose.connect(mongoUrl)
//     console.log('connected to MongoDB✅')
//   }catch(err){
//     console.log('error is ', err.message)
//   }
// }