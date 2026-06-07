const jwt = require("jsonwebtoken");
const { blacklistedTokens}=require("../controllers/userController")

function verifyToken(req, res, next) {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    if (blacklistedTokens.has(token)){
        return res.status(401).json({message: "Token invalidated. Please login Again"});
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
}

module.exports = verifyToken;