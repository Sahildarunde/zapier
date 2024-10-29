require("dotenv").config();
import { PrismaClient } from "@prisma/client";
import { JsonObject } from "@prisma/client/runtime/library";
import { createClient } from "redis";
import { parse } from "./parser";
import { sendEmail } from "./email";
import { sendSol } from "./solana";
import express from "express";

const PORT = Number(process.env.PORT) || 3001;


const app = express();
app.use(express.json())

app.get("/", (req, res) => {
    const data = req.body;
    main().catch((err) => console.error("Error in execution:", err));
    res.send({ message: "healthy", data })
})

const prismaClient = new PrismaClient();
const TOPIC_NAME = "zap-events";

// Redis clients with error handlers
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

async function main() {
  try {
    console.log("Connecting to Redis...");
    await redisSubscriber.connect();
    await redisPublisher.connect();
    console.log("Redis clients connected successfully.");

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
          console.log(`Sending email to ${to} with body: ${body}`);
          await sendEmail(to, body);
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


app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening to port ${PORT}`);
});




