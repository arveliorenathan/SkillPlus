export type module = {
  id_module: string;
  title: string;
  content: string;
  video_url: string;
  id_lesson: string;
};

export type lesson = {
  id_lesson: string;
  title: string;
  order: number;
  id_course: string;
  modules: Module[];
};

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
  } | null;
  lessons: Lesson[];
};
