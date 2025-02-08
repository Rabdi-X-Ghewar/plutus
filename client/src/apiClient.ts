export const addUserToDatabase = async (user: any) => {
    try {
        const response = await fetch('http://localhost:3001/api/add-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user),
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error adding user:', error);
    }
};

export const fetchWallet = async (email: string) => {
    try {
        const response = await fetch(`http://localhost:3001/api/fetch-wallet/${email}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error adding user:', error);
    }
}


export const sendServerTransaction = async (email: string, to: string, valueInEth: string) => {
    try {
        const response = await fetch('http://localhost:3001/api/send-transaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, to, valueInEth }),
        });
        const result = await response.json();
        return result;
    } catch (error) {
        console.log('Error sending transaction:', error);
    }
}