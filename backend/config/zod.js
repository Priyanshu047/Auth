import {z} from "zod";

export const registerSchema = z.object({
    name:z.string().min(3,"Name must be 8 characters long"),
    email: z.string().email("invalid email format"),
    password: z.string().min(8,"password should be 8 characters long")
});
