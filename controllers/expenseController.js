const {connectDB} =require("../config/db.js");
const oracledb =require("oracledb");
const { link } = require("../routes/userRoutes.js");
async function createExpense(req,res){
    let connection;

    try{
        const{
            user_id,
            amount,
            category,
            description,
            expense_date,

        }=req.body;

        connection=await connectDB();

        await connection.execute(
            `INSERT INTO EXPENSES
            (
            USER_ID,
            AMOUNT,
            CATEGORY,
            DESCRIPTION,
            EXPENSE_DATE
            )
            VALUES
            (
            :user_id,
            :amount,
            :category,
            :description,
            TO_DATE(:expense_date,'YYYY-MM-DD')
            )
            `,
            {
            user_id,
            amount,
            category,
            description,
            expense_date

            },
            {autoCommit:true

        
        });
    }catch(error){
        console.error(error);

        res.status(500).json({
            error:error.message
        });

    }finally{
        if(connection){
            await connection.close();
        }
    }
}

async function getExpenses(req,res){
    let connection;

    try{
        const page =parseInt(req.query.page) || 1;
        const limit =parseInt(req.query.limit) ||10;
        const offset =(page -1) * limit;
        connection =await connectDB();

        const result=
        await connection.execute(
            `SELECT * FROM EXPENSES ORDER BY EXPENSE_ID OFFSET :1 ROWS FETCH NEXT :2 ROWS ONLY`,[offset,limit],{
                outFormat:oracledb.OUT_FORMAT_OBJECT
            }
        );

        const expenses=result.rows;

        res.status(200).json(
            page,
            limit,
            expenses
        );
    }catch (error){
        next(error);
    }finally{
        if(connection){
            await connection.close();
        }
    }
}

async function updateExpense(req,res){
    let connection;

    try{
        const expenseId=req.params.id;

        const{
            amount,category,description
        }=req.body;

        connection=await connectDB();

        const result= await connection.execute(
            `UPDATE EXPENSES SET AMOUNT=:amount,
            CATEGORY=:category,
            DESCRIPTION=:description
            
            WHERE EXPENSE_ID=:expenseId`,
            {
                amount,category,description,expenseId
            },
            {
                autoCommit:true
            }
        );

        if(result.rowsAffected===0){
            return res.status(404).json({
                message:"Expense Not Found"
            });

        }
        res.status(200).json({
            message:"Expense Updated Successfully"
        });
    }catch(error){
        console.error(error);
        res.status(500).json({
            error:error.message
        });
    }finally{
        if(connection){
            await connection.close();
        }
    }
}

async function deleteExpense(req,res){

    let connection;

    try{

        const expenseId =
        req.params.id;

        connection =
        await connectDB();

        const result =
        await connection.execute(

        `
        DELETE FROM EXPENSES
        WHERE EXPENSE_ID=:expenseId
        `,

        {
            expenseId
        },

        {
            autoCommit:true
        }

        );

        if(result.rowsAffected===0){

            return res.status(404).json({

                message:
                "Expense not found"

            });

        }

        return res.status(200).json({

            message:
            "Expense deleted successfully"

        });

    }catch(error){

        console.error(error);

        return res.status(500).json({

            error:error.message

        });

    }finally{

        if(connection){

            await connection.close();

        }

    }

}

async function getExpensesByUser(req,res){

    let connection;

    try{

        const userId =
        req.params.userId;

        connection =
        await connectDB();

        const result =
        await connection.execute(

        `
        SELECT
        EXPENSE_ID,
        USER_ID,
        AMOUNT,
        CATEGORY,
        DESCRIPTION,
        EXPENSE_DATE

        FROM EXPENSES

        WHERE USER_ID=:userId

        ORDER BY EXPENSE_ID
        `,

        {
            userId
        },

        {
            outFormat:
            oracledb.OUT_FORMAT_OBJECT
        }

        );

        return res.status(200).json(

            result.rows

        );

    }catch(error){

        console.error(error);

        return res.status(500).json({

            error:error.message

        });

    }finally{

        if(connection){

            await connection.close();

        }

    }

}
module.exports={
    createExpense,
    getExpenses,
    updateExpense,
    deleteExpense,
    getExpensesByUser
};