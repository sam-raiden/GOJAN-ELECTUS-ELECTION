export interface User {
  id: string;
  email: string;
  name: string;
  studentId: string;
  role: 'student' | 'admin';
}

export interface Candidate {
  id: string;
  name: string;
  position: string;
  department: string;
  year: string;
  imageUrl: string;
  manifesto: string;
  votes: number;
}

export interface Election {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed';
}

export interface Vote {
  id: string;
  userId: string;
  candidateId: string;
  electionId: string;
  timestamp: string;
}
