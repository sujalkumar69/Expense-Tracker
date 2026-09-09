const express = require("express");
const router = express.Router();
const {
    createGroup,
    getUserGroups,
    addUserToGroup,
    createGroupExpense,
    getGroupExpenses,
    getGroupMembers,
    settleGroup,
    joinGroupByCode,
    markMemberSettled,
    leaveGroup,
    deleteGroup,
    generateQR
} = require("../controllers/groupController");

const verifyToken = require("../middlewarre/authMiddleware");

router.post("/create", verifyToken, createGroup);
router.get("/user-groups", verifyToken, getUserGroups);
router.post("/add-user", verifyToken, addUserToGroup);
router.post("/expense", verifyToken, createGroupExpense);
router.get("/expense/:groupId", verifyToken, getGroupExpenses);
router.get("/members/:groupId", verifyToken, getGroupMembers);
router.get("/settle/:groupId", verifyToken, settleGroup);
router.post("/join", verifyToken, joinGroupByCode);
router.put("/settle-member/:groupId/:userId", verifyToken, markMemberSettled);
router.delete("/leave/:groupId", verifyToken, leaveGroup);
router.delete("/delete/:groupId", verifyToken, deleteGroup);
router.get("/generate-qr/:groupID/:userId", verifyToken, generateQR);

module.exports = router;