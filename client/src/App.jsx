import { Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Transactions from './pages/Transactions';

function App() {
  return (
    <Routes>
      <Route path="/" element={<h1 className="text-3xl font-bold text-blue-600">Home</h1>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/transactions" element={<Transactions />} />
    </Routes>
  )
}

export default App;