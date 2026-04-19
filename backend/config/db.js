import mongoose from "mongoose";

const connectDb = async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI, {
            dbName:"MERNAuth",
        });
        console.log("MongoDB connnected");
    }catch(error){
        console.log("failed to connect");
    }
}

export default connectDb