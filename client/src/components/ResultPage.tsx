import React, { useEffect, useState } from "react";
import axios from "axios";

interface VotingResults {
    votes: {
        "March": number;
        "April": number;
    };
    votingID: string;
    spentTickets: Record<string, number>;
}

const ResultsPage: React.FC = () => {
    const [results, setResults] = useState<VotingResults | null>(null);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const response = await axios.get("http://localhost:3002/api/results");
                setResults(response.data);
            } catch (error: any) {
                alert(error.response?.data?.error || "Failed to fetch results.");
            }
        };
        fetchResults();
    }, []);

    if (!results) {
        return <p>Loading results...</p>;
    }

    return (
        <div>
            <h2>Voting Results</h2>
            <p>March: {results.votes["March"]}</p>
            <p>April: {results.votes["April"]}</p>
        </div>
    );
};

export default ResultsPage;