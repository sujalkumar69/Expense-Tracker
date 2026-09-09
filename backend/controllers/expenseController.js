const { connectDB } = require("../config/db.js");
const oracledb = require("oracledb");

async function createExpense(req, res, next) {
    let connection;
    try {
        const { amount, category, description, expense_date } = req.body;
        const user_id = req.user.user_id;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: "Amount must be a positive number" });
        }
        if (!category) {
            return res.status(400).json({ message: "Category is required" });
        }
        if (!expense_date) {
            return res.status(400).json({ message: "Expense date is required" });
        }

        connection = await connectDB();

        await connection.execute(
            `INSERT INTO EXPENSES
            (USER_ID, AMOUNT, CATEGORY, DESCRIPTION, EXPENSE_DATE)
            VALUES
            (:user_id, :amount, :category, :description, TO_DATE(:expense_date, 'YYYY-MM-DD'))`,
            {
                user_id,
                amount: parseFloat(amount),
                category,
                description: description || "",
                expense_date
            },
            { autoCommit: true }
        );

        return res.status(201).json({ message: "Expense created successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function getExpenses(req, res, next) {
    let connection;
    try {
        const user_id = req.user.user_id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        connection = await connectDB();

        const result = await connection.execute(
            `SELECT EXPENSE_ID, USER_ID, AMOUNT, CATEGORY, DESCRIPTION, 
                    TO_CHAR(EXPENSE_DATE, 'YYYY-MM-DD') AS EXPENSE_DATE
             FROM EXPENSES 
             WHERE USER_ID = :1
             ORDER BY EXPENSE_ID DESC 
             OFFSET :2 ROWS FETCH NEXT :3 ROWS ONLY`,
            [user_id, offset, limit],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const expenses = result.rows;

        return res.status(200).json({
            page,
            limit,
            expenses
        });
    } catch (error) {
        next(error);
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateExpense(req, res, next) {
    let connection;
    try {
        const expenseId = req.params.id;
        const user_id = req.user.user_id;
        const { amount, category, description, expense_date } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: "Amount must be a positive number" });
        }

        connection = await connectDB();

        let sql = `UPDATE EXPENSES SET AMOUNT=:amount, CATEGORY=:category, DESCRIPTION=:description`;
        const bindParams = { amount: parseFloat(amount), category, description: description || "", expenseId, user_id };

        if (expense_date) {
            sql += `, EXPENSE_DATE=TO_DATE(:expense_date, 'YYYY-MM-DD')`;
            bindParams.expense_date = expense_date;
        }

        sql += ` WHERE EXPENSE_ID=:expenseId AND USER_ID=:user_id`;

        const result = await connection.execute(
            sql,
            bindParams,
            { autoCommit: true }
        );

        if (result.rowsAffected === 0) {
            return res.status(404).json({ message: "Expense not found or access denied" });
        }

        return res.status(200).json({ message: "Expense updated successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteExpense(req, res, next) {
    let connection;
    try {
        const expenseId = req.params.id;
        const user_id = req.user.user_id;

        connection = await connectDB();

        const result = await connection.execute(
            `DELETE FROM EXPENSES WHERE EXPENSE_ID=:expenseId AND USER_ID=:user_id`,
            { expenseId, user_id },
            { autoCommit: true }
        );

        if (result.rowsAffected === 0) {
            return res.status(404).json({ message: "Expense not found or access denied" });
        }

        return res.status(200).json({ message: "Expense deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function getExpensesByUser(req, res, next) {
    let connection;
    try {
        const userId = parseInt(req.params.userId);
        const authenticatedUserId = req.user.user_id;

        if (userId !== authenticatedUserId) {
            return res.status(403).json({ message: "Forbidden: Cannot access other users' expenses" });
        }

        connection = await connectDB();

        const result = await connection.execute(
            `SELECT EXPENSE_ID, USER_ID, AMOUNT, CATEGORY, DESCRIPTION, 
                    TO_CHAR(EXPENSE_DATE, 'YYYY-MM-DD') AS EXPENSE_DATE
             FROM EXPENSES
             WHERE USER_ID = :userId
             ORDER BY EXPENSE_ID DESC`,
            { userId },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        return res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    createExpense,
    getExpenses,
    updateExpense,
    deleteExpense,
    getExpensesByUser
};