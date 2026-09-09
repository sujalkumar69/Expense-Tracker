const blacklistedTokens = new Set();
const  bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const oracledb =require("oracledb")
const {connectDB} = require("../config/db.js");



async function registerUser(req, res,next) {

    let connection;

    try {

        const { username, email, password, upi_id } = req.body;
        if (!username || username.length < 2 || username.length > 50) {
            return res.status(400).json({ message: "Name must be 2 to 50 characters" });
        }
        if (!email || email.length > 100) {
            return res.status(400).json({ message: "Invalid email" });
        }
        if (!password || password.length < 6 || password.length > 50) {
            return res.status(400).json({ message: "Password must be 6 to 50 characters" });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        const hashedPassword = await bcrypt.hash(password,10);

        connection = await connectDB();

        const sql = `
            INSERT INTO USERS
            (USERNAME, EMAIL, USER_PASSWORD,UPI_ID)
            VALUES
            (:username, :email, :hashedPassword, :upi_id)
        `;

        await connection.execute(
            sql,
            {
                username,
                email,
                hashedPassword,
                upi_id
            },
            {
                autoCommit: true
            }
        );

        res.status(201).json({
            message: "User registered successfully"
        });

    } catch(error) {

        console.error(error);

        res.status(500).json({
            error: error.message
        });

    } finally {

        if(connection){
            await connection.close();
        }

    }

}
async function loginUser(req, res) {

    let connection;

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        connection = await connectDB();

        // ONLY query by email
        const result = await connection.execute(
            `SELECT * FROM USERS WHERE EMAIL=:1`,
            [email],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const user = result.rows[0];

        // NOW compare password with bcrypt
        const isMatch = await bcrypt.compare(password, user.USER_PASSWORD);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        // GENERATE token
        // ACCESS TOKEN — expires in 15 minutes
    const accessToken = jwt.sign(
        { user_id: user.USER_ID, email: user.EMAIL },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
    );

// REFRESH TOKEN — expires in 7 days
    const refreshToken = jwt.sign(
        { user_id: user.USER_ID, email: user.EMAIL },
        process.env.REFRESH_SECRET,
        { expiresIn: "7d" }
    );

    return res.status(200).json({
        message: "Login successful",
        accessToken,
        refreshToken
    });

    } catch (error) {

        console.error(error);
        return res.status(500).json({ error: error.message });

    } finally {

        if (connection) {
            await connection.close();
        }

    }
} 

async function refreshAccessToken(req, res, next) {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token required" });
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

        const newAccessToken = jwt.sign(
            { user_id: decoded.user_id, email: decoded.email },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        return res.status(200).json({
            accessToken: newAccessToken
        });

    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired refresh token" });
    }
}
async function getUserProfile(req, res, next) {
    let connection;
    try {
        const user_id = req.user.user_id;

        connection = await connectDB();

        const result = await connection.execute(
            `SELECT USER_ID, USERNAME, EMAIL, UPI_ID 
             FROM USERS 
             WHERE USER_ID=:1`,
            [user_id],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ user: result.rows[0] });

    } catch (error) {
        next(error);
    } finally {
        if (connection) await connection.close();
    }
}
async function updateUserProfile(req, res, next) {
    let connection;
    try {
        const user_id = req.user.user_id;
        const { username, upi_id } = req.body;

        if (!username || username.length < 2 || username.length > 50) {
            return res.status(400).json({ message: "Name must be 2 to 50 characters" });
        }

        connection = await connectDB();

        await connection.execute(
            `UPDATE USERS 
             SET USERNAME=:1, UPI_ID=:2 
             WHERE USER_ID=:3`,
            [username, upi_id, user_id],
            { autoCommit: true }
        );

        return res.status(200).json({ message: "Profile updated successfully" });

    } catch (error) {
        next(error);
    } finally {
        if (connection) await connection.close();
    }
}
async function logoutUser(req, res, next) {
    try {
        const authHeader = req.headers["authorization"];

        if (!authHeader) {
            return res.status(401).json({ message: "No token provided" });
        }

        const token = authHeader.split(" ")[1];
        blacklistedTokens.add(token);

        return res.status(200).json({ message: "Logged out successfully" });

    } catch (error) {
        next(error);
    }
}



module.exports = {
    registerUser,
    loginUser,
    refreshAccessToken,
    getUserProfile,
    updateUserProfile,
    logoutUser,
    blacklistedTokens
};