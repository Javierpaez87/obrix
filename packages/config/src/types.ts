export type UserRole = 'owner' | 'admin' | 'constructor' | 'client' | 'viewer';
export type ProjectStatus = 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
export type TaskStatus = 'pending' | 'in_progress' | 'review' | 'completed' | 'blocked';
export type InvitationStatus = 'pending' | 'accepted' | 'revoked' | 'expired';
export type BugStatus = 'new' | 'triaged' | 'in_progress' | 'fixed' | 'wontfix';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  blocked_at?: string;
}

export interface ProjectMember {
  user_id: string;
  role: UserRole;
  invited_at: string;
  accepted_at?: string;
  revoked_at?: string;
}

export interface Project {
  id: string;
  name: string;
  address: string;
  description: string;
  status: ProjectStatus;
  budget: number;
  spent: number;
  owner_id: string;
  members: ProjectMember[];
  created_at: string;
  updated_at: string;
}

export interface TaskAssignee {
  user_id: string;
  role: UserRole;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: TaskStatus;
  owner_id: string;
  assignees: TaskAssignee[];
  material_requests: any[];
  payment_plan: any[];
  created_at: string;
  updated_at: string;
}

export interface Invitation {
  id: string;
  resource_type: 'project' | 'task';
  resource_id: string;
  from_user_id: string;
  to_user_id: string;
  role: UserRole;
  status: InvitationStatus;
  created_at: string;
  responded_at?: string;
  revoked_at?: string;
}

export interface BugReport {
  id: string;
  title: string;
  description: string;
  status: BugStatus;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reporter_id: string;
  assignee_id?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}
