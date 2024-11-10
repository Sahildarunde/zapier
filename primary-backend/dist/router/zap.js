"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.zapRouter = void 0;
const express_1 = require("express");
const middleware_1 = require("../middleware");
const types_1 = require("../types");
const db_1 = require("../db");
const router = (0, express_1.Router)();
router.get("/getZapRuns", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Route accessed");
    const zapId = req.query.zapId || req.body.id;
    console.log("zapId received:", zapId);
    if (!zapId) {
        return res.status(400).json({
            message: "zapId is required."
        });
    }
    try {
        const zapRuns = yield db_1.prismaClient.zapRun.findMany({
            where: {
                zapId: zapId
            }
        });
        console.log("zapRuns fetched:", zapRuns);
        return res.status(200).json({
            zapRuns
        });
    }
    catch (error) {
        console.error("Error fetching zap runs:", error);
        return res.status(500).json({
            message: "Failed to retrieve zap runs."
        });
    }
}));
router.post("/", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const id = req.id;
    const body = req.body;
    const parsedData = types_1.ZapCreateSchema.safeParse(body);
    if (!parsedData.success) {
        return res.status(411).json({
            message: "Incorrect inputs"
        });
    }
    const zapId = yield db_1.prismaClient.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const zap = yield db_1.prismaClient.zap.create({
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
        });
        const trigger = yield tx.trigger.create({
            data: {
                triggerId: parsedData.data.availableTriggerId,
                zapId: zap.id,
            }
        });
        yield tx.zap.update({
            where: {
                id: zap.id
            },
            data: {
                triggerId: trigger.id
            }
        });
        return zap.id;
    }));
    return res.json({
        zapId
    });
}));
router.put("/:zapId", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const userId = req.id;
    const { zapId } = req.params;
    const body = req.body;
    // Validate the update data using ZapUpdateSchema
    const parsedData = types_1.ZapCreateSchema.safeParse(body);
    if (!parsedData.success) {
        return res.status(400).json({ message: "Invalid update data" });
    }
    try {
        // Use Prisma transaction to handle the update
        yield db_1.prismaClient.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // Check if the zap exists and belongs to the user
            const existingZap = yield tx.zap.findUnique({
                where: { id: zapId },
                include: { actions: true }
            });
            if (!existingZap || existingZap.userId !== parseInt(userId)) {
                return res.status(404).json({ message: "Zap not found or unauthorized" });
            }
            // Update the actions if provided
            if (parsedData.data.actions) {
                // Delete the existing actions
                yield tx.action.deleteMany({
                    where: { zapId: zapId }
                });
                // Create new actions
                yield tx.action.createMany({
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
                const trigger = yield tx.trigger.upsert({
                    where: { zapId: zapId },
                    update: { triggerId: parsedData.data.availableTriggerId },
                    create: {
                        zapId: zapId,
                        triggerId: parsedData.data.availableTriggerId,
                    },
                });
                // Update zap's triggerId field
                yield tx.zap.update({
                    where: { id: zapId },
                    data: { triggerId: trigger.id },
                });
            }
        }));
        return res.status(200).json({ message: "Zap updated successfully" });
    }
    catch (error) {
        console.error("Error updating Zap:", error);
        return res.status(500).json({ message: "Failed to update Zap" });
    }
}));
router.post('/createEmptyZap', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { userId, triggerId } = req.body; // `triggerId` is now optional
        // Validate required fields
        if (!userId) {
            return res.status(400).json({ error: "userId is required" });
        }
        if (!triggerId) {
            triggerId = "";
        }
        // Create an empty Zap entry with only the userId (and triggerId if provided)
        const newZap = yield db_1.prismaClient.zap.create({
            data: {
                userId,
                triggerId, // This will be set to null if not provided
            },
        });
        return res.status(201).json(newZap);
    }
    catch (error) {
        console.error("Error creating empty Zap:", error);
        return res.status(500).json({ error: "Failed to create empty Zap" });
    }
}));
router.get("/", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const id = req.id;
    const zaps = yield db_1.prismaClient.zap.findMany({
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
    });
    return res.status(201).json({
        zaps
    });
}));
router.get("/:zapId", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const id = req.id;
    const zapId = req.params.zapId;
    const zap = yield db_1.prismaClient.zap.findFirst({
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
    });
    return res.status(201).json({
        zap
    });
}));
exports.zapRouter = router;
