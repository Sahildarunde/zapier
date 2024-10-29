import { PrismaClient } from "@prisma/client";
import { createClient } from 'redis';
import dotenv from 'dotenv';
import http from 'http';

dotenv.config();

const TOPIC_NAME = "zap-events";

const client = new PrismaClient();

const REDIS_HOST = process.env.REDIS_HOST;

const PORT = process.env.PORT || 4000;


const redisClient = createClient({
    url: REDIS_HOST, // This should include the full connection string
    
});

async function main() {
    // Connect to Redis
    await redisClient.connect();

    while (true) {
        const pendingRows = await client.zapRunOutbox.findMany({
            where: {},
            take: 10,
        });
        console.log(pendingRows);

        if (pendingRows.length > 0) {
            await Promise.all(pendingRows.map(r => {
                const message = JSON.stringify({ zapRunId: r.zapRunId, stage: 0 });
                return redisClient.publish(TOPIC_NAME, message);
            }));

            await client.zapRunOutbox.deleteMany({
                where: {
                    id: {
                        in: pendingRows.map(x => x.id),
                    },
                },
            });
        }

        await new Promise(r => setTimeout(r, 3000));
    }
}

main().catch(err => {
    console.error("Error:", err);
});


const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
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