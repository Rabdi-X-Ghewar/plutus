import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, RefreshCcw, User } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

interface VotingResults {
    votes: {
        "March": number;
        "April": number;
    };
    votingID: string;
    spentTickets: Record<string, number>;
}

export default function Governance() {
    const [isVoting, setIsVoting] = useState(true);
    const [address, setAddress] = useState('');
    const [selectedVote, setSelectedVote] = useState('March');
    const [results, setResults] = useState<VotingResults | null>(null);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
        type: null,
        message: ''
    });
    const [loading, setLoading] = useState(false);

    const fetchResults = async () => {
        try {
            const response = await fetch('http://localhost:3003/api/results');
            const data = await response.json();
            setResults(data);
        } catch (error) {
            console.error('Error fetching results:', error);
        }
    };

    useEffect(() => {
        fetchResults();
        const interval = setInterval(fetchResults, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: null, message: '' });

        try {
            const response = await fetch('http://localhost:3002/api/vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ address, vote: selectedVote }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus({ type: 'success', message: data.message });
                fetchResults();
                setAddress('');
                setIsVoting(false);
            } else {
                setStatus({ type: 'error', message: data.error });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Error processing vote' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <div className="max-w-md mx-auto space-y-8">
                <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
                    <h1 className="text-2xl font-bold text-center text-gray-800">
                        {isVoting ? 'Cast your vote' : 'Voting Results'}
                    </h1>

                    {isVoting ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                    Account Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        id="address"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="pl-10 mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-purple-500"
                                        placeholder="Enter your account address"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="vote" className="block text-sm font-medium text-gray-700">
                                    Ethereum Pectra Update Month
                                </label>
                                <select
                                    id="vote"
                                    value={selectedVote}
                                    onChange={(e) => setSelectedVote(e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-purple-500"
                                >
                                    <option value="March">March</option>
                                    <option value="April">April</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : 'Submit Vote'}
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-3">
                                {results && Object.entries(results.votes).map(([candidate, count]) => (
                                    <div key={candidate} className="flex justify-between items-center">
                                        <span className="font-medium">{candidate}:</span>
                                        <span className="text-lg">{count}</span>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => setIsVoting(true)}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                            >
                                Back to Voting
                            </button>
                        </div>
                    )}

                    {status.type && (
                        <Alert variant={status.type === 'error' ? 'destructive' : 'default'}>
                            {status.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                            <AlertDescription>{status.message}</AlertDescription>
                        </Alert>
                    )}
                </div>

                {/* Always show results card at bottom */}
                {results && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Live Results</h2>
                            <button
                                onClick={fetchResults}
                                className="p-2 text-gray-500 hover:text-gray-700"
                                title="Refresh results"
                            >
                                <RefreshCcw className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {Object.entries(results.votes).map(([candidate, count]) => (
                                <div key={candidate} className="flex justify-between items-center">
                                    <span className="font-medium">{candidate}:</span>
                                    <span className="text-lg">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}