const joi= require('joi')

const loginValidation = joi.object({
  email:joi.string().email().trim().required(),
  password:joi.string().min(6).trim().required(),
 
})

module.exports={
  loginValidation
}