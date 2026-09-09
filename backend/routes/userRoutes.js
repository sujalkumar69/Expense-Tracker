const express =require("express");
const router = express.Router();

const{
    registerUser,
    loginUser,
    refreshAccessToken,
    getUserProfile,
    updateUserProfile,
    logoutUser
}=require("../controllers/userController.js");
const verifyToken = require("../middlewarre/authMiddleware.js");

router.post("/register",registerUser);
router.post("/login",loginUser);
router.post("/refresh-token", refreshAccessToken);
router.get("/profile",verifyToken,getUserProfile);
router.put("/profile",verifyToken, updateUserProfile);
router.post("/logout", verifyToken, logoutUser);
module.exports =router;