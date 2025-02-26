import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, RefreshCcw, User } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';

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
        <div className="min-h-screen bg-background py-8 px-4">
            <div className="max-w-md mx-auto space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-center">
                            {isVoting ? 'Cast your vote' : 'Voting Results'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {isVoting ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="address">Account Address</Label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <Input
                                            type="text"
                                            id="address"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            className="pl-10"
                                            placeholder="Enter your account address"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="vote">Ethereum Pectra Update Month</Label>
                                    <Select value={selectedVote} onValueChange={setSelectedVote}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select month" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="March">March</SelectItem>
                                            <SelectItem value="April">April</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full"
                                >
                                    {loading ? 'Processing...' : 'Submit Vote'}
                                </Button>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-3">
                                    {results && Object.entries(results.votes).map(([candidate, count]) => (
                                        <div key={candidate} className="flex justify-between items-center">
                                            <span className="font-medium text-foreground">{candidate}:</span>
                                            <span className="text-lg text-foreground">{count}</span>
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    onClick={() => setIsVoting(true)}
                                    className="w-full"
                                >
                                    Back to Voting
                                </Button>
                            </div>
                        )}

                        {status.type && (
                            <Alert variant={status.type === 'error' ? 'destructive' : 'default'}>
                                {status.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                                <AlertDescription>{status.message}</AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {/* Always show results card at bottom */}
                {results && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-foreground">Live Results</h2>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={fetchResults}
                                    className="text-muted-foreground hover:text-foreground"
                                    title="Refresh results"
                                >
                                    <RefreshCcw className="h-5 w-5" />
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {Object.entries(results.votes).map(([candidate, count]) => (
                                    <div key={candidate} className="flex justify-between items-center">
                                        <span className="font-medium text-foreground">{candidate}:</span>
                                        <span className="text-lg text-foreground">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}