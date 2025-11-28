// const mongoose = require('mongoose');

// const projectSchema = new mongoose.Schema({
//   name: { type: String, required: true, trim: true },
//   description: { type: String },
//   owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
// }, { timestamps: true });

// module.exports = mongoose.model('Project', projectSchema);



const mongoose=require('mongoose');

const projectSchema=mongoose.Schema({
  name:{type:String,required:true,trim:true},
  description:{type:String},
  owner:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
  members:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}]

},{timestamps:true});

module.exports=mongoose.model('Project',projectSchema)