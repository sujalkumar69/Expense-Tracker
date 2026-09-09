const express =require("express");
const router =express.Router();

const{
    createExpense,getExpenses,updateExpense,deleteExpense,getExpensesByUser
}=require("../controllers/expenseController");
const verifyToken = require("../middlewarre/authMiddleware");

router.post(
    "/create", verifyToken,
    createExpense
);

router.get("/all",verifyToken,getExpenses);

router.put("/:id",verifyToken,updateExpense);

router.delete("/:id",verifyToken,deleteExpense);

router.get("/user/:userId",verifyToken,getExpensesByUser);

module.exports=router;