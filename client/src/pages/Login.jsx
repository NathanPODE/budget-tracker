import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

function Login () {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await fetch('http://localhost:4000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })

            const data = await response.json();

            if(!response.ok) {
                setError(data.error || 'Login failed')
                return
            }

            localStorage.setItem('token', data.token)
            navigate('/transactions')
        } catch (err) {
            console.error(err)
            setError('Could not reach the server')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-sm mx auto mt-16">
            <h1 className="text-2x1 fold-bold mb-6">Log in</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full border rounded px-3 py-2"
                    />
                </div>
                
                <div>
                    <label className="block text-sm fond-medium mb-1">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full border rounded px-3 py-2"
                    />
                </div>

                {error && <p className="text-red-600 text-sm">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white rounded px3 py-2 disabled:opacity-50"
                  >
                    {loading ? 'Logging in...' : 'Log in'}
                </button>
            </form>

            <p className="mt-4 text-sm">
                Don't have an account? <Link to="/register" className="text-blue-600 underline">Register</Link>
            </p>
        </div>
    )
}

export default Login