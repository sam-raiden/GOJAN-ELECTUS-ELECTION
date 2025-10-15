import { Link } from 'react-router-dom';
import { Vote, Shield, BarChart3, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-white p-6 rounded-full shadow-xl">
              <Vote className="w-20 h-20 text-[#002868]" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-[#002868] mb-4">
            Electus
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Your voice matters. Exercise your democratic right and vote for your student council representatives.
          </p>
          {isAuthenticated ? (
            <Link
              to="/candidates"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-[#BF0A30] text-white rounded-lg text-lg font-semibold hover:bg-red-700 transition shadow-lg hover:shadow-xl"
            >
              <Vote className="w-6 h-6" />
              <span>Vote Now</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-[#BF0A30] text-white rounded-lg text-lg font-semibold hover:bg-red-700 transition shadow-lg hover:shadow-xl"
            >
              <span>Get Started</span>
            </Link>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition">
            <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-[#002868]" />
            </div>
            <h3 className="text-xl font-bold text-[#002868] mb-2">Secure Voting</h3>
            <p className="text-gray-600">
              One person, one vote. Our system ensures fair and transparent elections with complete security.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition">
            <div className="bg-red-100 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-8 h-8 text-[#BF0A30]" />
            </div>
            <h3 className="text-xl font-bold text-[#002868] mb-2">Live Results</h3>
            <p className="text-gray-600">
              Track election results in real-time and see how your candidates are performing.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition">
            <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-[#002868]" />
            </div>
            <h3 className="text-xl font-bold text-[#002868] mb-2">Know Your Candidates</h3>
            <p className="text-gray-600">
              Learn about each candidate's vision, manifesto, and commitment to student welfare.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-[#BF0A30]">
          <h2 className="text-2xl font-bold text-[#002868] mb-4">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <div className="bg-[#002868] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold mb-3">
                1
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Register</h4>
              <p className="text-sm text-gray-600">Create your account using your college email</p>
            </div>
            <div>
              <div className="bg-[#002868] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold mb-3">
                2
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Explore</h4>
              <p className="text-sm text-gray-600">Review candidate profiles and manifestos</p>
            </div>
            <div>
              <div className="bg-[#002868] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold mb-3">
                3
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Vote</h4>
              <p className="text-sm text-gray-600">Cast your vote securely for your choice</p>
            </div>
            <div>
              <div className="bg-[#002868] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold mb-3">
                4
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Results</h4>
              <p className="text-sm text-gray-600">View live results and election outcomes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
