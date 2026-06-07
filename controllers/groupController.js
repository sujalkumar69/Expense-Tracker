const {connectDB} =require("../config/db.js");
const oracledb =require("oracledb");
async function createGroup(req,res,next){

    let connection;

    try{

        const{
            group_name,
            created_by
        }=req.body;

        connection=
        await connectDB();

        await connection.execute(

        `
        INSERT INTO GROUPS_TABLE
        (
            GROUP_NAME,
            CREATED_BY
        )

        VALUES
        (
            :1,
            :2
        )
        `,

        [
            group_name,
            created_by
        ],

        {
            autoCommit:true
        }

        );

        return res.status(201).json({

            message:
            "Group created successfully"

        });

    }catch(error){
        next(error);


        

    }finally{

        if(connection){

            await connection.close();

        }

    }

}
async function addUserToGroup(req, res,next) {

    let connection;

    try {

        const {
            group_id,
            admin_id,
            user_id
        } = req.body;

        // INPUT VALIDATION
        if (!group_id || !admin_id || !user_id) {
            return res.status(400).json({
                message: "group_id, admin_id, user_id are required"
            });
        }

        connection = await connectDB();

        // CHECK GROUP EXISTS AND GET ADMIN
        const result = await connection.execute(
            `
            SELECT CREATED_BY
            FROM GROUPS_TABLE
            WHERE GRP_ID=:1
            `,
            [group_id],
            {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            }
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Group not found"
            });
        }

        const actualAdmin = result.rows[0].CREATED_BY;

        // ADMIN CHECK
        if (actualAdmin !== admin_id) {
            return res.status(403).json({
                message: "Only admin can add users"
            });
        }

        // DUPLICATE MEMBER CHECK
        const dupCheck = await connection.execute(
            `
            SELECT 1
            FROM GROUP_MEMBERS
            WHERE GRP_ID=:1
            AND USER_ID=:2
            `,
            [group_id, user_id],
            {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            }
        );

        if (dupCheck.rows.length > 0) {
            return res.status(409).json({
                message: "User is already a member of this group"
            });
        }

        // ADD USER
        await connection.execute(
            `
            INSERT INTO GROUP_MEMBERS
            (
                GRP_ID,
                USER_ID
            )
            VALUES
            (
                :1,
                :2
            )
            `,
            [group_id, user_id],
            {
                autoCommit: true
            }
        );

        return res.status(201).json({
            message: "User added to group successfully"
        });

    } catch (error) {

        next(error);

    } finally {

        if (connection) {
            await connection.close();
        }

    }
}

