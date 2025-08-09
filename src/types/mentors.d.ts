export type Mentor = {
  id_mentor: string;
  name: string;
  photo_url: string;
  company?: string | null;
  specialization?: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  Course?: Course[]; // relasi one-to-many
};
