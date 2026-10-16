import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Transactions() {
    const[transactions, setTransactions] = useState([]);
    const[loading, setLoading] = useState(true);
    const[catLoading, setCatLoading] = useState(true)
    const[error, setError] = useState('');
    const[categories, setCategories] = useState([]);

    const [type, setType] = useState('expense');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deletingError, setDeletingError] = useState('')
    const [catName, setCatName] = useState('')
    const [catFormError, setCatFormError] = useState('')
    const [catSubmitting, setCatSubmitting] = useState(false)
    const [categoryId, setCategoryId] = useState('')
    const [editingId, setEditingId] = useState(null)
    const [editAmount, setEditAmount] = useState('')
    const [editDescription, setEditDescription] = useState('')
    const [editType, setEditType] = useState('')

    const navigate = useNavigate();
    

    useEffect(() => {
        async function loadTransactions() {
            const token = localStorage.getItem('token');
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

    useEffect(() => {
        async function loadCategories (){
            const token = localStorage.getItem('token')
            try {
                const response = await fetch('http://localhost:4000/api/categories', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = await response.json();

                if (!response.ok){
                    setError(data.error || 'Faliled to load categories')
                    return
                }

                setCategories(data.categories)
            } catch (err) {
                console.error(err)
                setError('Failed to reach server')
            } finally {
                setCatLoading(false);
            }
        }
        
        loadCategories()
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
                body: JSON.stringify({ 
                    type, 
                    amount, 
                    description, 
                    categoryId: categoryId === '' ? null : categoryId }),
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
            setCategoryId('')
        } catch (err) {
            console.error(err);
            setFormError('Could not reach the server')
        } finally {
            setSubmitting(false);
        }
    }

    async function handleAddCategories(e){
        e.preventDefault()
        setCatFormError('')
        setCatSubmitting(true)

        try {
            const token = localStorage.getItem('token')

            const response = await fetch('http://localhost:4000/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`},
                body: JSON.stringify({ name: catName })
            })

            const data = await response.json()

            if(!response.ok){
                setCatFormError(data.error || 'Category failed')
                return
            }

            setCategories([...categories, data.category])
            setCatName('')
        } catch (err) {
            console.error(err)
            setCatFormError('Could not reach server')
        } finally {
            setCatSubmitting(false)
        }
    }

    async function handleDeleteTransactions(id){
        setDeletingError('');
        setDeleting(true);

        try {
            const token = localStorage.getItem('token');

            const response = await fetch(`http://localhost:4000/api/transactions/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}`},
            });

            if(!response.ok){
                const data = await response.json().catch(() => ({}))
                setDeletingError(data.error || 'Deletion failed');
                return;
            }

            setTransactions(transactions.filter((t) => t.id !== id));
        } catch (err) {
            console.error(err);
            setDeletingError('Could not reach server')
        } finally {
            setDeleting(false);
        }
    }

    function startEditing(t) {
        setEditingId(t.id)
        setEditAmount(t.amount)
        setEditDescription(t.description || '')
        setEditType(t.type)
    }

    function cancelEdit(){
        setEditingId(null)
    }

    async function saveEdit(){
        setFormError('')
        setSubmitting(true)
        
        try{
            const token = localStorage.getItem('token')

            const repsonse = await fetch(`http://localhost:4000/api/transactions/${editingId}`,{
                method: 'PATCH',
                headers: {'Content-Type': 'application/json', Authorization: `Bearer ${token}`},
                body: JSON.stringify({ amount: editAmount, description: editDescription, type: editType })
            })

            const data = await response.json()

            if(!response.ok){
                setFormError(data.error || 'Update failed')
                return
            }

            setTransactions(
                transactions.map((t) => (t.id === editingId ? data.transactions : t))
            )
            setEditingId(null);
        } catch (err) {
            console.error(err)
            setFormError('Could not reach the server')
        } finally {
            setSubmitting(false)
        }
    }

    function handleLogout(){
        localStorage.removeItem('token')
        navigate('/login')
    } 

    if(loading) {
        return <p className="text-center mt-16">Loading...</p>
    }
    
    if(catLoading){
        return <p className="text-center mt-16">Loading...</p>
    }

    return (
        <div className="max-w-2xl mx-auto mt-16 px-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Your Transactions</h1>
                <button
                 onClick={handleLogout}
                 className="text-sm text-gray-500 hover:text-red-600"
                >Log out
                </button>
            </div>

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

                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="border rounded px-2 py-1"
                >
                    <option value="">No category</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>

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

            {deletingError && <p className="text-red-600 text-sm mb-4">{deletingError}</p>}
            {transactions.length === 0 ? (
               <p className="text-gray-500">No transactions yet</p>
            ) : (
               <ul className="space-y-2">
                    {transactions.map((t) => {
                        const category = categories.find((c) => c.id === t.category_id)

                        if (t.id === editingId) {
                            return (
                                <li
                                key={t.id}
                                className="border rounded px-4 py-2 space-y-2"
                                >
                                    <div className="flex gap-3">
                                        <select
                                        value={editType}
                                        onChange={(e) => setEditType(e.target.value)}
                                        className="border rounded px-2 py-1"
                                        >
                                            <option value="expense">Expense</option>
                                            <option value="income">Income</option>
                                        </select>

                                        <input
                                        type="number"
                                        step="0.01"
                                        value={editAmount}
                                        onChange={(e) => setEditAmount(e.target.value)}
                                        className="border rounded px-2 py-1 flex-1"
                                        />
                                    </div>

                                    <input
                                    type="text"
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    placeholder="Description (optional)"
                                    className="w-full border rounded px-2 py-1"
                                    />

                                    {formError && <p className="text-red-600 text-sm">{formError}</p>}

                                    <div className="flex gap-2">
                                        <button
                                        onClick={saveEdit}
                                        disabled={submitting}
                                        className="bg-blue-600 text-white rounded px-3 py-1 text-sm disabled:opacity-50"
                                        >
                                            {submitting ? 'Saving...' : 'Save'}
                                        </button>
                                        <button
                                        onClick={cancelEdit}
                                        className="text-sm text-gray-500"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </li>
                            )
                        }

                        return (
                            <li
                            key={t.id}
                            className="flex justify-between border rounded px-4 py-2"
                            >
                                <div>
                                    <p className="font-medium">{t.description || '(no description)'}</p>
                                    <p className="text-sm text-gray-500">{t.transaction_date}{category && ` · ${category.name}`}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <p
                                    className={
                                        t.type === 'income'
                                        ? 'text-green-600 font-medium'
                                        : 'text-red-600 font-medium'
                                    }
                                    >
                                        {t.type === 'income' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                                    </p>
                                    <button
                                    onClick={() => startEditing(t)}
                                    className="text-sm text-gray-400 hover:text-blue-600"
                                    >
                                        Edit
                                    </button>
                                    <button
                                    onClick={() => handleDeleteTransactions(t.id)}
                                    disabled={deleting}
                                    className="text-sm text-gray-400 hover:text-red-600 disabled:opacity-50"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            ) 
            }

            <form onSubmit={handleAddCategories} className="space-y-3 mb-8 border rounded p-4">
            <input
                type="text"
                placeholder="Category name"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                required
                className="w-full border rounded px-2 py-1"
            />

            {catFormError && <p className="text-red-600 text-sm">{catFormError}</p>}

            <button
                type="submit"
                disabled={catSubmitting}
                className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
            >
                {catSubmitting ? 'Adding...' : 'Add Category'}
            </button>
            </form>
        </div>
    )
}

export default Transactions;