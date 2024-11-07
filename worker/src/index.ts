import { PrismaClient } from "@prisma/client";
import { JsonObject } from "@prisma/client/runtime/library";
import { createClient } from "redis";
import { parse } from "./parser";
import { sendEmail } from "./email";
import { sendSol } from "./solana";
import dotenv from 'dotenv';
import http from 'http';

dotenv.config();


const PORT = process.env.PORT || 4000;



const prismaClient = new PrismaClient();
const TOPIC_NAME = "zap-events";

let isRedisConnected = false;

const redisSubscriber = createClient({
  url: process.env.REDIS_HOST,
  socket: {
    connectTimeout: 5000,
    reconnectStrategy: (retries) => Math.min(retries * 100, 5000),
  },
});
redisSubscriber.on("error", (err) => console.error("Redis Subscriber Error:", err));

const redisPublisher = createClient({
  url: process.env.REDIS_HOST,
  socket: {
    connectTimeout: 0,
    reconnectStrategy: (retries) => Math.min(retries * 50, 5000),
  },
});
redisPublisher.on("error", (err) => console.error("Redis Publisher Error:", err));

async function connectRedis() {
  if (!isRedisConnected) {
    await redisSubscriber.connect();
    await redisPublisher.connect();
    isRedisConnected = true;
    console.log("Redis clients connected successfully.");
  } else {
    console.log("Redis is already connected.");
  }
}
async function main() {
  try {
    console.log("Connecting to Redis...");
    await connectRedis();
    // Subscribe to messages
    await redisSubscriber.subscribe(TOPIC_NAME, async (message: string) => {
      console.log("Received message:", message);

      if (!message) {
        console.error("Received empty message");
        return;
      }

      const parsedValue = JSON.parse(message);
      const zapRunId = parsedValue.zapRunId;
      const stage = parsedValue.stage;

      const zapRunDetails = await prismaClient.zapRun.findFirst({
        where: { id: zapRunId },
        include: {
          zap: {
            include: { actions: { include: { type: true } } },
          },
        },
      });

      const currentAction = zapRunDetails?.zap.actions.find((x) => x.sortingOrder === stage);
      if (!currentAction) {
        console.error("Current action not found for stage:", stage);
        return;
      }

      const zapRunMetadata = zapRunDetails?.metadata;

      try {
        if (currentAction.type.id === "email") {
          const body = parse((currentAction.metadata as JsonObject)?.body as string, zapRunMetadata);
          const to = parse((currentAction.metadata as JsonObject)?.email as string, zapRunMetadata);
          const subject = parse((currentAction.metadata as JsonObject)?.subject as string, zapRunMetadata);
          const from = parse((currentAction.metadata as JsonObject)?.from as string, zapRunMetadata);
          console.log(`Sending email to ${to} with body: ${body}`);
          await sendEmail(to, body, subject, from);
        } else if (currentAction.type.id === "send-sol") {
          const amount = parse((currentAction.metadata as JsonObject)?.amount as string, zapRunMetadata);
          const address = parse((currentAction.metadata as JsonObject)?.address as string, zapRunMetadata);
          console.log(`Sending SOL of ${amount} to address ${address}`);
          await sendSol(address, amount);
        }

        await new Promise((r) => setTimeout(r, 500));

        const lastStage = (zapRunDetails?.zap.actions.length || 1) - 1;
        if (lastStage !== stage) {
          console.log("Pushing next stage to the queue");
          await redisPublisher.publish(TOPIC_NAME, JSON.stringify({ stage: stage + 1, zapRunId }));
        }

        console.log("Processing done");
      } catch (actionError) {
        console.error("Error in processing action:", actionError);
      }
    });
  } catch (error) {
    console.error("Error in main function:", error);
  }
}




main().catch((err) => console.error("Error in execution:", err));




const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
      main().catch(err => {
          console.error("Error:", err);
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'healthy' }));
  } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`HTTP server running on port ${PORT}`);
});




