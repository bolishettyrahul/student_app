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

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  member_count?: number; // Virtual field from count query
}

export interface GroupMember {
  group_id: string;
  user_id: string;
  joined_at: string;
  profile?: Profile; // Joined relation
}

export interface GroupMessage {
  id: string;
  group_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: Profile; // Joined sender profile
}
