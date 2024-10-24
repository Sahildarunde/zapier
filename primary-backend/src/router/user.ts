import { Router, Request, Response } from 'express';
import { prismaClient } from '../db';
import { SignupSchema, SigninSchema } from '../types';
import { authMiddleware } from '../middleware';
import jwt  from 'jsonwebtoken'
import { JWT_PASSWORD } from '../config';

const router = Router()



router.post("/signup", async (req, res): Promise<any>=> {
    const body = req.body;
    const parsedData = SignupSchema.safeParse(body);

    if (!parsedData.success) {
        return res.status(411).json({
            message: "Incorrect inputs"
        })
    }

    const userExists = await prismaClient.user.findFirst({
        where: {
            email: parsedData.data.username
        }
    });

    if (userExists) {
        return res.status(403).json({
            message: "User already exists"
        })
    }

    await prismaClient.user.create({
        data: {
            email: parsedData.data.username,
            password: parsedData.data.password,
            name: parsedData.data.name
        }
    })

    return res.status(201).json({
        message: "Please verify your account by checking your email"
    });

})


router.post("/signin", async (req, res): Promise<any> => {
    const body = req.body;
    const parsedData = SigninSchema.safeParse(body);

    if (!parsedData.success) {
        console.log(parsedData.error);
        return res.status(411).json({
            message: "Incorrect inputs"
        })
    }

    const user = await prismaClient.user.findFirst({
        where: {
            email: parsedData.data.username,
            password: parsedData.data.password
        }
    })

    if(!user){
        return res.status(403).json({
            message: "Incorrect credentials"
        })
    }

    const token = jwt.sign({
        id: user.id
    }, JWT_PASSWORD)

    res.json({
        token: token 
    })
})

router.get("/", authMiddleware, async (req: Request, res:Response): Promise<any> => {
    // fix the the type
    // @ts-ignore
    const id: any = req.id

    const user = await prismaClient.user.findFirst({
        where: {
            id
        },
        select: {
            name: true,
            email: true
        }
    })

    return res.json({
        user
    })
})

export const  userRouter = router;