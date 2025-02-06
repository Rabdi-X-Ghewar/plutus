import { PrivyClient } from "@privy-io/server-auth";
import { createWalletClient, http, parseEther } from "viem";
import { createViemAccount } from '@privy-io/server-auth/viem';
import { sepolia } from 'viem/chains';
import { ethers } from "ethers";
import { User } from "../models/User";

const privy = new PrivyClient(
    'cm6m2x54x009tkqmmiupwl2eg',
    '5x9hnFZ7NJhVhZkAidxABCfcewb6VQENdtHEZyPvcqwUcwRsEveVfpBc9svYD2i17ZKLKPKCyEk53HEQtV9s59ZU',
    {
        walletApi: {
            authorizationPrivateKey: 'wallet-auth:MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgiNhlIWPT9yr/XRmb3qgssVWSr91E4XX8X62HbPVAMi+hRANCAARx5wcOumvPh0Yweqsum+7NvlQoTC2qL1XoCio+JxBe8nL3fB4KorklityyACRqAdnd7sXoBr414dJbXBB5rBgm'
        }
    }
);


export async function createWallet(email: string): Promise<{ id: string; address: string; chainType: string }> {

    try {
        const user = await User.findOne({ email });
        console.log(email);
        if (!user) {
            throw new Error('User not found');
        }

        if (user.serverWallet?.id) {
            throw new Error('User already has a server wallet');
        }
        const { id, address, chainType } = await privy.walletApi.create({
            chainType: 'ethereum',
            // options: {
            //     walletApi: {
            //         authorizationPrivateKey: 'wallet-auth:MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgiNhlIWPT9yr/XRmb3qgssVWSr91E4XX8X62HbPVAMi+hRANCAARx5wcOumvPh0Yweqsum+7NvlQoTC2qL1XoCio+JxBe8nL3fB4KorklityyACRqAdnd7sXoBr414dJbXBB5rBgm'
            //     }
            // }
        });


        user.serverWallet = {
            id,
            address,
            chainType
        };
        await user.save();
        return { id, address, chainType };
    } catch (error) {
        console.error('Error creating wallet:', error);
        throw error;
    }
}


export async function signMessage(
    email: string,
    message: string
): Promise<string> {
    try {
        const user = await User.findOne({ email });
        if (!user || !user.serverWallet) {
            throw new Error('User does not have a server wallet');
        }

        const { id: walletId, address } = user.serverWallet;

        const account = await createViemAccount({
            walletId,
            address: address as `0x${string}`,
            privy,
        });

        const client = createWalletClient({
            account,
            chain: sepolia,
            transport: http(),
        });

        const signature = await client.signMessage({
            message,
            account,
        });

        return signature;
    } catch (error) {
        console.error('Error signing message:', error);
        throw error;
    }
}


export async function sendTransaction(
    email: string,
    to: `0x${string}`,
    valueInEth: number
): Promise<`0x${string}`> {
    try {
        const user = await User.findOne({ email });
        if (!user || !user.serverWallet) {
            throw new Error('User does not have a server wallet');
        }
        const { id: walletId, address } = user.serverWallet;
        const account = await createViemAccount({
            walletId,
            address: address as `0x${string}`,
            privy,
        });

        const client = createWalletClient({
            account,
            chain: sepolia,
            transport: http(),
        });

        const hash = await client.sendTransaction({
            to,
            value: parseEther(valueInEth.toString()),
            account,
        });

        console.log('Transaction Sent:', hash);
        return hash;
    } catch (error) {
        console.error('Error sending transaction:', error);
        throw error;
    }
}


export async function fetchWallet(email: string): Promise<any> {
    try {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('No User ');
        }
        let wallet;
        if (!user.serverWallet?.id) {
            console.log("No server wallet");
            wallet = await createWallet(email);
        } else {
            console.log("Server wallet exists");
            console.log(user.serverWallet);
            const { id: walletId, address, chainType } = user.serverWallet!;
            wallet = { walletId, address, chainType };
        }
        return wallet;
    } catch (error: any) {
        console.error('Error fetching balance:', error.message);
        throw error;
    }
}
