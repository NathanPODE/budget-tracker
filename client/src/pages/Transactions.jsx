import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Transactions() {
    const[transactions, setTransactions] = useState([]);
    const[loading, setLoading] = useState(true);
    const[error, setError] = useState('');

    const [type, setType] = useState('expense');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        async function loadTransactions() {
            const token = localStorage.getItem('token')

            if(!token) {
                navigate('/login')
                return
            }

            try {
                const response = await fetch('http://localhost:4000/api/transactions', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = await response.json();

                if (!response.ok) {
                    setError(data.error || 'Failed to load transactions')
                    return
                }

                setTransactions(data.transactions);
            } catch (err) {
                console.error(err);
                setError('Could not reach the server');
            } finally {
                setLoading(false);
            }
        }
        
        loadTransactions()
    }, [navigate])

    async function handleAddTransactions(e) {
        e.preventDefault();
        setFormError('');
        setSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            
            
            const response = await fetch('http://localhost:4000/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`},
                body: JSON.stringify({ type, amount, description }),
            });

            const data = await response.json();

            if(!response.ok){
                setFormError(data.error || 'Transaction failed');
                return;
            }

            setTransactions([...transactions, data.transaction]);

            setType('expense');
            setAmount('');
            setDescription('');
        } catch (err) {
            console.error(err);
            setFormError('Could not reach the server')
        } finally {
            setSubmitting(false);
        }
    }

    if(loading) {
        return <p className="text-center mt-16">Loading...</p>
    }

    return (
        <div className="max-w-2xl mx-auto mt-16 px-4">
            <h1 className="text-2xl font-bold mb-6">Your Transactions</h1>

            <form onSubmit={handleAddTransactions} className="space-y-3 mb-8 border rounded p-4">
                <div className="flex gap-3">
                    <select
                     value={type}
                     onChange={(e) => setType(e.target.value)}
                     className="border rounded px-2 py-1"
                    >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                    </select>

                    <input
                     type="number"
                     step="0.01"
                     placeholder="Amount"
                     value={amount}
                     onChange={(e) => setAmount(e.target.value)}
                     required
                     className="border rounded px-2 py-2 flex-1"
                    />
                </div>

                <input
                 type="text"
                 placeholder="Description (optional)"
                 value={description}
                 onChange={(e) => setDescription(e.target.value)}
                 className="w-full border rounded px-2 py-1"
                />

                {formError && <p className="text-red-600 text-sm">{formError}</p>}

                <button 
                 type="submit"
                 disabled={submitting}
                 className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
                >
                    {submitting ? "Adding..." : "Add Transaction"}
                </button>
            </form>

            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

            {transactions.length === 0 ? (
               <p className="text-gray-500">No transactions yet</p>
            ) : (
                <ul className="space-y-2">
                    {transactions.map((t) => (
                        <li
                         key={t.id}
                         className="flex justify-between border rounded px-4 py-2"
                        >
                            <div>
                                <p className="font-medium">{t.description || '(no description)'}</p>
                                <p className="text-sm text-gray-500">{t.transaction_date}</p>
                            </div>
                            <p
                             className={
                                t.type === 'income'
                                 ? 'text-green-600 font-medium'
                                 : 'text-red-600 font-medium'
                             }
                            >
                                {t.type === 'income' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                            </p>
                        </li>
                    ))}
                </ul>
            ) 
            }
        </div>
    )
}

export default Transactions;