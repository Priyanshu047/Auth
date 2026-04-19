import TryCatch from "../middlewares/TryCatch.js";
import sanitize from "mongo-sanitize";
import { registerSchema } from "../config/zod.js";
import { redisClient } from "../index.js";
import {User} from "../models/User.js"
import bcrypt from "bcrypt";
import crypto from "crypto";
import sendMail from "../config/sendMail.js";

export const registerUser = TryCatch(async(req,res)=>{
    const sanitizeBody = sanitize(req.body);
    const validation = registerSchema.safeParse(sanitizeBody);

    if(!validation.success){
        const zodError = validation.error;

        let firstError = "validation.error";
        let allError = [];

        if(zodError.issues && Array.isArray(zodError.issues)){
            allError = zodError.issues.map((issue)=>({
                filed: issue.path ? issue.path.join("."): "unknown",
                message: issue.message || "validation error",
                code: issue.code,
            }));

            firstError = allError[0]?.message || "validation error";
        }
        return res.status(400).json({
             message: firstError,
             error: allError,
        })
    }
    
    const {name, email, password} = validation.data;

    const rateLimtKey = `register-rate-limit:${req.ip}:${email}`;

    if(await redisClient.get(rateLimtKey)){
        return res.status(429).json({
            message:"Too many requests, try again later",
        });
    }

    const exitingUser = await User.findOne({email});
    if(exitingUser){
        return res.status(400).json({
            message:"user already exits",
        });
    }


    const hashPassword = await bcrypt.hash(password, 10);

    const verifyToken = crypto.randomBytes(32).toString("hex");
    const verifykey = `verify:${verifyToken}`;
    const dataToStore = JSON.stringify({
        name, 
        email, 
        password: hashPassword,
    });

    await redisClient.set(verifykey, dataToStore, {EX: 300});

    const subject = "verify your email for account creation ";
    const html = ``

    await sendMail({email, subject, email});


    res.json({
       name,
       email,
       password
    });
});

