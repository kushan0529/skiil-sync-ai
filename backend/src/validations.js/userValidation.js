const joi=require('joi')

exports.registerValidation=joi.object({
    name:joi.string(),
    email:joi.string()
})