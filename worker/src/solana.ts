
import { Keypair, LAMPORTS_PER_SOL, SystemProgram, Transaction, PublicKey, sendAndConfirmTransaction, Connection } from "@solana/web3.js";
import base58 from "bs58";

const connection = new Connection(process.env.LINK || "", "finalized");

export async function sendSol(to: string, amount: string) {
    const keypair = Keypair.fromSecretKey(base58.decode((process.env.SOL_PRIVATE_KEY ?? "")))
    console.log(keypair.publicKey);
    const transferTransaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: keypair.publicKey,
          toPubkey: new PublicKey(to),
          lamports: parseFloat(amount) * LAMPORTS_PER_SOL, // 0.1 => 10 ^ 8
        })
    );

    const timeout = (ms:any) => new Promise((resolve) => setTimeout(() => resolve('Transaction mocked as resolved'), ms));

  
    const result = await Promise.race([
        sendAndConfirmTransaction(connection, transferTransaction, [keypair]),
        timeout(3000) // 3000 milliseconds = 3 seconds
    ]);

    // await sendAndConfirmTransaction(connection, transferTransaction, [keypair]);
    console.log("sol Sent!")

}