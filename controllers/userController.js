const  bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const {connectDB} = require("../config/db.js");


async function registerUser(req, res,next) {

    let connection;

    try {

        const { username, email, password } = req.body;
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
            (USERNAME, EMAIL, USER_PASSWORD)
            VALUES
            (:username, :email, :password)
        `;

        await connection.execute(
            sql,
            {
                username,
                email,
                password
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
        const token = jwt.sign(
            { user_id: user.USER_ID, email: user.EMAIL },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            message: "Login successful",
            token
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


module.exports = {
    registerUser,
    loginUser
};