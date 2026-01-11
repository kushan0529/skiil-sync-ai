// const mongoose = require('mongoose');

// const suggestionSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   score: Number,
//   reason: String
// }, { _id: false });

// const taskSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   description: String,
//   project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
//   assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
//   priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
//   requiredSkills: [{ type: String }],  
//   estimatedHours: Number,
//   dueDate: Date,
//   aiSuggestions: [suggestionSchema]
// }, { timestamps: true }); 

// module.exports = mongoose.model('Task', taskSchema);


const mongoose=require('mongoose')
const { diffIndexes } = require('./Project.model')

const suggestionSchema=new mongoose.Schema({
  userid:{type:mongoose.Schema.Types.ObjectId,ref:'user'},
  score:Number,
  reason:String,
},{_id:false})

const TaskSchema=new mongoose.Schema({
  title:{type:String,required:true},
  description:String,
  project:{type:mongoose.Schema.Types.ObjectId,ref:'project'},
  assignee:{type:mongoose.Schema.Types.ObjectId,ref:'user'},
  status:{type:String,enum:['todo','in-progress','done'],default:'todo'},
  preference:{type:String,enum:['low','medium','high'],default:'high'},
  estimatedHours:Number,
  dueDate:Date,
  aiSuggestions:[suggestionSchema]
},{timestamps:true})

module.exports=mongoose.model('Task',TaskSchema)