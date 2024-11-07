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
const parser_1 = require("./parser");
const email_1 = require("./email");
const solana_1 = require("./solana");
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
dotenv_1.default.config();
const PORT = process.env.PORT || 4000;
const prismaClient = new client_1.PrismaClient();
const TOPIC_NAME = "zap-events";
let isRedisConnected = false;
const redisSubscriber = (0, redis_1.createClient)({
    url: process.env.REDIS_HOST,
    socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries) => Math.min(retries * 100, 5000),
    },
});
redisSubscriber.on("error", (err) => console.error("Redis Subscriber Error:", err));
const redisPublisher = (0, redis_1.createClient)({
    url: process.env.REDIS_HOST,
    socket: {
        connectTimeout: 0,
        reconnectStrategy: (retries) => Math.min(retries * 50, 5000),
    },
});
redisPublisher.on("error", (err) => console.error("Redis Publisher Error:", err));
function connectRedis() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!isRedisConnected) {
            yield redisSubscriber.connect();
            yield redisPublisher.connect();
            isRedisConnected = true;
            console.log("Redis clients connected successfully.");
        }
        else {
            console.log("Redis is already connected.");
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("Connecting to Redis...");
            yield connectRedis();
            // Subscribe to messages
            yield redisSubscriber.subscribe(TOPIC_NAME, (message) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d;
                console.log("Received message:", message);
                if (!message) {
                    console.error("Received empty message");
                    return;
                }
                const parsedValue = JSON.parse(message);
                const zapRunId = parsedValue.zapRunId;
                const stage = parsedValue.stage;
                const zapRunDetails = yield prismaClient.zapRun.findFirst({
                    where: { id: zapRunId },
                    include: {
                        zap: {
                            include: { actions: { include: { type: true } } },
                        },
                    },
                });
                const currentAction = zapRunDetails === null || zapRunDetails === void 0 ? void 0 : zapRunDetails.zap.actions.find((x) => x.sortingOrder === stage);
                if (!currentAction) {
                    console.error("Current action not found for stage:", stage);
                    return;
                }
                const zapRunMetadata = zapRunDetails === null || zapRunDetails === void 0 ? void 0 : zapRunDetails.metadata;
                try {
                    if (currentAction.type.id === "email") {
                        const body = (0, parser_1.parse)((_a = currentAction.metadata) === null || _a === void 0 ? void 0 : _a.body, zapRunMetadata);
                        const to = (0, parser_1.parse)((_b = currentAction.metadata) === null || _b === void 0 ? void 0 : _b.email, zapRunMetadata);
                        console.log(`Sending email to ${to} with body: ${body}`);
                        yield (0, email_1.sendEmail)(to, body);
                    }
                    else if (currentAction.type.id === "send-sol") {
                        const amount = (0, parser_1.parse)((_c = currentAction.metadata) === null || _c === void 0 ? void 0 : _c.amount, zapRunMetadata);
                        const address = (0, parser_1.parse)((_d = currentAction.metadata) === null || _d === void 0 ? void 0 : _d.address, zapRunMetadata);
                        console.log(`Sending SOL of ${amount} to address ${address}`);
                        yield (0, solana_1.sendSol)(address, amount);
                    }
                    yield new Promise((r) => setTimeout(r, 500));
                    const lastStage = ((zapRunDetails === null || zapRunDetails === void 0 ? void 0 : zapRunDetails.zap.actions.length) || 1) - 1;
                    if (lastStage !== stage) {
                        console.log("Pushing next stage to the queue");
                        yield redisPublisher.publish(TOPIC_NAME, JSON.stringify({ stage: stage + 1, zapRunId }));
                    }
                    console.log("Processing done");
                }
                catch (actionError) {
                    console.error("Error in processing action:", actionError);
                }
            }));
        }
        catch (error) {
            console.error("Error in main function:", error);
        }
    });
}
main().catch((err) => console.error("Error in execution:", err));
const server = http_1.default.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        main().catch(err => {
            console.error("Error:", err);
        });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'healthy' }));
    }
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});
server.listen(PORT, () => {
    console.log(`HTTP server running on port ${PORT}`);
});
