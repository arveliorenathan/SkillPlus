"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Edit2Icon, EllipsisIcon, PlusCircle, Trash2Icon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { course } from "@/types/course";
import Link from "next/link";

export function Courses() {
  const session = useSession();
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
      const res = await fetch(`/api/courses?${query.toString()}`);
      const result = await res.json();
      setCourses(result.data || []);
    };
    fetchCourse();
  }, [session, searchTerm]);

  return (
    <div>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Course Management</h2>
            <Button variant="outline" asChild>
              <Link href="/admin/courses/create-courses">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Course
              </Link>
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
    </div>
  );
}
