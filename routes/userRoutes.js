const express =require("express");
const router = express.Router();

const{
    registerUser,
    loginUser,
    refreshAccessToken
}=require("../controllers/userController.js");

router.post("/register",registerUser);
router.post("/login",loginUser);
router.post("/refresh-token", refreshAccessToken);

module.exports =router;