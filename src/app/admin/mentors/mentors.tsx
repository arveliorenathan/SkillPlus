"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Edit2Icon, EllipsisIcon, PlusCircle, Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateMentorsInput, createMentorsSchema } from "@/lib/schemas/mentors.schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Mentor } from "@/types/mentors";
import { Badge } from "@/components/ui/badge";

export function Mentors() {
  const session = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [mentors, setMentors] = useState<Mentor[]>([]);

  console.log(session, "Session : ");

  useEffect(() => {
    const fetchMentors = async () => {
      const query = new URLSearchParams({
        page: "1",
        limit: "9",
        search: searchTerm,
        sortBy: "createAt",
        sortOrder: "desc",
      });
      const res = await fetch(`/api/mentors?${query.toString()}`);
      const result = await res.json();
      setMentors(result.data);
    };
    fetchMentors();
  }, [session, searchTerm]);

  const form = useForm<CreateMentorsInput>({
    resolver: zodResolver(createMentorsSchema),
    defaultValues: {
      name: "",
      company: "",
      specialization: "",
    },
  });

  const onSubmit = async (data: CreateMentorsInput) => {
    try {
      // Check if user is admin
      if (!session.data || session.data.user.role !== "ADMIN") {
        toast.error("You dont have permission to add mentors!", { duration: 3000 });
        return;
      }

      // Thumbnail Validation
      if (!photo) {
        toast.error("Photo required", { duration: 3000 });
        return;
      }

      const formData = new FormData();
      formData.append("name", data.name);
      if (data.company) {
        formData.append("company", data.company);
      }
      if (data.specialization) {
        formData.append("specialization", data.specialization);
      }

      formData.append("photo_url", photo);

      const res = await fetch("/api/mentors", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        toast.error(`Failed to create mentors`, {
          duration: 3000,
        });
        return;
      }

      await res.json();
      toast.success("Create Mentors Successfully", { duration: 3000 });
      form.reset();
      setPhoto(null);
      setPreview(null);
      window.location.reload();
    } catch (error) {
      console.error("Error saat membuat course:", error);
      toast.error("Something Wrong!");
    }
  };

  return (
    <div>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Mentors Management</h2>
            <Button variant="outline" onClick={() => setIsAddOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Mentor
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Input
            type="search"
            placeholder="Search mentors..."
            className="w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mentors.length === 0 ? (
              <p className="text-muted-foreground">No mentors found.</p>
            ) : (
              mentors.map((mentor) => (
                <Card
                  key={mentor.id_mentor}
                  className="relative border-2 rounded-lg overflow-hidden">
                  {/* Background Image */}
                  <div className="w-full h-full aspect-square">
                    <Image
                      src={mentor.photo_url}
                      alt={"Mentor Photo"}
                      fill
                      className="object-cover"
                    />
                    {/* Gradient overlay dari bawah */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  </div>

                  {/* Badge Status */}
                  <div className="absolute top-3 right-3">
                    <Badge
                      className={
                        mentor.is_active
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : "bg-gray-400 hover:bg-gray-500 text-white"
                      }>
                      {mentor.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  {/* Mentor Data */}
                  <div className="absolute bottom-16 left-5 space-y-2 text-white">
                    <CardTitle className="text-lg font-bold">{mentor.name}</CardTitle>
                    <p className="text-sm line-clamp-1">{mentor.specialization || "-"}</p>
                    <p className="text-xs opacity-80 line-clamp-1">{mentor.company || "-"}</p>
                  </div>

                  {/* Footer Button */}
                  <CardFooter className="absolute bottom-3 right-0 gap-2">
                    <Button size="icon" variant="outline" className="bg-white/80 hover:bg-white">
                      <EllipsisIcon className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" className="bg-white/80 hover:bg-white">
                      <Edit2Icon className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="destructive">
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

      {/* Dialog Add Mentor */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center text-lg">Create Mentor Data</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Photo Preview */}
              {preview && (
                <div className="flex justify-center">
                  <div className="h-50 overflow-hidden aspect-square">
                    <Image
                      src={preview}
                      alt="Thumbnail Preview"
                      width={160}
                      height={160}
                      className="object-cover w-full h-full rounded-md"
                    />
                  </div>
                </div>
              )}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fullname</FormLabel>
                    <FormControl>
                      <Input placeholder="Fullname" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Company" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="specialization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialization</FormLabel>
                    <FormControl>
                      <Input placeholder="Specialitation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <FormLabel>Photo</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setPhoto(file);
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
              <Button type="submit">Create Mentors</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
