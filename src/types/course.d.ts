export type course = {
  id_course: string;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  id_mentor?: string | null;
  createAt: Date;
  mentor?: {
    id_mentor: string;
    name: string;
    // tambahkan properti lain jika ada
  } | null;
};
