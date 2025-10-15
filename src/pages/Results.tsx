import { useState, useEffect } from 'react';
import { Trophy, TrendingUp } from 'lucide-react';
import { ResultChart } from '../components/ResultChart';
import { supabase } from '../lib/supabaseClient';
import { Candidate } from '../types';

export const Results = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();

    const channel = supabase
      .channel('candidates-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'candidates' }, () => {
        loadResults();
      })
      .subscribe();

    const interval = setInterval(() => {
      loadResults();
    }, 10000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const loadResults = async () => {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .order('votes', { ascending: false });

      if (error) {
        console.error('Error loading results:', error);
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

      const total = mappedCandidates.reduce((sum, c) => sum + c.votes, 0);
      setTotalVotes(total);
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-[#002868] text-xl font-semibold">Loading results...</div>
      </div>
    );
  }

  const winner = candidates[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#002868] mb-4">Election Results</h1>
          <p className="text-lg text-gray-700">Live voting results and statistics</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-2">
              <TrendingUp className="w-6 h-6 text-[#002868]" />
              <h3 className="text-lg font-semibold text-gray-700">Total Votes</h3>
            </div>
            <p className="text-4xl font-bold text-[#002868]">{totalVotes}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-2">
              <Trophy className="w-6 h-6 text-[#BF0A30]" />
              <h3 className="text-lg font-semibold text-gray-700">Current Leader</h3>
            </div>
            <p className="text-2xl font-bold text-[#002868]">{winner?.name || 'No votes yet'}</p>
            {winner && <p className="text-sm text-gray-600 mt-1">{winner.votes} votes</p>}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-2">
              <Trophy className="w-6 h-6 text-[#002868]" />
              <h3 className="text-lg font-semibold text-gray-700">Candidates</h3>
            </div>
            <p className="text-4xl font-bold text-[#002868]">{candidates.length}</p>
          </div>
        </div>

        <div className="mb-8">
          <ResultChart candidates={candidates} />
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-[#002868] text-white px-6 py-4">
            <h3 className="text-xl font-bold">Detailed Results</h3>
          </div>
          <div className="divide-y">
            {candidates.map((candidate, index) => (
              <div
                key={candidate.id}
                className="px-6 py-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        index === 0
                          ? 'bg-yellow-100 text-yellow-700'
                          : index === 1
                          ? 'bg-gray-100 text-gray-700'
                          : index === 2
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#002868] text-lg">{candidate.name}</h4>
                      <p className="text-sm text-gray-600">
                        {candidate.position} • {candidate.department}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-[#002868]">{candidate.votes}</p>
                    <p className="text-sm text-gray-600">
                      {totalVotes > 0 ? ((candidate.votes / totalVotes) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        index === 0 ? 'bg-[#BF0A30]' : 'bg-[#002868]'
                      }`}
                      style={{
                        width: `${totalVotes > 0 ? (candidate.votes / totalVotes) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
