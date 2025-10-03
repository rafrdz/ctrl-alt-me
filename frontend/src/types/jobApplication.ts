export interface JobApplication {
  id: string; // Updated to string to match backend UUID
  company: string;
  position: string;
  link: string;
  status: JobApplicationStatus;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface NewJobApplication {
  company: string;
  position: string;
  link: string;
  status: JobApplicationStatus;
  notes: string;
}

export type JobApplicationStatus = 
  | 'applied' 
  | 'interview' 
  | 'offer' 
  | 'rejected' 
  | 'withdrawn' 
  | 'ghosted' 
  | 'accepted';
