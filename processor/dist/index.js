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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const redis_1 = require("redis");
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
dotenv_1.default.config();
const TOPIC_NAME = "zap-events";
const client = new client_1.PrismaClient();
const REDIS_HOST = process.env.REDIS_HOST;
const PORT = process.env.PORT || 4000;
const redisClient = (0, redis_1.createClient)({
    url: REDIS_HOST, // This should include the full connection string
});
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // Connect to Redis
        yield redisClient.connect();
        while (true) {
            const pendingRows = yield client.zapRunOutbox.findMany({
                where: {},
                take: 10,
            });
            console.log(pendingRows);
            if (pendingRows.length > 0) {
                yield Promise.all(pendingRows.map(r => {
                    const message = JSON.stringify({ zapRunId: r.zapRunId, stage: 0 });
                    return redisClient.publish(TOPIC_NAME, message);
                }));
                yield client.zapRunOutbox.deleteMany({
                    where: {
                        id: {
                            in: pendingRows.map(x => x.id),
                        },
                    },
                });
            }
            yield new Promise(r => setTimeout(r, 3000));
        }
    });
}
main().catch(err => {
    console.error("Error:", err);
});
const server = http_1.default.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Worker is running');
});
server.listen(PORT, () => {
    console.log(`HTTP server running on port ${PORT}`);
});
// import { PrismaClient } from "@prisma/client";
// import {Kafka} from "kafkajs";
// const TOPIC_NAME = "zap-events"
// const client = new PrismaClient();
// const kafka = new Kafka({
//     clientId: 'outbox-processor',
//     brokers: ['localhost:9092']
// })
// async function main() {
//     const producer =  kafka.producer();
//     await producer.connect();
//     while(1) {
//         const pendingRows = await client.zapRunOutbox.findMany({
//             where :{},
//             take: 10
//         })
//         console.log(pendingRows);
//         producer.send({
//             topic: TOPIC_NAME,
//             messages: pendingRows.map(r => {
//                 return {
//                     value: JSON.stringify({ zapRunId: r.zapRunId, stage: 0 })
//                 }
//             })
//         })  
//         await client.zapRunOutbox.deleteMany({
//             where: {
//                 id: {
//                     in: pendingRows.map(x => x.id)
//                 }
//             }
//         })
//         await new Promise(r => setTimeout(r, 3000));
//     }
// }
// main();
