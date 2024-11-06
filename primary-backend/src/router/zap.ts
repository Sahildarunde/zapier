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

router.put("/:zapId", authMiddleware, async (req, res): Promise<any> => {
    // @ts-ignore
    const userId: string = req.id;
    const { zapId } = req.params;
    const body = req.body;

    // Validate the update data using ZapUpdateSchema
    const parsedData = ZapCreateSchema.safeParse(body);

    if (!parsedData.success) {
        return res.status(400).json({ message: "Invalid update data" });
    }

    try {
        // Use Prisma transaction to handle the update
        await prismaClient.$transaction(async (tx) => {
            // Check if the zap exists and belongs to the user
            const existingZap = await tx.zap.findUnique({
                where: { id: zapId },
                include: { actions: true }
            });

            if (!existingZap || existingZap.userId !== parseInt(userId)) {
                return res.status(404).json({ message: "Zap not found or unauthorized" });
            }

            // Update the actions if provided
            if (parsedData.data.actions) {
                // Delete the existing actions
                await tx.action.deleteMany({
                    where: { zapId: zapId }
                });

                // Create new actions
                await tx.action.createMany({
                    data: parsedData.data.actions.map((action, index) => ({
                        zapId: zapId,
                        actionId: action.availableActionId,
                        sortingOrder: index,
                        metadata: action.actionMetadata,
                    }))
                });
            }

            // Update the trigger if provided
            if (parsedData.data.availableTriggerId) {
                const trigger = await tx.trigger.upsert({
                    where: { zapId: zapId },
                    update: { triggerId: parsedData.data.availableTriggerId },
                    create: {
                        zapId: zapId,
                        triggerId: parsedData.data.availableTriggerId,
                    },
                });

                // Update zap's triggerId field
                await tx.zap.update({
                    where: { id: zapId },
                    data: { triggerId: trigger.id },
                });
            }
        });

        return res.status(200).json({ message: "Zap updated successfully" });
    } catch (error) {
        console.error("Error updating Zap:", error);
        return res.status(500).json({ message: "Failed to update Zap" });
    }
});

router.post('/createEmptyZap', async (req, res): Promise<any> => {
    try {
      const { userId, triggerId } = req.body; // `triggerId` is now optional
  
      // Validate required fields
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
  
      // Create an empty Zap entry with only the userId (and triggerId if provided)
      const newZap = await prismaClient.zap.create({
        data: {
          userId,
          triggerId, // This will be set to null if not provided
        },
      });
  
      return res.status(201).json(newZap);
    } catch (error) {
      console.error("Error creating empty Zap:", error);
      return res.status(500).json({ error: "Failed to create empty Zap" });
    }
});
  

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