const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();
 


router.post("/signup", userController.signup)
router.post("/login", userController.login)
router.post("/changePassword", userController.changePassword)
router.put("/updateProfile", userController.updateProfile)
router.post("/forgotPassword", userController.forgotPassword)
router.post("/resetPassword", userController.resetPassword)
router.post("/socialLogin", userController.socialLogin)
router.get("/getProfile/:userId", userController.getProfile)










module.exports = router;
