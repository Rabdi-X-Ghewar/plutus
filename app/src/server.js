const express = require("express");
const bodyParser = require("body-parser");
const { generateProof } = require("./generateProof.js");
const { verify } = require("./zkverify.js");
const { download } = require("./saveToFile.js");
const appRoot = require("app-root-path");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

// Initialize Express apps
const votingApp = express();
const resultsApp = express();

// Define Ports
const VOTING_PORT = 3002;
const RESULTS_PORT = 3003;

// Middleware
votingApp.use(cors());
votingApp.use(bodyParser.json());
votingApp.use(bodyParser.urlencoded({ extended: true }));
resultsApp.use(cors());

// Define Candidate Mappings
const candidateMap = {
    "March": 0,
    "April": 1
};



// Path to votingResults.json
const votingResultsPath = path.join(appRoot.path, "votingResults.json");

// Initialize votingResults.json if it doesn't exist
if (!fs.existsSync(votingResultsPath)) {
    const initialResults = {
        votes: {
            "March": 0,
            "April": 0
        },
        votingID: "initialVotingID",
        spentTickets: {}
    };
    fs.writeFileSync(votingResultsPath, JSON.stringify(initialResults, null, 2), "utf8");
}

// Handle Vote Submission
votingApp.post("/api/vote", async (req, res) => {
    const addr = req.body.address;
    const vote = req.body.vote;

    // Input Validation
    if (!addr || !vote) {
        return res.status(400).json({
            error: "Error: Address and vote are required."
        });
    }

    try {
        // Validate Vote Choice
        if (!(vote in candidateMap)) {
            throw new Error("Invalid vote choice.");
        }

        // Convert Candidate Name to Numerical Vote
        const numericalVote = candidateMap[vote];

        // Run the Voting Process with Numerical Vote
        const { proof, publicSignals } = await generateProof(addr, numericalVote);

        const ticket = {
            proof: proof,
            publicSignals: publicSignals,
        };

        // Save the Ticket Locally (Optional)
        await download(ticket, "ticket");

        // Read Voting Results
        const resultData = fs.readFileSync(votingResultsPath, "utf8");
        const result = JSON.parse(resultData);

        const votingID = publicSignals[0];
        const nullifier = publicSignals[1];

        // Verify the Voting ID Matches
        if (result.votingID !== votingID) {
            throw new Error("Mismatched votingID. Voting session integrity compromised.");
        }

        // Verify the Proof
        const isValid = await verify(proof, publicSignals);
        if (!isValid) {
            throw new Error("Proof verification failed. Vote not recorded.");
        }

        // Update the Vote Count for the Selected Candidate
        if (vote === "March" || vote === "April") {
            result.votes[vote] += 1;
        } else {
            throw new Error("Invalid vote choice.");
        }

        // Mark the Ticket as Spent
        result.spentTickets[nullifier] = 1;

        // Save the Updated Voting Results
        fs.writeFileSync(votingResultsPath, JSON.stringify(result, null, 2), "utf8");

        res.json({ success: true, message: "Vote cast successfully!" });
    } catch (error) {
        let errorMessage = error.message;

        if (errorMessage.includes("Nullifier already used")) {
            errorMessage = "Ticket already spent. Vote not recorded.";
        }

        res.status(400).json({ error: errorMessage });
    }
});

// Get Results
resultsApp.get("/api/results", (req, res) => {
    try {
        const resultData = fs.readFileSync(votingResultsPath, "utf8");
        const result = JSON.parse(resultData);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: "Error reading voting results" });
    }
});

// Start both servers
votingApp.listen(VOTING_PORT, () => {
    console.log(`Voting server is running on http://localhost:${VOTING_PORT}`);
});

resultsApp.listen(RESULTS_PORT, () => {
    console.log(`Results server is running on http://localhost:${RESULTS_PORT}`);
});