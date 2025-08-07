"use client";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateCourseInput, createCourseSchema } from "@/lib/schemas/course.schema";
import { useEffect, useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function CourseFormPage() {
  const session = useSession();
  const router = useRouter();
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {}, [session]);

  const form = useForm<CreateCourseInput>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      lessons: [],
    },
  });

  const { control, watch, setValue } = form;

  const { fields: lessonFields, append: appendLesson } = useFieldArray({
    control,
    name: "lessons",
  });

  const addLesson = () => {
    appendLesson({
      title: "",
      order: lessonFields.length + 1,
      modules: [],
    });
  };

  const addModule = (lessonIndex: number) => {
    const currentLessons = watch("lessons");
    const updated = [...currentLessons];
    updated[lessonIndex].modules.push({
      title: "",
      content: "",
      video_url: "",
    });
    setValue("lessons", updated);
  };

  const onSubmit = async (data: CreateCourseInput) => {
    try {
      // Check if user is admin
      if (!session.data || session.data.user.role !== "ADMIN") {
        toast.error("Anda tidak memiliki izin untuk membuat course.", { duration: 3000 });
        return;
      }

      // Thumbnail Validation
      if (!thumbnail) {
        toast.error("Thumbnail wajib diunggah", { duration: 3000 });
        return;
      }

      // Convert form data to FormData
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("price", String(data.price));
      formData.append("thumbnail", thumbnail);
      formData.append("lessons", JSON.stringify(data.lessons));

      // Kirim request
      const res = await fetch("/api/course", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        toast.error(`Failed to create course`, {
          duration: 3000,
        });
        return;
      }

      await res.json();
      toast.success("Create Course Successfully", { duration: 3000 });
      form.reset();
      setThumbnail(null);
      setPreview(null);
      router.push("/admin/course");
    } catch (error) {
      console.error("Error saat membuat course:", error);
      toast.error("Terjadi kesalahan saat mengirim data.");
    }
  };

  return (
    <div className="mx-auto p-6 bg-white rounded-md shadow">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Thumbnail Preview */}
          {preview && (
            <div className="flex justify-center">
              <Image
                src={preview}
                alt="Thumbnail Preview"
                height={100}
                width={400}
                className="rounded-md object-cover w-full max-w-xs"
              />
            </div>
          )}

          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Title</FormLabel>
                <FormControl>
                  <Input placeholder="Input Course Title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Input Description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Price */}
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Input Price"
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Thumbnail Upload */}
          <div className="space-y-2">
            <FormLabel>Thumbnail</FormLabel>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setThumbnail(file);
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setPreview(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                } else {
                  setPreview(null);
                }
              }}
            />
          </div>

          <hr />

          {/* Lessons Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Lessons</h3>
              <Button type="button" onClick={addLesson} size="sm">
                + Add Lesson
              </Button>
            </div>

            {lessonFields.map((lesson, lessonIndex) => (
              <div key={lesson.id} className="p-4 bg-gray-50 rounded-md space-y-4 border">
                {/* Lesson Title */}
                <FormField
                  control={form.control}
                  name={`lessons.${lessonIndex}.title`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lesson Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Lesson Title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Add Module Button */}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => addModule(lessonIndex)}>
                  + Add Module
                </Button>

                {/* Modules */}
                {(watch("lessons")?.[lessonIndex]?.modules || []).map((_, moduleIndex) => (
                  <div
                    key={moduleIndex}
                    className="ml-2 border-l-4 border-primary pl-4 space-y-4 bg-white p-4 rounded">
                    <h4 className="font-medium text-sm text-muted-foreground">
                      Module {moduleIndex + 1}
                    </h4>

                    {/* Module Title */}
                    <FormField
                      control={form.control}
                      name={`lessons.${lessonIndex}.modules.${moduleIndex}.title`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Module Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Module Title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Module Content */}
                    <FormField
                      control={form.control}
                      name={`lessons.${lessonIndex}.modules.${moduleIndex}.content`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Module Content</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Content..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Module Video URL */}
                    <FormField
                      control={form.control}
                      name={`lessons.${lessonIndex}.modules.${moduleIndex}.video_url`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Video URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full mt-6">
            Create Course
          </Button>
        </form>
      </Form>
    </div>
  );
}
