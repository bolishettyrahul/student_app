export interface Subject {
  id: string;
  user_id: string;
  name: string;
  code: string | null;
  color: string; // Hex color code or HSL token
  created_at: string;
}

export interface Assignment {
  id: string;
  user_id: string;
  subject_id: string | null;
  title: string;
  description: string | null;
  due_date: string; // ISO string
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  subject?: Subject; // Joined relation from Supabase
}

export interface AcademicAnalytics {
  dueToday: number;
  dueThisWeek: number;
  completionRate: number;
  subjectProgress: {
    subjectId: string;
    subjectName: string;
    color: string;
    total: number;
    completed: number;
    progress: number; // 0 to 1
  }[];
}
