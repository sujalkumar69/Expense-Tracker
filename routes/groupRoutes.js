const express =
require("express");

const router =
express.Router();
const{
createGroup,
addUserToGroup,createGroupExpense,getGroupExpenses,getGroupMembers,settleGroup
}=require(
"../controllers/groupController"
);

const verifyToken = require("../middlewarre/authMiddleware");

router.post(
"/create",verifyToken,
createGroup
);
router.post(
    "/add-user",verifyToken,addUserToGroup
);

router.post("/expense",verifyToken,createGroupExpense);

router.get("/expense/:groupId",verifyToken,getGroupExpenses);

router.get("/members/:groupId",verifyToken,getGroupMembers);

router.get("/settle/:groupId",verifyToken,settleGroup);
module.exports=
router;