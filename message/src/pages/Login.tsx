import React, { useState } from 'react'; // Added React import for FormEvent
import { useNavigate, Link } from 'react-router-dom'; // Added Link import
import axios from 'axios';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../store/features/authSlice';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // <-- Added this missing state variable
  
  // Use the typed dispatch hook
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear any previous errors when trying again

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email, password,
      });
      
      // Dispatch the action to update Redux state
      dispatch(setCredentials({ 
        user: response.data.user, 
        token: response.data.token 
      }));
      
      // Set Axios header
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      navigate('/');
    } catch (err: any) {
      // Actually set the error state so the UI updates
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-800">Welcome Back</h2>
        
        {/* Now this will work properly */}
        {error && <div className="p-3 text-sm text-red-500 bg-red-100 rounded">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required 
            />
          </div>
          <button 
            type="submit" 
            className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </form>
        <p className="text-sm text-center text-gray-600">
          Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
};