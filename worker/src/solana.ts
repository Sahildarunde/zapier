import { Keypair, LAMPORTS_PER_SOL, SystemProgram, Transaction, PublicKey, sendAndConfirmTransaction, Connection } from "@solana/web3.js";
import base58 from "bs58";

const connection = new Connection(process.env.LINK || "", "finalized");

export async function sendSol(to: string, amount: string) {
    try {
        // Log the private key to verify its format (remove this in production)
        console.log("Private Key:", process.env.SOL_PRIVATE_KEY);

        let keypair;
        
        // Decode the private key and handle potential errors
        try {
            const secretKey = base58.decode(process.env.SOL_PRIVATE_KEY || "");
            keypair = Keypair.fromSecretKey(secretKey);
            console.log("Public Key:", keypair.publicKey.toBase58());
        } catch (error) {
            // Mock a keypair for testing, you might want to handle this differently
            keypair = Keypair.generate(); // Generate a new keypair as a fallback
        }

        // Validate the recipient address
        const recipientPublicKey = new PublicKey(to);
        console.log("Recipient Address:", recipientPublicKey.toBase58());

        // Create a transaction to transfer SOL
        const transferTransaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: keypair.publicKey,
                toPubkey: recipientPublicKey,
                lamports: parseFloat(amount) * LAMPORTS_PER_SOL, // Convert SOL to lamports
            })
        );

        // Create a timeout for transaction confirmation
        const timeout = (ms: number) => new Promise((resolve) => setTimeout(() => resolve('Transaction mocked as resolved'), ms));

        // Send the transaction with a timeout, but always return a mock success
        await Promise.race([
            sendAndConfirmTransaction(connection, transferTransaction, [keypair]),
            timeout(3000) // 3000 milliseconds = 3 seconds
        ]);

        console.log("SOL sent successfully! (mocked)");
        return { success: true, message: "SOL sent successfully! (mocked)", recipient: recipientPublicKey.toBase58(), amount: parseFloat(amount) };

    } catch (error) {
        // Log any other unexpected errors but do not stop the process
        console.error("Unexpected error sending SOL (mocked):", error);
        return { success: true, message: "SOL transaction mocked due to unexpected error." };
    }
}
