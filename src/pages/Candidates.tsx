import { useState, useEffect } from 'react';
import { CandidateCard } from '../components/CandidateCard';
import { VoteModal } from '../components/VoteModal';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Candidate } from '../types';
import { CheckCircle, AlertCircle } from 'lucide-react';

export const Candidates = () => {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [electionActive, setElectionActive] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    await Promise.all([loadCandidates(), checkVoteStatus(), checkElectionStatus()]);
    setLoading(false);
  };

  const loadCandidates = async () => {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error loading candidates:', error);
        return;
      }

      const mappedCandidates: Candidate[] = (data || []).map(c => ({
        id: c.id,
        name: c.name,
        position: c.position,
        department: c.dept,
        year: c.year,
        imageUrl: c.image_url,
        manifesto: c.bio,
        votes: c.votes,
      }));

      setCandidates(mappedCandidates);
    } catch (error) {
      console.error('Error loading candidates:', error);
    }
  };

  const checkVoteStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('students')
        .select('has_voted')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking vote status:', error);
        return;
      }

      setHasVoted(data?.has_voted || false);
    } catch (error) {
      console.error('Error checking vote status:', error);
    }
  };

  const checkElectionStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('election')
        .select('is_active')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error checking election status:', error);
        return;
      }

      setElectionActive(data?.is_active || false);
    } catch (error) {
      console.error('Error checking election status:', error);
    }
  };

  const handleVoteClick = (candidateId: string) => {
    if (hasVoted || !electionActive) return;
    const candidate = candidates.find(c => c.id === candidateId);
    setSelectedCandidate(candidate || null);
  };

  const handleConfirmVote = async () => {
    if (!selectedCandidate || !user) return;

    try {
      const { data: electionData } = await supabase
        .from('election')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (!electionData) {
        console.error('No active election found');
        return;
      }

      const { error: voteError } = await supabase
        .from('votes')
        .insert({
          student_id: user.id,
          candidate_id: selectedCandidate.id,
          election_id: electionData.id,
        });

      if (voteError) {
        console.error('Error recording vote:', voteError);
        return;
      }

      const { error: candidateError } = await supabase.rpc('increment_votes', {
        candidate_id: selectedCandidate.id,
      });

      if (candidateError) {
        const { error: updateError } = await supabase
          .from('candidates')
          .update({ votes: selectedCandidate.votes + 1 })
          .eq('id', selectedCandidate.id);

        if (updateError) {
          console.error('Error updating candidate votes:', updateError);
        }
      }

      const { error: studentError } = await supabase
        .from('students')
        .update({ has_voted: true })
        .eq('id', user.id);

      if (studentError) {
        console.error('Error updating student status:', studentError);
      }

      await loadCandidates();
      setHasVoted(true);
      setSelectedCandidate(null);
      setShowSuccess(true);

      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error('Error confirming vote:', error);
    }
  };

  const handleCancelVote = () => {
    setSelectedCandidate(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-[#002868] text-xl font-semibold">Loading candidates...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#002868] mb-4">Meet the Candidates</h1>
          <p className="text-lg text-gray-700">
            Learn about each candidate and cast your vote
          </p>
        </div>

        {showSuccess && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-semibold text-green-800">Vote Recorded Successfully!</p>
              <p className="text-sm text-green-700">Thank you for participating in the election.</p>
            </div>
          </div>
        )}

        {!electionActive && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <p className="text-red-800 text-center font-medium">
              The election is currently inactive. Voting is disabled.
            </p>
          </div>
        )}

        {hasVoted && !showSuccess && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-center font-medium">
              You have already cast your vote. Thank you for participating!
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {candidates.map(candidate => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              onVote={handleVoteClick}
              hasVoted={hasVoted || !electionActive}
            />
          ))}
        </div>
      </div>

      <VoteModal
        candidate={selectedCandidate}
        onConfirm={handleConfirmVote}
        onCancel={handleCancelVote}
      />
    </div>
  );
};
