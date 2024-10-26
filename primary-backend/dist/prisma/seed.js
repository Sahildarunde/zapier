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
const client_1 = require("@prisma/client");
const prismaClient = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield prismaClient.availableTrigger.create({
            data: {
                id: "webhook",
                name: "Webhook",
                image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjWUr0rIHZc1vGIRVuGE-lNIDgNInEgStJpQ&s",
            }
        });
        yield prismaClient.availableAction.create({
            data: {
                id: "send-sol",
                name: "Send Solana",
                image: "https://pbs.twimg.com/profile_images/1472933274209107976/6u-LQfjG_400x400.jpg"
            }
        });
        yield prismaClient.availableAction.create({
            data: {
                id: "email",
                name: "Send Email",
                image: "https://i.pinimg.com/736x/4a/9b/2a/4a9b2ae4384f3e4093f4f1c63e40fb50.jpg"
            }
        });
    });
}
main();
