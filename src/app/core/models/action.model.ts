export interface Action {
  id: string;
  date: Date;
  type: string;
  description: string;
  status: 'success' | 'failed' | 'pending';
}