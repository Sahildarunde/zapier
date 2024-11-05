import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware";
import { ZapCreateSchema } from "../types";
import { prismaClient } from "../db";

const router = Router();

router.get("/getZapRuns", async (req, res): Promise<any> => {
    console.log("Route accessed");

   
    const zapId = req.query.zapId || req.body.id;
    console.log("zapId received:", zapId);

    if (!zapId) {
        return res.status(400).json({
            message: "zapId is required."
        });
    }

    try {
        const zapRuns = await prismaClient.zapRun.findMany({
            where: {
                zapId: zapId
            }
        });

        console.log("zapRuns fetched:", zapRuns);

        return res.status(200).json({
            zapRuns
        });
    } catch (error) {
        console.error("Error fetching zap runs:", error);
        return res.status(500).json({
            message: "Failed to retrieve zap runs."
        });
    }
});


router.post("/",authMiddleware,  async (req, res): Promise<any> => {
     // @ts-ignore
     const id: string = req.id;

    const body = req.body;
    const parsedData = ZapCreateSchema.safeParse(body);

    if(!parsedData.success){
        return res.status(411).json({
            message: "Incorrect inputs"
        })
    }

    const zapId = await prismaClient.$transaction(async tx => {
        const zap = await prismaClient.zap.create({
            data: {
                userId: parseInt(id),
                triggerId: "",
                actions: {
                    create: parsedData.data.actions.map((x, index) => ({
                        actionId: x.availableActionId,
                        sortingOrder: index,
                        metadata: x.actionMetadata
                    }))
                }
            }
        })

        const trigger = await tx.trigger.create({
            data: {
                triggerId: parsedData.data.availableTriggerId,
                zapId: zap.id,
            }
        });

        await tx.zap.update({
            where: {
                id: zap.id
            },
            data: {
                triggerId: trigger.id
            }
        })

        return zap.id;
    })

    return res.json({
        zapId
    })
    
})

router.get("/", authMiddleware, async (req, res): Promise<any> => {

    // @ts-ignore
    const id:string = req.id;


    const zaps = await prismaClient.zap.findMany({
        where: {
            userId: parseInt(id)
        },
        include: {
            actions: {
                include: {
                    type: true
                }
            },
            trigger: {
                include: {
                    type: true
                }
            }
        }
    })

    return res.status(201).json({
        zaps
    })
})

router.get("/:zapId", authMiddleware, async (req, res): Promise<any> => {
    // @ts-ignore
    const id:string = req.id;
    const zapId = req.params.zapId;


    const zap = await prismaClient.zap.findFirst({
        where: {
            id: zapId,
            userId: parseInt(id)
        },
        include: {
            actions: {
                include: {
                    type: true
                }
            },
            trigger: {
                include: {
                    type: true
                }
            }
        }
    })

    return res.status(201).json({
        zap
    })
})



export const zapRouter = router;