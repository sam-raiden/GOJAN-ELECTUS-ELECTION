import { X, CheckCircle } from 'lucide-react';
import { Candidate } from '../types';

interface VoteModalProps {
  candidate: Candidate | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const VoteModal = ({ candidate, onConfirm, onCancel }: VoteModalProps) => {
  if (!candidate) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-6 h-6 text-[#002868]" />
            <h2 className="text-xl font-bold text-[#002868]">Confirm Your Vote</h2>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-gray-700 mb-2">You are about to vote for:</p>
          <p className="text-xl font-bold text-[#002868]">{candidate.name}</p>
          <p className="text-sm text-gray-600 mt-1">{candidate.position}</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Important:</strong> You can only vote once. This action cannot be undone.
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 rounded-lg bg-[#002868] text-white font-semibold hover:bg-blue-900 transition"
          >
            Confirm Vote
          </button>
        </div>
      </div>
    </div>
  );
};
