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
require('dotenv').config();
const client_1 = require("@prisma/client");
const redis_1 = require("redis");
const parser_1 = require("./parser");
const email_1 = require("./email");
const solana_1 = require("./solana");
const prismaClient = new client_1.PrismaClient();
const TOPIC_NAME = "zap-events";
const redisSubscriber = (0, redis_1.createClient)({
    url: process.env.REDIS_HOST,
    socket: {
        // No connect timeout
        connectTimeout: 0,
        // This will allow the connection to be retried indefinitely
        reconnectStrategy: (retries) => {
            return Math.min(retries * 50, 5000); // Exponential backoff
        },
    },
});
const redisPublisher = (0, redis_1.createClient)({
    url: process.env.REDIS_HOST,
    socket: {
        // No connect timeout
        connectTimeout: 0,
        // This will allow the connection to be retried indefinitely
        reconnectStrategy: (retries) => {
            return Math.min(retries * 50, 5000); // Exponential backoff
        },
    },
});
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield redisSubscriber.connect();
            yield redisPublisher.connect();
            yield redisSubscriber.subscribe(TOPIC_NAME, (message) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e;
                console.log("Received message:", message);
                if (!message) {
                    return;
                }
                const parsedValue = JSON.parse(message);
                const zapRunId = parsedValue.zapRunId;
                const stage = parsedValue.stage;
                const zapRunDetails = yield prismaClient.zapRun.findFirst({
                    where: {
                        id: zapRunId,
                    },
                    include: {
                        zap: {
                            include: {
                                actions: {
                                    include: {
                                        type: true,
                                    },
                                },
                            },
                        },
                    },
                });
                const currentAction = zapRunDetails === null || zapRunDetails === void 0 ? void 0 : zapRunDetails.zap.actions.find(x => x.sortingOrder === stage);
                if (!currentAction) {
                    console.log("Current action not found?");
                    return;
                }
                const zapRunMetadata = zapRunDetails === null || zapRunDetails === void 0 ? void 0 : zapRunDetails.metadata;
                // Handle email action
                if (currentAction.type.id === "email") {
                    const body = (0, parser_1.parse)((_a = currentAction.metadata) === null || _a === void 0 ? void 0 : _a.body, zapRunMetadata);
                    const to = (0, parser_1.parse)((_b = currentAction.metadata) === null || _b === void 0 ? void 0 : _b.email, zapRunMetadata);
                    console.log(`Sending out email to ${to} body is ${body}`);
                    yield (0, email_1.sendEmail)(to, body);
                }
                // Handle send-sol action
                if (currentAction.type.id === "send-sol") {
                    const amount = (0, parser_1.parse)((_c = currentAction.metadata) === null || _c === void 0 ? void 0 : _c.amount, zapRunMetadata);
                    const address = (0, parser_1.parse)((_d = currentAction.metadata) === null || _d === void 0 ? void 0 : _d.address, zapRunMetadata);
                    console.log(`Sending out SOL of ${amount} to address ${address}`);
                    try {
                        yield (0, solana_1.sendSol)(address, amount);
                    }
                    catch (error) {
                        console.error("Error sending SOL (mocked):");
                        // Continue processing even if there was an error
                    }
                }
                // Wait for a bit before processing the next stage
                yield new Promise(r => setTimeout(r, 500));
                const lastStage = (((_e = zapRunDetails === null || zapRunDetails === void 0 ? void 0 : zapRunDetails.zap.actions) === null || _e === void 0 ? void 0 : _e.length) || 1) - 1; // 1
                console.log(lastStage);
                console.log(stage);
                if (lastStage !== stage) {
                    console.log("pushing back to the queue");
                    try {
                        yield redisPublisher.publish(TOPIC_NAME, JSON.stringify({
                            stage: stage + 1,
                            zapRunId,
                        }));
                    }
                    catch (error) {
                        console.error("Error publishing to Redis:", error);
                        // Handle redis publishing error without breaking the process
                    }
                }
                console.log("processing done");
            }));
        }
        catch (error) {
            console.error("Error in main function:", error);
        }
    });
}
main().catch(err => {
    console.error("Error:", err);
});
// require('dotenv').config()
// import { PrismaClient } from "@prisma/client";
// import { JsonObject } from "@prisma/client/runtime/library";
// import { Kafka } from "kafkajs";
// import { parse } from "./parser";
// import { sendEmail } from "./email";
// import { sendSol } from "./solana";
// const prismaClient = new PrismaClient();
// const TOPIC_NAME = "zap-events"
// const kafka = new Kafka({
//     clientId: 'outbox-processor-2',
//     brokers: ['localhost:9092']
// })
// async function main() {
//     const consumer = kafka.consumer({ groupId: 'main-worker-2' });
//     await consumer.connect();
//     const producer =  kafka.producer();
//     await producer.connect();
//     await consumer.subscribe({ topic: TOPIC_NAME, fromBeginning: true })
//     await consumer.run({
//         autoCommit: false,
//         eachMessage: async ({ topic, partition, message }) => {
//           console.log({
//             partition,
//             offset: message.offset,
//             value: message.value?.toString(),
//           })
//           if (!message.value?.toString()) {
//             return;
//           }
//           const parsedValue = JSON.parse(message.value?.toString());
//           const zapRunId = parsedValue.zapRunId;
//           const stage = parsedValue.stage;
//           const zapRunDetails = await prismaClient.zapRun.findFirst({
//             where: {
//               id: zapRunId
//             },
//             include: {
//               zap: {
//                 include: {
//                   actions: {
//                     include: {
//                       type: true
//                     }
//                   }
//                 }
//               },
//             }
//           });
//           const currentAction = zapRunDetails?.zap.actions.find(x => x.sortingOrder === stage);
//           if (!currentAction) {
//             console.log("Current action not found?");
//             return;
//           }
//           const zapRunMetadata = zapRunDetails?.metadata;
//           if (currentAction.type.id === "email") {
//             const body = parse((currentAction.metadata as JsonObject)?.body as string, zapRunMetadata);
//             const to = parse((currentAction.metadata as JsonObject)?.email as string, zapRunMetadata);
//             console.log(`Sending out email to ${to} body is ${body}`)
//             await sendEmail(to, body);
//           }
//           if (currentAction.type.id === "send-sol") {
//             const amount = parse((currentAction.metadata as JsonObject)?.amount as string, zapRunMetadata);
//             const address = parse((currentAction.metadata as JsonObject)?.address as string, zapRunMetadata);
//             console.log(`Sending out SOL of ${amount} to address ${address}`);
//             await sendSol(address, amount);
//           }
//           // 
//           await new Promise(r => setTimeout(r, 500));
//           const lastStage = (zapRunDetails?.zap.actions?.length || 1) - 1; // 1
//           console.log(lastStage);
//           console.log(stage);
//           if (lastStage !== stage) {
//             console.log("pushing back to the queue")
//             await producer.send({
//               topic: TOPIC_NAME,
//               messages: [{
//                 value: JSON.stringify({
//                   stage: stage + 1,
//                   zapRunId
//                 })
//               }]
//             })  
//           }
//           console.log("processing done");
//           // 
//           await consumer.commitOffsets([{
//             topic: TOPIC_NAME,
//             partition: partition,
//             offset: (parseInt(message.offset) + 1).toString() // 5
//           }])
//         },
//       })
// }
// main()
