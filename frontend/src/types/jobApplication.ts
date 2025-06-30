export interface JobApplication {
  id: number;
  company: string;
  position: string;
  link: string;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface NewJobApplication {
  company: string;
  position: string;
  link: string;
  status: string;
  notes: string;
}

export type JobApplicationStatus = 'applied' | 'interviewing' | 'offer' | 'rejected' | 'withdrawn';
