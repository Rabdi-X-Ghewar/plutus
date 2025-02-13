import React, { useState } from "react";
import axios from "axios";

interface VoteFormProps {
    onViewResults: () => void;
}

const VoteForm: React.FC<VoteFormProps> = ({ onViewResults }) => {
    const [address, setAddress] = useState<string>("");
    const [vote, setVote] = useState<string>("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:3002/api/vote", {
                address,
                vote,
            });
            alert(response.data.message);
        } catch (error: any) {
            alert(error.response?.data?.error || "An error occurred.");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Cast Your Vote</h2>
            <label>
                Account Address:
                <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                />
            </label>
            <br />
            <label>
                Choose your candidate:
                <select
                    value={vote}
                    onChange={(e) => setVote(e.target.value)}
                    required
                >
                    <option value="">--Select--</option>
                    <option value="March">March</option>
                    <option value="April">April</option>
                </select>
            </label>
            <br />
            <button type="submit">Submit Vote</button>
            <button type="button" onClick={onViewResults}>
                View Results
            </button>
        </form>
    );
};

export default VoteForm;