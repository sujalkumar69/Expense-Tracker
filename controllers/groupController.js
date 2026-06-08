const {connectDB} =require("../config/db.js");
const oracledb =require("oracledb");
const crypto =require("crypto");
async function createGroup(req,res,next){

    let connection;

    try{

        const{
            group_name,
            created_by
        }=req.body;

        const inviteCode = crypto.randomBytes(3).toString("hex").toUpperCase();

        connection=
        await connectDB();

        await connection.execute(

        `
        INSERT INTO GROUPS_TABLE
        (
            GROUP_NAME,
            CREATED_BY,
            INVITE_CODE
        )

        VALUES
        (
            :1,
            :2
        )
        `,

        [
            group_name,
            created_by,
            inviteCode
        ],

        {
            autoCommit:true
        }

        );

        return res.status(201).json({

            message:
            "Group created successfully",
            invite_code: inviteCode

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
async function joinGroupByCode(req, res, next) {
    let connection;
    try {
        const { invite_code } = req.body;
        const user_id = req.user.user_id;

        if (!invite_code) {
            return res.status(400).json({ message: "Invite code required" });
        }

        connection = await connectDB();

        // FIND GROUP BY INVITE CODE
        const groupResult = await connection.execute(
            `SELECT GRPID FROM GROUPS_TABLE 
             WHERE INVITE_CODE=:1`,
            [invite_code],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (groupResult.rows.length === 0) {
            return res.status(404).json({ message: "Invalid invite code" });
        }

        const group_id = groupResult.rows[0].GRPID;

        // CHECK IF ALREADY A MEMBER
        const dupCheck = await connection.execute(
            `SELECT 1 FROM GROUP_MEMBERS 
             WHERE GRPID=:1 AND USER_ID=:2`,
            [group_id, user_id],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (dupCheck.rows.length > 0) {
            return res.status(409).json({ message: "Already a member of this group" });
        }

        // ADD USER TO GROUP
        await connection.execute(
            `INSERT INTO GROUP_MEMBERS (GRPID, USER_ID)
             VALUES (:1, :2)`,
            [group_id, user_id],
            { autoCommit: true }
        );

        return res.status(201).json({ message: "Joined group successfully" });

    } catch (error) {
        next(error);
    } finally {
        if (connection) await connection.close();
    }
}
async function markMemberSettled(req, res, next) {
    let connection;
    try {
        const { groupId, userId } = req.params;
        const admin_id = req.user.user_id;

        connection = await connectDB();

        // CHECK IF REQUESTER IS ADMIN
        const adminCheck = await connection.execute(
            `SELECT CREATED_BY FROM GROUPS_TABLE WHERE GRPID=:1`,
            [groupId],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (adminCheck.rows.length === 0) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (adminCheck.rows[0].CREATED_BY !== admin_id) {
            return res.status(403).json({ message: "Only admin can mark members as settled" });
        }

        // MARK AS SETTLED
        await connection.execute(
            `UPDATE GROUP_MEMBERS 
             SET SETTLED=1 
             WHERE GRPID=:1 AND USER_ID=:2`,
            [groupId, userId],
            { autoCommit: true }
        );

        return res.status(200).json({ message: "Member marked as settled" });

    } catch (error) {
        next(error);
    } finally {
        if (connection) await connection.close();
    }
}
async function leaveGroup(req, res, next) {
    let connection;
    try {
        const { groupId } = req.params;
        const user_id = req.user.user_id;

        connection = await connectDB();

        // CHECK IF ADMIN — admin cannot leave
        const adminCheck = await connection.execute(
            `SELECT CREATED_BY FROM GROUPS_TABLE WHERE GRPID=:1`,
            [groupId],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (adminCheck.rows[0].CREATED_BY === user_id) {
            return res.status(403).json({ message: "Admin cannot leave. Delete the group instead" });
        }

        // REMOVE FROM GROUP
        await connection.execute(
            `DELETE FROM GROUP_MEMBERS 
             WHERE GRPID=:1 AND USER_ID=:2`,
            [groupId, user_id],
            { autoCommit: true }
        );

        return res.status(200).json({ message: "Left group successfully" });

    } catch (error) {
        next(error);
    } finally {
        if (connection) await connection.close();
    }
}
async function deleteGroup(req, res, next) {
    let connection;
    try {
        const { groupId } = req.params;
        const admin_id = req.user.user_id;

        connection = await connectDB();

        // CHECK IF ADMIN
        const adminCheck = await connection.execute(
            `SELECT CREATED_BY FROM GROUPS_TABLE WHERE GRPID=:1`,
            [groupId],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (adminCheck.rows.length === 0) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (adminCheck.rows[0].CREATED_BY !== admin_id) {
            return res.status(403).json({ message: "Only admin can delete the group" });
        }

        // DELETE CHILD TABLES FIRST
        await connection.execute(
            `DELETE FROM GROUP_EXPENSES WHERE GRPID=:1`,
            [groupId]
        );

        await connection.execute(
            `DELETE FROM GROUP_MEMBERS WHERE GRPID=:1`,
            [groupId]
        );

        // DELETE GROUP
        await connection.execute(
            `DELETE FROM GROUPS_TABLE WHERE GRPID=:1`,
            [groupId],
            { autoCommit: true }
        );

        return res.status(200).json({ message: "Group deleted successfully" });

    } catch (error) {
        next(error);
    } finally {
        if (connection) await connection.close();
    }
}
async function generateQR(req, res, next) {
    let connection;
    try {
        const { groupId, userId } = req.params;
        const admin_id = req.user.user_id;

        connection = await connectDB();

        // CHECK IF REQUESTER IS ADMIN
        const adminCheck = await connection.execute(
            `SELECT CREATED_BY FROM GROUPS_TABLE WHERE GRPID=:1`,
            [groupId],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (adminCheck.rows.length === 0) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (adminCheck.rows[0].CREATED_BY !== admin_id) {
            return res.status(403).json({ message: "Only admin can generate QR" });
        }

        // GET ADMIN UPI ID
        const adminResult = await connection.execute(
            `SELECT USERNAME, UPI_ID FROM USERS WHERE USER_ID=:1`,
            [admin_id],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const adminUPI = adminResult.rows[0].UPI_ID;
        const adminName = adminResult.rows[0].USERNAME;

        if (!adminUPI) {
            return res.status(400).json({ message: "Admin has no UPI ID set. Update profile first" });
        }

        // GET TOTAL GROUP EXPENSE
        const totalResult = await connection.execute(
            `SELECT SUM(AMOUNT) AS TOTAL FROM GROUP_EXPENSES WHERE GRPID=:1`,
            [groupId],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        // GET MEMBER COUNT
        const memberResult = await connection.execute(
            `SELECT COUNT(*) AS TOTAL_MEMBERS FROM GROUP_MEMBERS WHERE GRPID=:1`,
            [groupId],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        // GET HOW MUCH THIS USER PAID
        const paidResult = await connection.execute(
            `SELECT SUM(AMOUNT) AS PAID FROM GROUP_EXPENSES 
             WHERE GRPID=:1 AND PAID_BY=:2`,
            [groupId, userId],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const total = totalResult.rows[0].TOTAL || 0;
        const members = memberResult.rows[0].TOTAL_MEMBERS || 1;
        const paid = paidResult.rows[0].PAID || 0;
        const perPerson = total / members;
        const amountOwed = perPerson - paid;

        if (amountOwed <= 0) {
            return res.status(200).json({ message: "This user owes nothing" });
        }

        // GENERATE UPI URL
        const upiUrl = `upi://pay?pa=${adminUPI}&pn=${adminName}&am=${amountOwed.toFixed(2)}&cu=INR&tn=Group Expense Settlement`;

        // GENERATE QR
        const QRCode = require("qrcode");
        const qrImage = await QRCode.toDataURL(upiUrl);

        return res.status(200).json({
            message: "QR generated successfully",
            amount_owed: amountOwed.toFixed(2),
            qr: qrImage
        });

    } catch (error) {
        next(error);
    } finally {
        if (connection) await connection.close();
    }
}
module.exports={

    createGroup,
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

};