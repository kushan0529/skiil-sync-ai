// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true, trim: true },
//   email: { type: String, required: true, unique: true, lowercase: true, trim: true },
//   password: { type: String },
//   role: { type: String, enum: ['admin', 'manager', 'member'], default: 'member' },
//   skills: [{ type: String }],
//   resumeUrl: { type: String },
//   availabilityScore: { type: Number, default: 1 }
// }, { timestamps: true });

// userSchema.index({ email: 1 });

// module.exports = mongoose.model('User', userSchema);





const mongoose=require('mongoose');

const userSchema=mongoose.Schema({
  name:{type:String,required:true,trim:true},
  email:{type:String,require:true,unique:true},
  password:{type:String},
  role:{type:String,enum:['admin','manager','member'],
  skills:[{type:String}],
  resumeurl:{type:String},
  availabilityScore:{type:Number,default:1}
  }
},{ timestamps:true})

module.exports=mongoose.model('User',userSchema)