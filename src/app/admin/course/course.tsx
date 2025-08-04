"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Edit2Icon, EllipsisIcon, PlusCircle, Trash2Icon } from "lucide-react";
import Image from "next/image";

export function Course() {
  return (
    <div>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Course Management</h2>
            <Button variant="outline">
              <PlusCircle className="h-4 w-4" />
              Add Course
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Input type="search" placeholder="Search course..." className="w-full" />

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Module 1 */}
            <Card className="border-2 rounded-lg">
              <CardHeader>
                <CardTitle>
                  {/* <Image src={"public"} alt="Course Image" width={100} height={100}></Image> */}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <span className="text-lg font-bold">Judul Course</span>
                <p>Getting started with React, understanding the basics of components.</p>
                <p className="text-lg font-bold">Rp.50000</p>
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
          </div>
        </CardContent>

        <CardFooter />
      </Card>
    </div>
  );
}
