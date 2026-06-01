const express =require("express");
const { initPool }=require("./config/db.js");
require("dotenv").config();
const userRoutes = require("./routes/userRoutes.js");
const expenseRoutes = require("./routes/expenseRoutes.js");
const groupRoutes = require("./routes/groupRoutes.js");
const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(rateLimit({
    windowMs:15*60*1000,
    max:100,
    message: "Too many Requests, please try again later"
}));

app.use("/api/users",userRoutes);
app.use("/api/expenses",expenseRoutes);
app.use("/api/groups",groupRoutes);
app.get("/",(req,res)=>{
    res.send("Expense tracker Backend Running");
});

app.use((err, req, res, next) =>{
    console.error(err);
    res.status(500).json({error:err.message})

});


const PORT = process.env.PORT || 5000;
async function startServer(){
    try{

        await initPool();

        app.listen(PORT,()=>{

            console.log(

            `Server running on port ${PORT}`
            );
        });
    }catch(error){

        console.error(error);

    }

}
startServer();

