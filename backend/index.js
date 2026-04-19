import express from 'express';
import dotenv from 'dotenv';
import connectDb from './config/db.js';
//importing routes
import userRoutes from "./routes/user.js"
import {createClient} from "redis"


dotenv.config();

await connectDb();

const redisUrl = process.env.REDIS_URL
if(!redisUrl){
    console.log("missing redis url");
    process.exit(1);
}
export const redisClient= createClient({
    url: redisUrl,
})

redisclient
    .connect()
    .then(()=>console.log("connected to redis"))
    .catch(console.error);

const app = express()

//using middlewares
app.use(express.json());

//using routes
app.use("/api/v1", userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>{
    console.log(`server is running on port no ${PORT}`);
})