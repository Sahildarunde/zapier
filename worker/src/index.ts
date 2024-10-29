require("dotenv").config();
import { PrismaClient } from "@prisma/client";
import { JsonObject } from "@prisma/client/runtime/library";
import { createClient } from "redis";
import { parse } from "./parser";
import { sendEmail } from "./email";
import { sendSol } from "./solana";
import http from 'http';

const PORT = process.env.PORT || 4000;

const prismaClient = new PrismaClient();
const TOPIC_NAME = "zap-events";

// Redis clients with error handlers
const redisSubscriber = createClient({
  url: process.env.REDIS_HOST,
  socket: {
    connectTimeout: 0,
    reconnectStrategy: (retries) => Math.min(retries * 50, 5000),
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
    // Connect Redis clients
    await redisSubscriber.connect();
    await redisPublisher.connect();

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


const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Worker is running');
});

// Start HTTP server
server.listen(PORT, () => {
console.log(`HTTP server running on port ${PORT}`);
});

main().catch((err) => console.error("Error in execution:", err));











































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