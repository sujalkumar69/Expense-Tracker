const oracledb =
require("oracledb");



let pool;



async function initPool(){

    try{

        pool =
        await oracledb.createPool({

            user:
            process.env.DB_USER,

            password:
            process.env.DB_PASSWORD,

            connectString:
            process.env.DB_CONNECT_STRING,

            poolMin:1,

            poolMax:10,

            poolIncrement:1

        });

        console.log(
        "Oracle Pool Created"
        );

    }catch(error){

        console.error(error);

    }

}



async function connectDB(){

    if(!pool){

        throw new Error(
        "Pool not initialized"
        );

    }

    return await pool.getConnection();

}



module.exports={

    initPool,
    connectDB

};