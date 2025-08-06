"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Edit2Icon, EllipsisIcon, PlusCircle, Trash2Icon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { CreateCourseInput, createCourseSchema } from "@/lib/schemas/course,schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import z from "zod";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "next-auth/react";
import { course } from "@/types/course";
import { toast } from "sonner";

export function Course() {
  const session = useSession();
  const [addOpen, setAddOpen] = useState(false);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [courses, setCourses] = useState<course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  console.log(session, "Session : ");

  useEffect(() => {
    const fetchCourse = async () => {
      const query = new URLSearchParams({
        page: "1",
        limit: "9",
        search: searchTerm,
        sortBy: "createAt",
        sortOrder: "desc",
      });
      const res = await fetch(`/api/course?${query.toString()}`);
      const result = await res.json();
      setCourses(result.data || []);
    };
    fetchCourse();
  }, [session, searchTerm]);

  const form = useForm<CreateCourseInput>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
    },
  });

  const onSubmit = async (data: z.infer<typeof createCourseSchema>) => {
    if (session.data?.user.role === "ADMIN") {
      try {
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("description", data.description);
        formData.append("price", data.price.toString());

        if (thumbnail) {
          formData.append("thumbnail", thumbnail);
        }

        const res = await fetch("/api/course", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          // Success
          toast.success("Create Success", {
            description: "Created course successfully.",
            duration: 3000,
          });
          setAddOpen(false);
          setThumbnail(null);
          setPreview(null);
          form.reset();
          window.location.reload();
        }
      } catch (error) {
        // Tangani dan tampilkan error
        console.error("Error:", error);
        alert("Gagal membuat course. Silakan coba lagi.");
      }
    } else {
      alert("Hanya admin yang dapat membuat course.");
    }
  };

  return (
    <div>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Course Management</h2>
            <Button variant="outline" onClick={() => setAddOpen(true)}>
              <PlusCircle className="h-4 w-4" />
              Add Course
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Input
            type="search"
            placeholder="Search course..."
            className="w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.length === 0 ? (
              <p className="text-muted-foreground">No courses found.</p>
            ) : (
              courses.map((course) => (
                <Card key={course.id_course} className="border-2 rounded-lg">
                  <CardHeader>
                    <CardTitle>
                      <div className="flex items-center justify-center">
                        <Image
                          src={course.thumbnail || "/default.jpeg"}
                          alt="Course Image"
                          width={400}
                          height={50}
                          className=""
                          priority
                        />
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2 ">
                    <h1 className="text-xl font-bold">{course.title}</h1>
                    <p className="text-sm">{course.description}</p>
                    <p className="text-lg font-bold">Rp.{course.price}</p>
                  </CardContent>
                  <CardFooter className="justify-end gap-2">
                    <Button variant="outline">
                      <EllipsisIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="outline">
                      <Edit2Icon className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive">
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </CardContent>

        <CardFooter />
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
            <DialogDescription>Fill in the course details below.</DialogDescription>
          </DialogHeader>

          {preview && (
            <div className="flex justify-center mb-2">
              <Image
                src={preview}
                alt="Preview Thumbnail"
                width={160}
                height={160}
                className="w-40 h-40 object-cover rounded-md border"
              />
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <Button type="submit" className="w-full">
                Create Course
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
