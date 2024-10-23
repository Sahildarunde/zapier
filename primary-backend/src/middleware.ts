import { NextFunction ,Request, Response} from "express";
import jwt from "jsonwebtoken"
import { JWT_PASSWORD } from "./config";

export function authMiddleware(req: Request, res: Response, next: NextFunction): any {
    const token = req.headers.authorization as string;

    try {
        const payload = jwt.verify(token, JWT_PASSWORD)  // Type the payload
        // @ts-ignore
        req.id = payload.id; // No error now, as `id` is part of the Request type
        next();
    } catch (error) {
        return res.status(403).json({
            message: "You're not logged in"
        });
    }
}