export interface Establishment {
  id?: number;
  name: string;
  address: string;
  code: string;
}

export interface Module {
  id?: number;
  name: string;
  code: string;
  description: string;
}

export interface Subject {
  id?: number;
  name: string;
  code: string;
  coefficient: number;
  moduleId: number;
}

export interface Classe {
  id?: number;
  name: string;
  level: string;
  establishmentId: number;
}

export interface Semester {
  id?: number;
  name: string;
  startDate: string;
  endDate: string;
  active: boolean;
}

export interface Grade {
  id?: number;
  studentId: number;
  subjectId: number;
  value: number;
  type: 'CC' | 'EXAM';
  date: string;
  published: boolean;
  validated: boolean;
}

export interface Attendance {
  id?: number;
  studentId: number;
  planningId: number;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  notes?: string;
  justificationReason?: string;
  justificationFileUrl?: string;
  justificationAccepted?: boolean;
}

export interface Planning {
  id?: number;
  classeId: number;
  subjectId: number;
  teacherId: number;
  salleId: number;
  timeSlotId: number;
  dayOfWeek: string;
  date?: string;
  status: 'SCHEDULED' | 'CANCELLED' | 'REPLACED';
  cancellationReason?: string;
}

export interface Salle {
  id?: number;
  name: string;
  capacity: number;
  type: string;
}

export interface TimeSlot {
  id?: number;
  startTime: string;
  endTime: string;
}

export interface Assignment {
  id?: number;
  title: string;
  description: string;
  dueDate: string;
  subjectId: number;
  teacherId: number;
  attachedFileUrl?: string;
  solutionFileUrl?: string;
}

export interface Submission {
  id?: number;
  assignmentId: number;
  studentId: number;
  submissionDate: string;
  submissionText?: string;
  submittedFileUrl?: string;
  grade?: number;
  feedback?: string;
}

export interface Resource {
  id?: number;
  title: string;
  description: string;
  type: 'PDF' | 'VIDEO' | 'DOCUMENT';
  fileUrl: string;
  subjectId: number;
  teacherId: number;
  classeId?: number;
}

export interface Message {
  id?: number;
  senderId: number;
  receiverId: number;
  content: string;
  sentAt: string;
  read: boolean;
  attachmentUrl?: string;
}

export interface Notification {
  id?: number;
  userId: number;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}
