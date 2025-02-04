import { useLogin, usePrivy } from "@privy-io/react-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

import { Button } from "./ui/button";
import { useState } from "react";
import { useNavigate } from "react-router";

export default function Login() {
    const navigate = useNavigate();

    const { authenticated,  user, linkWallet } = usePrivy();
    const { login } = useLogin({
        onComplete: () => {
            if (!user?.wallet?.address) {
                setIsModalOpen(true);
            }
        },
        onError: (error) => {
            console.error("Login error:", error);
        },
    });



    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCreateServerWallet = async () => {
        try {
            // Call your backend API to create a server wallet
            const response = await fetch("/api/create-server-wallet", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId: user?.id }),
            });

            if (!response.ok) {
                throw new Error("Failed to create server wallet");
            }

            const { id, address } = await response.json();
            console.log("Server Wallet Created:", { id, address });

            navigate("/");
            // router.push("/home");
        } catch (error) {
            console.error("Error creating server wallet:", error);
        }
    };

    return (
        <>
            {!authenticated &&
                (
                    <Button className="px-6 py-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors"
                        onClick={login}>
                        Log In
                    </Button>
                )}

            {/* Modal for post-login actions */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Choose an Option</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Button
                            onClick={() => {
                                linkWallet();
                                setIsModalOpen(false);
                                navigate("/");
                            }}
                            className="w-full"
                        >
                            Link External Wallet
                        </Button>
                        <Button
                            onClick={handleCreateServerWallet}
                            className="w-full"
                        >
                            Create Server Wallet
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}