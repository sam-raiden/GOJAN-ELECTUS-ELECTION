import { useState, useEffect } from 'react';
import { Plus, Trash2, Users, BarChart3, RefreshCw, Play, Square } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Candidate } from '../types';

export const Admin = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [votes, setVotes] = useState<number>(0);
  const [students, setStudents] = useState<number>(0);
  const [electionActive, setElectionActive] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    position: '',
    department: '',
    year: '',
    imageUrl: '',
    manifesto: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([loadCandidates(), loadVotes(), loadStudents(), loadElectionStatus()]);
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
        department: c.department, // ✅ fixed field
        year: c.year,
        imageUrl: c.image_url,
        manifesto: c.manifesto, // ✅ fixed field
        votes: c.votes,
      }));

      setCandidates(mappedCandidates);
    } catch (error) {
      console.error('Error loading candidates:', error);
    }
  };

  const loadVotes = async () => {
    try {
      const { count, error } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Error loading votes:', error);
        return;
      }

      setVotes(count || 0);
    } catch (error) {
      console.error('Error loading votes:', error);
    }
  };

  const loadStudents = async () => {
    try {
      const { count, error } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Error loading students:', error);
        return;
      }

      setStudents(count || 0);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const loadElectionStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('election')
        .select('is_active')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error loading election status:', error);
        return;
      }

      setElectionActive(data?.is_active || false);
    } catch (error) {
      console.error('Error loading election status:', error);
    }
  };

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase.from('candidates').insert([
        {
          name: newCandidate.name,
          position: newCandidate.position,
          department: newCandidate.department, // ✅ fixed field
          year: newCandidate.year,
          image_url: newCandidate.imageUrl || null,
          manifesto: newCandidate.manifesto, // ✅ fixed field
          votes: 0,
        },
      ]);

      if (error) {
        console.error('Error adding candidate:', error);
        alert('Failed to add candidate');
        return;
      }

      setNewCandidate({
        name: '',
        position: '',
        department: '',
        year: '',
        imageUrl: '',
        manifesto: '',
      });
      setShowAddForm(false);
      await loadCandidates();
    } catch (error) {
      console.error('Error adding candidate:', error);
      alert('Failed to add candidate');
    }
  };

  const handleDeleteCandidate = async (id: string) => {
    if (confirm('Are you sure you want to delete this candidate?')) {
      try {
        const { error } = await supabase
          .from('candidates')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting candidate:', error);
          alert('Failed to delete candidate');
          return;
        }

        await loadCandidates();
      } catch (error) {
        console.error('Error deleting candidate:', error);
        alert('Failed to delete candidate');
      }
    }
  };

  const handleResetVotes = async () => {
    if (confirm('Are you sure you want to reset all votes? This action cannot be undone.')) {
      try {
        const { error: votesError } = await supabase
          .from('votes')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000');

        if (votesError) {
          console.error('Error deleting votes:', votesError);
        }

        const { error: candidatesError } = await supabase
          .from('candidates')
          .update({ votes: 0 })
          .neq('id', '00000000-0000-0000-0000-000000000000');

        if (candidatesError) {
          console.error('Error resetting candidate votes:', candidatesError);
        }

        const { error: studentsError } = await supabase
          .from('students')
          .update({ has_voted: false })
          .neq('id', '00000000-0000-0000-0000-000000000000');

        if (studentsError) {
          console.error('Error resetting student votes:', studentsError);
        }

        await loadData();
        alert('All votes have been reset successfully');
      } catch (error) {
        console.error('Error resetting votes:', error);
        alert('Failed to reset votes');
      }
    }
  };

  const handleToggleElection = async () => {
    try {
      const { error } = await supabase
        .from('election')
        .update({ is_active: !electionActive })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) {
        console.error('Error toggling election:', error);
        alert('Failed to toggle election status');
        return;
      }

      setElectionActive(!electionActive);
      alert(`Election ${!electionActive ? 'started' : 'stopped'} successfully`);
    } catch (error) {
      console.error('Error toggling election:', error);
      alert('Failed to toggle election status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-[#002868] text-xl font-semibold">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#002868] mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage elections, candidates, and view analytics</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-2">
              <Users className="w-8 h-8 text-[#002868]" />
              <h3 className="text-lg font-semibold text-gray-700">Total Candidates</h3>
            </div>
            <p className="text-4xl font-bold text-[#002868]">{candidates.length}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-2">
              <BarChart3 className="w-8 h-8 text-[#BF0A30]" />
              <h3 className="text-lg font-semibold text-gray-700">Total Votes Cast</h3>
            </div>
            <p className="text-4xl font-bold text-[#002868]">{votes}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-2">
              <Users className="w-8 h-8 text-[#002868]" />
              <h3 className="text-lg font-semibold text-gray-700">Participation</h3>
            </div>
            <p className="text-4xl font-bold text-[#002868]">
              {students > 0 ? `${((votes / students) * 100).toFixed(0)}%` : '0%'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-[#002868] text-white px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">Manage Candidates</h2>
            <div className="flex space-x-3">
              <button
                onClick={handleToggleElection}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                  electionActive
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white`}
              >
                {electionActive ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{electionActive ? 'Stop Election' : 'Start Election'}</span>
              </button>
              <button
                onClick={handleResetVotes}
                className="flex items-center space-x-2 px-4 py-2 bg-[#BF0A30] text-white rounded-lg hover:bg-red-700 transition"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset Votes</span>
              </button>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center space-x-2 px-4 py-2 bg-white text-[#002868] rounded-lg hover:bg-gray-100 transition"
              >
                <Plus className="w-5 h-5" />
                <span>Add Candidate</span>
              </button>
            </div>
          </div>

          {showAddForm && (
            <div className="bg-gray-50 border-b p-6">
              <h3 className="text-lg font-semibold text-[#002868] mb-4">Add New Candidate</h3>
              <form onSubmit={handleAddCandidate} className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={newCandidate.name}
                  onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                  placeholder="Full Name"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002868] focus:border-transparent"
                  required
                />
                <input
                  type="text"
                  value={newCandidate.position}
                  onChange={(e) => setNewCandidate({ ...newCandidate, position: e.target.value })}
                  placeholder="Position (e.g., President)"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002868] focus:border-transparent"
                  required
                />
                <input
                  type="text"
                  value={newCandidate.department}
                  onChange={(e) => setNewCandidate({ ...newCandidate, department: e.target.value })}
                  placeholder="Department"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002868] focus:border-transparent"
                  required
                />
                <input
                  type="text"
                  value={newCandidate.year}
                  onChange={(e) => setNewCandidate({ ...newCandidate, year: e.target.value })}
                  placeholder="Year (e.g., Final Year)"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002868] focus:border-transparent"
                  required
                />
                <input
                  type="url"
                  value={newCandidate.imageUrl}
                  onChange={(e) => setNewCandidate({ ...newCandidate, imageUrl: e.target.value })}
                  placeholder="Image URL"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002868] focus:border-transparent"
                />
                <textarea
                  value={newCandidate.manifesto}
                  onChange={(e) => setNewCandidate({ ...newCandidate, manifesto: e.target.value })}
                  placeholder="Manifesto"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002868] focus:border-transparent md:col-span-2"
                  rows={2}
                  required
                />
                <div className="md:col-span-2 flex space-x-3">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#002868] text-white rounded-lg hover:bg-blue-900 transition font-semibold"
                  >
                    Add Candidate
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="divide-y">
            {candidates.map((candidate) => (
              <div key={candidate.id} className="px-6 py-4 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={candidate.imageUrl}
                      alt={candidate.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-[#002868] text-lg">{candidate.name}</h4>
                      <p className="text-sm text-gray-600">
                        {candidate.position} • {candidate.department} • {candidate.year}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">{candidate.manifesto}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#002868]">{candidate.votes}</p>
                      <p className="text-xs text-gray-600">votes</p>
                    </div>
                    <button
                      onClick={() => handleDeleteCandidate(candidate.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
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
