// const bcrypt = require('bcryptjs');
// const User = require('../models/User.model');
// const { signToken } = require('../utils/jwt.util');

// exports.register = async (req, res, next) => {
//   try {
//     const { name, email, password } = req.body;
//     if (!name || !email || !password) {
//       return res.status(400).json({ error: 'Missing fields' });
//     }
//     const exists = await User.findOne({ email });
//     if (exists) {
//       return res.status(400).json({ error: 'User already exists' });
//     }

//     const hashed = await bcrypt.hash(password, 10);
//     const user = await User.create({ name, email, password: hashed });

//     const token = signToken({ id: user._id });
//     res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
//   } catch (err) {
//     next(err);
//   }
// };

// exports.login = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password){ 
//       return res.status(400).json({ error: 'Missing fields' });
//     }
//     const user = await User.findOne({ email });
//     if (!user || !user.password) {
//       return res.status(400).json({ error: 'Invalid credentials' });
//     }
//     const ok = await bcrypt.compare(password, user.password);
//     if (!ok) {
//       return res.status(400).json({ error: 'Invalid credentials' });
//     }
//     const token = signToken({ id: user._id });
//     res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
//   } catch (err) {
//     next(err);
//   }
// };

const bcrypt=require('bcryptjs');
const User=require('../models/User.model');
const jwt=require('jsonwebtoken');
function signToken(payload,expires='7d'){
  return jwt.sign(payload,process.env.JWT_SECRET,{expires})
}
exports.register=async(req,res,next)=>{
  const {name,password,email}=req.body;
  try{
    if(!name || !email || !password){
      res.status(400).json({error:'Enter all formates'})
    }
    const Exist=await User.findOne({email})
    if(Exist){
      res.status(400).json({error:'User Already Exists'})
    }
    
    const hashed=await bcrypt.hash(password(10))
    const user=await User.create({name,email,password:hashed})
    const token=signToken({id:user._id})
    res.json({user:{id:user._id,name:user.name,email:user.email,role:user.role}})
  }
  catch(err){
    next(err)
  }
}

exports.login=async(req,res,next)=>{
  const {email,password}=req.body
  try{
    if(!email||!password){
      res.status(400).json({error:'Missing Fields'})
    }
    const user=await User.findOne({email})
    if(!user||!user.password){
      res.status(400).json({error:'invalid credentials'})
    }
    const ok=await bcrypt.compare(password,user.password)
    if(!ok){
      res.status(400).json({error:'Invalid password'})
    }
    const token=signToken({id:user._id})
    res.json({user:{id:user._id,name:user.name,email:user.email,role:user.role},token})
  }
  catch(err){
    next(err)
  }
}