export type Category = {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdBy: 'user' | 'ai';
  needsReview: boolean;
  createdAt: string;
  updatedAt: string;
};
