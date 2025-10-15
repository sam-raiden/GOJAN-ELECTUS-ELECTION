import { User, Award } from 'lucide-react';
import { Candidate } from '../types';

interface CandidateCardProps {
  candidate: Candidate;
  onVote?: (candidateId: string) => void;
  hasVoted?: boolean;
  showVoteButton?: boolean;
}

export const CandidateCard = ({ candidate, onVote, hasVoted, showVoteButton = true }: CandidateCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative h-64 bg-gradient-to-br from-[#002868] to-blue-900">
        <img
          src={candidate.imageUrl}
          alt={candidate.name}
          className="w-full h-full object-cover mix-blend-overlay opacity-90"
        />
        <div className="absolute top-4 right-4 bg-[#BF0A30] text-white px-3 py-1 rounded-full text-sm font-semibold">
          {candidate.position}
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-2xl font-bold text-[#002868] mb-2">{candidate.name}</h3>

        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-1">
            <User className="w-4 h-4" />
            <span>{candidate.department}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Award className="w-4 h-4" />
            <span>{candidate.year}</span>
          </div>
        </div>

        <p className="text-gray-700 mb-6 leading-relaxed">{candidate.manifesto}</p>

        {showVoteButton && (
          <button
            onClick={() => onVote?.(candidate.id)}
            disabled={hasVoted}
            className={`w-full py-3 rounded-lg font-semibold transition ${
              hasVoted
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#002868] text-white hover:bg-blue-900'
            }`}
          >
            {hasVoted ? 'Already Voted' : 'Vote Now'}
          </button>
        )}
      </div>
    </div>
  );
};