async function createGroupExpense(req,res,next){

    let connection;

    try{

        const{
            group_id,
            amount,
            description
        }=req.body;
        const paid_by=req.user.user_id;

        connection=
        await connectDB();
        



        // CHECK MEMBER EXISTS

        const memberCheck=
        await connection.execute(

        `
        SELECT *
        FROM GROUP_MEMBERS

        WHERE GRP_ID=:1
        AND USER_ID=:2
        `,

        [
            group_id,
            paid_by
        ],

        {
            outFormat:
            oracledb.OUT_FORMAT_OBJECT
        }

        );



        if(memberCheck.rows.length===0){

            return res.status(403).json({

                message:
                "User is not part of group"

            });

        }



        // INSERT GROUP EXPENSE

        await connection.execute(

        `
        INSERT INTO GROUP_EXPENSES
        (
            GRP_ID,
            PAID_BY,
            AMOUNT,
            DESCRIPTION
        )

        VALUES
        (
            :1,
            :2,
            :3,
            :4
        )
        `,

        [
            group_id,
            paid_by,
            amount,
            description
        ],

        {
            autoCommit:true
        }

        );



        return res.status(201).json({

            message:
            "Group expense added"

        });

    }catch(error){

        next(error);

    }finally{

        if(connection){

            await connection.close();

        }

    }

}
async function getGroupExpenses(req,res,next){

    let connection;

    try{

        const groupId =
        req.params.groupId;

        connection =
        await connectDB();
        const memberCheck = await connection.execute(
            `SELECT 1 FROM GROUP_MEMBERS 
             WHERE GRPID=:1 AND USER_ID=:2`,
            [groupId, req.user.user_id],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (memberCheck.rows.length === 0) {
            return res.status(403).json({ 
                message: "Access denied. You are not a member of this group" });
        }
        const result =await connection.execute(
        `
        SELECT
        GROUP_EXPENSE_ID,
        GRP_ID,
        PAID_BY,
        AMOUNT,
        DESCRIPTION

        FROM GROUP_EXPENSES

        WHERE GRP_ID=:1

        ORDER BY GROUP_EXPENSE_ID
        `,
        [groupId],
        {
            outFormat:
            oracledb.OUT_FORMAT_OBJECT
        }
        );
        return res.status(200).json(

            result.rows

        );
    }catch(error){

        next(error);
    }finally{

        if(connection){

            await connection.close();

        }

    }

}
async function getGroupMembers(req,res,next){

    let connection;

    try{

        const groupId =
        req.params.groupId;

        connection =
        await connectDB();
        const memberCheck = await connection.execute(
            `SELECT 1 FROM GROUP_MEMBERS 
             WHERE GRPID=:1 AND USER_ID=:2`,
            [groupId, req.user.user_id],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (memberCheck.rows.length === 0) {
            return res.status(403).json({ 
                message: "Access denied. You are not a member of this group" });
        }

        const result =
        await connection.execute(

        `
        SELECT
        GROUP_MEMBER_ID,
        GRP_ID,
        USER_ID

        FROM GROUP_MEMBERS

        WHERE GRP_ID=:1
        `,

        [groupId],

        {
            outFormat:
            oracledb.OUT_FORMAT_OBJECT
        }

        );

        return res.status(200).json(

            result.rows

        );

    }catch(error){

        next(error);

    }finally{

        if(connection){

            await connection.close();

        }

    }

}
async function settleGroup(req,res,next){

    let connection;

    try{

        const groupId =
        req.params.groupId;

        connection =
        await connectDB();
        const memberCheck = await connection.execute(
            `SELECT 1 FROM GROUP_MEMBERS 
             WHERE GRPID=:1 AND USER_ID=:2`,
            [groupId, req.user.user_id],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (memberCheck.rows.length === 0) {
            return res.status(403).json({ 
                message: "Access denied. You are not a member of this group" });
        }



        // GET MEMBERS

        const memberResult =
        await connection.execute(

        `
        SELECT USER_ID
        FROM GROUP_MEMBERS

        WHERE GRPID=:1
        `,

        [groupId],

        {
            outFormat:
            oracledb.OUT_FORMAT_OBJECT
        }

        );



        // GET EXPENSES

        const expenseResult =
        await connection.execute(

        `
        SELECT
        PAID_BY,
        AMOUNT

        FROM GROUP_EXPENSES

        WHERE GRPID=:1
        `,

        [groupId],

        {
            outFormat:
            oracledb.OUT_FORMAT_OBJECT
        }

        );



        const members =
        memberResult.rows;

        const expenses =
        expenseResult.rows;



        const totalMembers =
        members.length;



        let totalExpense = 0;

        const paidMap = {};



        for(const expense of expenses){

            totalExpense +=
            expense.AMOUNT;

            if(!paidMap[
                expense.PAID_BY
            ]){

                paidMap[
                expense.PAID_BY
                ] = 0;

            }

            paidMap[
            expense.PAID_BY
            ] += expense.AMOUNT;

        }



        const perPerson =
        totalExpense / totalMembers;



        const settlement = [];



        for(const member of members){

            const userId =
            member.USER_ID;

            const paid =
            paidMap[userId] || 0;

            const balance =
            paid - perPerson;

            settlement.push({

                user_id:userId,
                paid,
                should_pay:perPerson,
                balance

            });

        }



        return res.status(200).json({

            totalExpense,
            perPerson,
            settlement

        });

    }catch(error){

    next(error);
    }finally{

        if(connection){

            await connection.close();

        }

    }

}
module.exports={

    createGroup,
    addUserToGroup,
    createGroupExpense,
    getGroupExpenses,
    getGroupMembers,
    settleGroup

};