const { connectDB } = require("../config/db.js");
const oracledb = require("oracledb");
const crypto = require("crypto");

async function createGroup(req, res, next) {
    let connection;
    try {
        const { group_name } = req.body;
        const created_by = req.user.user_id;

        if (!group_name || group_name.trim().length === 0) {
            return res.status(400).json({ message: "Group name is required" });
        }

        const inviteCode = crypto.randomBytes(3).toString("hex").toUpperCase();
        connection = await connectDB();

        await connection.execute(
            `INSERT INTO GROUPS_TABLE (GROUP_NAME, CREATED_BY, INVITE_CODE)
             VALUES (:1, :2, :3)`,
            [group_name.trim(), created_by, inviteCode],
            { autoCommit: false }
        );

        const grpResult = await connection.execute(
            `SELECT GRP_ID FROM GROUPS_TABLE WHERE INVITE_CODE = :1`,
            [inviteCode],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (grpResult.rows.length > 0) {
            const grp_id = grpResult.rows[0].GRP_ID;
            await connection.execute(
                `INSERT INTO GROUP_MEMBERS (GRP_ID, USER_ID) VALUES (:1, :2)`,
                [grp_id, created_by],
                { autoCommit: true }
            );
        } else {
            await connection.commit();
        }

        return res.status(201).json({
            message: "Group created successfully",
            invite_code: inviteCode
        });

    } catch (error) {
        next(error);
    } finally {
        if (connection) await connection.close();
    }
}

async function getUserGroups(req, res, next) {
    let connection;
    try {
        const user_id = req.user.user_id;
        connection = await connectDB();

        const result = await connection.execute(
            `SELECT g.GRP_ID, g.GROUP_NAME, g.CREATED_BY, g.INVITE_CODE,
                    (SELECT COUNT(*) FROM GROUP_MEMBERS gm WHERE gm.GRP_ID = g.GRP_ID) AS MEMBER_COUNT
             FROM GROUPS_TABLE g
             JOIN GROUP_MEMBERS m ON g.GRP_ID = m.GRP_ID
             WHERE m.USER_ID = :1
             ORDER BY g.GRP_ID DESC`,
            [user_id],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        return res.status(200).json(result.rows);
    } catch (error) {
        next(error);
    } finally {
        if (connection) await connection.close();
    }
}

async function addUserToGroup(req, res, next) {
    let connection;
    try {
        const { group_id, user_id } = req.body;
        const admin_id = req.user.user_id;

        if (!group_id || !user_id) {
            return res.status(400).json({ message: "group_id and user_id are required" });
        }

        connection = await connectDB();

        const result = await connection.execute(
            `SELECT CREATED_BY FROM GROUPS_TABLE WHERE GRP_ID=:1`,
            [group_id],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (result.rows[0].CREATED_BY !== admin_id) {
            return res.status(403).json({ message: "Only admin can add users" });
        }

        const dupCheck = await connection.execute(
            `SELECT 1 FROM GROUP_MEMBERS WHERE GRP_ID=:1 AND USER_ID=:2`,
            [group_id, user_id],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (dupCheck.rows.length > 0) {
            return res.status(409).json({ message: "User is already a member of this group" });
        }

        await connection.execute(
            `INSERT INTO GROUP_MEMBERS (GRP_ID, USER_ID) VALUES (:1, :2)`,
            [group_id, user_id],
            { autoCommit: true }
        );

        return res.status(201).json({ message: "User added to group successfully" });

    } catch (error) {
        next(error);
    } finally {
        if (connection) await connection.close();
    }
}

async function createGroupExpense(req, res, next) {
    let connection;
    try {
        const { group_id, amount, description } = req.body;
        const paid_by = req.user.user_id;

        if (!group_id || !amount || amount <= 0) {
            return res.status(400).json({ message: "Valid group_id and positive amount are required" });
        }

        connection = await connectDB();

        const memberCheck = await connection.execute(
            `SELECT 1 FROM GROUP_MEMBERS WHERE GRP_ID=:1 AND USER_ID=:2`,
            [group_id, paid_by],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (memberCheck.rows.length === 0) {
            return res.status(403).json({ message: "User is not part of this group" });
        }

        await connection.execute(
            `INSERT INTO GROUP_EXPENSES (GRP_ID, PAID_BY, AMOUNT, DESCRIPTION)
             VALUES (:1, :2, :3, :4)`,
            [group_id, paid_by, parseFloat(amount), description || ""],
            { autoCommit: true }
        );

        return res.status(201).json({ message: "Group expense added successfully" });

    } catch (error) {
        next(error);
    } finally {
        if (connection) await connection.close();
    }
}

async function getGroupExpenses(req, res, next) {
    let connection;
    try {
        const groupId = req.params.groupId;
        const user_id = req.user.user_id;

        connection = await connectDB();

        const memberCheck = await connection.execute(
            `SELECT 1 FROM GROUP_MEMBERS WHERE GRP_ID=:1 AND USER_ID=:2`,
            [groupId, user_id],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (memberCheck.rows.length === 0) {
            return res.status(403).json({ message: "Access denied. You are not a member of this group" });
        }

        const result = await connection.execute(
            `SELECT e.GROUP_EXPENSE_ID, e.GRP_ID, e.PAID_BY, e.AMOUNT, e.DESCRIPTION, u.USERNAME AS PAID_BY_NAME
             FROM GROUP_EXPENSES e
             LEFT JOIN USERS u ON e.PAID_BY = u.USER_ID
             WHERE e.GRP_ID=:1
             ORDER BY e.GROUP_EXPENSE_ID DESC`,
            [groupId],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        return res.status(200).json(result.rows);
    } catch (error) {
        next(error);
    } finally {
        if (connection) await connection.close();
    }
}

async function getGroupMembers(req, res, next) {
    let connection;
    try {
        const groupId = req.params.groupId;

        connection = await connectDB();
        const memberCheck = await connection.execute(
            `SELECT 1 FROM GROUP_MEMBERS WHERE GRP_ID=:1 AND USER_ID=:2`,
            [groupId, req.user.user_id],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (memberCheck.rows.length === 0) {
            return res.status(403).json({ message: "Access denied. You are not a member of this group" });
        }

        const result = await connection.execute(
            `SELECT m.GROUP_MEMBER_ID, m.GRP_ID, m.USER_ID, m.SETTLED, u.USERNAME, u.EMAIL, u.UPI_ID
             FROM GROUP_MEMBERS m
             JOIN USERS u ON m.USER_ID = u.USER_ID
             WHERE m.GRP_ID=:1`,
            [groupId],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        return res.status(200).json(result.rows);
    } catch (error) {
        next(error);
    } finally {
        if (connection) await connection.close();
    }
}

async function settleGroup(req, res, next) {
    let connection;
    try {
        const groupId = req.params.groupId;

        connection = await connectDB();
        const memberCheck = await connection.execute(
            `SELECT 1 FROM GROUP_MEMBERS WHERE GRP_ID=:1 AND USER_ID=:2`,
            [groupId, req.user.user_id],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (memberCheck.rows.length === 0) {
            return res.status(403).json({ message: "Access denied. You are not a member of this group" });
        }

        const memberResult = await connection.execute(
            `SELECT m.USER_ID, u.USERNAME, u.UPI_ID, m.SETTLED 
             FROM GROUP_MEMBERS m 
             JOIN USERS u ON m.USER_ID = u.USER_ID 
             WHERE m.GRP_ID=:1`,
            [groupId],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const expenseResult = await connection.execute(
            `SELECT PAID_BY, AMOUNT FROM GROUP_EXPENSES WHERE GRP_ID=:1`,
            [groupId],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const members = memberResult.rows;
        const expenses = expenseResult.rows;
        const totalMembers = members.length || 1;

        let totalExpense = 0;
        const paidMap = {};

        for (const expense of expenses) {
            totalExpense += expense.AMOUNT;
            paidMap[expense.PAID_BY] = (paidMap[expense.PAID_BY] || 0) + expense.AMOUNT;
        }

        const perPerson = totalMembers > 0 ? totalExpense / totalMembers : 0;
        const settlement = [];

        for (const member of members) {
            const userId = member.USER_ID;
            const paid = paidMap[userId] || 0;
            const balance = paid - perPerson;

            settlement.push({
                user_id: userId,
                username: member.USERNAME,
                upi_id: member.UPI_ID,
                settled: member.SETTLED || 0,
                paid: parseFloat(paid.toFixed(2)),
                should_pay: parseFloat(perPerson.toFixed(2)),
                balance: parseFloat(balance.toFixed(2))
            });
        }

        return res.status(200).json({
            totalExpense: parseFloat(totalExpense.toFixed(2)),
            perPerson: parseFloat(perPerson.toFixed(2)),
            settlement
        });

    } catch (error) {
        next(error);
    } finally {
        if (connection) await connection.close();
    }
}

async function joinGroupByCode(req, res, next) {
    let connection;
    try {
        const { invite_code } = req.body;
        const user_id = req.user.user_id;

        if (!invite_code) {
            return res.status(400).json({ message: "Invite code is required" });
        }

        connection = await connectDB();

        const groupResult = await connection.execute(
            `SELECT GRP_ID FROM GROUPS_TABLE WHERE INVITE_CODE=:1`,
            [invite_code.toUpperCase().trim()],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (groupResult.rows.length === 0) {
            return res.status(404).json({ message: "Invalid invite code" });
        }

        const group_id = groupResult.rows[0].GRP_ID;

        const dupCheck = await connection.execute(
            `SELECT 1 FROM GROUP_MEMBERS WHERE GRP_ID=:1 AND USER_ID=:2`,
            [group_id, user_id],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (dupCheck.rows.length > 0) {
            return res.status(409).json({ message: "You are already a member of this group" });
        }

        await connection.execute(
            `INSERT INTO GROUP_MEMBERS (GRP_ID, USER_ID) VALUES (:1, :2)`,
            [group_id, user_id],
            { autoCommit: true }
        );

        return res.status(201).json({ message: "Joined group successfully", group_id });

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

        const adminCheck = await connection.execute(
            `SELECT CREATED_BY FROM GROUPS_TABLE WHERE GRP_ID=:1`,
            [groupId],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (adminCheck.rows.length === 0) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (adminCheck.rows[0].CREATED_BY !== admin_id) {
            return res.status(403).json({ message: "Only admin can mark members as settled" });
        }

        await connection.execute(
            `UPDATE GROUP_MEMBERS SET SETTLED=1 WHERE GRP_ID=:1 AND USER_ID=:2`,
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

        const adminCheck = await connection.execute(
            `SELECT CREATED_BY FROM GROUPS_TABLE WHERE GRP_ID=:1`,
            [groupId],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (adminCheck.rows.length > 0 && adminCheck.rows[0].CREATED_BY === user_id) {
            return res.status(403).json({ message: "Group admin cannot leave. Delete the group instead" });
        }

        await connection.execute(
            `DELETE FROM GROUP_MEMBERS WHERE GRP_ID=:1 AND USER_ID=:2`,
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

        const adminCheck = await connection.execute(
            `SELECT CREATED_BY FROM GROUPS_TABLE WHERE GRP_ID=:1`,
            [groupId],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (adminCheck.rows.length === 0) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (adminCheck.rows[0].CREATED_BY !== admin_id) {
            return res.status(403).json({ message: "Only group admin can delete the group" });
        }

        await connection.execute(`DELETE FROM GROUP_EXPENSES WHERE GRP_ID=:1`, [groupId]);
        await connection.execute(`DELETE FROM GROUP_MEMBERS WHERE GRP_ID=:1`, [groupId]);
        await connection.execute(`DELETE FROM GROUPS_TABLE WHERE GRP_ID=:1`, [groupId], { autoCommit: true });

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
        const requester_id = req.user.user_id;

        connection = await connectDB();

        const memberCheck = await connection.execute(
            `SELECT 1 FROM GROUP_MEMBERS WHERE GRP_ID=:1 AND USER_ID=:2`,
            [groupId, requester_id],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (memberCheck.rows.length === 0) {
            return res.status(403).json({ message: "Access denied. You are not a member of this group" });
        }

        const adminCheck = await connection.execute(
            `SELECT CREATED_BY FROM GROUPS_TABLE WHERE GRP_ID=:1`,
            [groupId],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (adminCheck.rows.length === 0) {
            return res.status(404).json({ message: "Group not found" });
        }

        const admin_id = adminCheck.rows[0].CREATED_BY;

        const adminResult = await connection.execute(
            `SELECT USERNAME, UPI_ID FROM USERS WHERE USER_ID=:1`,
            [admin_id],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const adminUPI = adminResult.rows[0]?.UPI_ID;
        const adminName = adminResult.rows[0]?.USERNAME;

        if (!adminUPI) {
            return res.status(400).json({ message: "Group admin has no UPI ID configured in their profile" });
        }

        const totalResult = await connection.execute(
            `SELECT SUM(AMOUNT) AS TOTAL FROM GROUP_EXPENSES WHERE GRP_ID=:1`,
            [groupId],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const memberResult = await connection.execute(
            `SELECT COUNT(*) AS TOTAL_MEMBERS FROM GROUP_MEMBERS WHERE GRP_ID=:1`,
            [groupId],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const paidResult = await connection.execute(
            `SELECT SUM(AMOUNT) AS PAID FROM GROUP_EXPENSES WHERE GRP_ID=:1 AND PAID_BY=:2`,
            [groupId, userId],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const total = totalResult.rows[0]?.TOTAL || 0;
        const members = memberResult.rows[0]?.TOTAL_MEMBERS || 1;
        const paid = paidResult.rows[0]?.PAID || 0;
        const perPerson = total / members;
        const amountOwed = perPerson - paid;

        if (amountOwed <= 0) {
            return res.status(200).json({ message: "This member owes no remaining balance", amount_owed: "0.00" });
        }

        const upiUrl = `upi://pay?pa=${encodeURIComponent(adminUPI)}&pn=${encodeURIComponent(adminName)}&am=${amountOwed.toFixed(2)}&cu=INR&tn=${encodeURIComponent('Group Settlement')}`;

        const QRCode = require("qrcode");
        const qrImage = await QRCode.toDataURL(upiUrl);

        return res.status(200).json({
            message: "UPI QR generated successfully",
            amount_owed: amountOwed.toFixed(2),
            admin_upi: adminUPI,
            admin_name: adminName,
            qr: qrImage
        });

    } catch (error) {
        next(error);
    } finally {
        if (connection) await connection.close();
    }
}

module.exports = {
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
};