import { Routes, Route, Link } from 'react-router-dom'

function App() {
  return (
    <Routes>
       <Route 
        path="/" 
        element={
        <div>
          <h1 className="text-3xl font-bold text-blue-600">Home</h1>
          <Link to="/login" className="text-blue-500 underline">Go to login</Link>
        </div>
        }
      />
      <Route path="/login" element={<h1 className="text-3xl font-bold text-blue-600">Login page</h1>} />
    </Routes>
  )
}

export default App