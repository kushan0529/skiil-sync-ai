const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const { signToken } = require('../utils/jwt.util');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    const token = signToken({ id: user._id });
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

    const user = await User.findOne({ email });
    if (!user || !user.password) return res.status(400).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

    const token = signToken({ id: user._id });
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
  } catch (err) {
    next(err);
  }
};


// const bcryptjs=require('bcryptjs')
// const User=require('../models/User.model')
// const signToken=require('../utils/jwt.util')

// exports.register=async (req,res,next)=>{
//   const {name,email,password}=req.body;
//   try{
//     if(!name || !email || !password){
//       return res.status(400).json({error:"some thing went wrong"})
//     }
//     const alreadyExist=await User.findOne({email})
//     if(alreadyExist){
//       return res.status(400).json({error:'user already exist'})
//     }
    
//     const hashpassword=  await bcryptjs.hash(password,10)
//     const user=new User({name,email,password:hashpassword})
//     res.json(user)
//   }catch(err){
//     next(err)
//   }
// }
// exports.login=async(req,res,next)=>{
//   try{
//     const{email,password}=req.body;
//       if(!email || !password){
//         return res.status(400).json({error:'enter the email and password'})
//       }
//       const user=await User.findOne({email:email})
//       if(!user){
//         return res.status(404).json({error:'user not found'})
//       }
//       const ok= await bcryptjs.compare(password,user.password)
//       if(!ok){
//         return res.status(400).json({error:'wrong password'})
//       }
//       const token=signToken({id:user._id})
//       res.json(user,token)

//   }catch(err){

//   }
// }