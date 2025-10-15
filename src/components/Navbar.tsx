import { Link, useNavigate } from 'react-router-dom';
import { Vote, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md border-b-4 border-[#BF0A30]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3">
            <Vote className="w-8 h-8 text-[#002868]" />
            <span className="text-xl font-bold text-[#002868]">Electus</span>
          </Link>

          <div className="flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link to="/" className="text-gray-700 hover:text-[#002868] font-medium transition">
                  Home
                </Link>
                <Link to="/candidates" className="text-gray-700 hover:text-[#002868] font-medium transition">
                  Candidates
                </Link>
                <Link to="/results" className="text-gray-700 hover:text-[#002868] font-medium transition">
                  Results
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="text-gray-700 hover:text-[#002868] font-medium transition">
                    Admin
                  </Link>
                )}
                <div className="flex items-center space-x-3 pl-4 border-l border-gray-300">
                  <div className="flex items-center space-x-2">
                    <UserIcon className="w-5 h-5 text-[#002868]" />
                    <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-[#BF0A30] text-white hover:bg-red-700 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-[#002868] font-medium transition">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-lg bg-[#002868] text-white hover:bg-blue-900 transition font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
