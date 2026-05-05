const Project=require('./models/Project.model')

exports.updateProject=async (req,res,next)=>{
    try{
        const currentproject=await Project.findById(req.params.id);

        const isMember=currentproject.members.some(m=>m.toString()===req.user._id.toString())
        const isowner=currentproject.owner.toString()=== req.user._id.toString();
        const isManager=req.user.role==='manager' || 'admin'
        

        if(!isMember && !isowner && !isManager){
            res.status(400).json({error:'not authorized'})
        }
        const oldMember=project.members.map(m=>m.toString());
        const updatedProject=await Project.findByIdAndUpdate(req.params.id,req.body,{new:true}.populate('owner members','-password')) 

        const currentMembers=updatedProject.members.map(m=>(m._id ||m).toString())
        const newMembers=currentMembers.filter(mId=> !oldMember.includes(mId))

        const targetEmails=req
    }
}