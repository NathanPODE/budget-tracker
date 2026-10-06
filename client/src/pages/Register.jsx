import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:4000/api/auth/register' , {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if(!response.ok){
                setError(data.error || 'Register failed');
                return;
            }

            navigate('/login', { state: {registered: true } });
        } catch (err) {
            console.error(err);
            setError('Could not reach server');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-sm mx-auto mt-16">
            <h1 className="text-2xl font-bold mb-6">Register</h1>

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
                    <label className="block text-sm font-medium mb-1">Password</label>
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
                  className="w-full bg-blue-600 text-white rounded px-3 py-2 disabled:opacity-50"
                  >
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>

            <p className="mt-4 text-sm">
                Already have an account? <Link to="/login" className="text-blue-600 underline">Login</Link>
            </p>
        </div>
    )

}

export default Register;