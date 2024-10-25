
import { PrismaClient } from "@prisma/client";
const prismaClient = new PrismaClient();

async function main() {
    await prismaClient.availableTrigger.create({
        data: {
            id: "webhook",
            name: "Webhook",
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjWUr0rIHZc1vGIRVuGE-lNIDgNInEgStJpQ&s",
            
        }
    })    

    await prismaClient.availableAction.create({
        data: {
            id: "send-sol",
            name: "Send Solana",
            image: "https://pbs.twimg.com/profile_images/1472933274209107976/6u-LQfjG_400x400.jpg"
        }
    })

    await prismaClient.availableAction.create({
        data: {
            id: "email",
            name: "Send Email",
            image: "https://i.pinimg.com/736x/4a/9b/2a/4a9b2ae4384f3e4093f4f1c63e40fb50.jpg"
        }
    })
    
}

main();