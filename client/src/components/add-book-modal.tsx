import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";

const bookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  isbn: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  language: z.string().min(1, "Language is required"),
  condition: z.enum(["excellent", "good", "fair", "poor"]),
  description: z.string().optional(),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
});

type BookFormData = z.infer<typeof bookSchema>;

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddBookModal({ isOpen, onClose }: AddBookModalProps) {
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      language: "English",
      condition: "good",
    },
  });

  const createBookMutation = useMutation({
    mutationFn: async (data: BookFormData) => {
      await apiRequest("POST", "/api/books", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books/donor/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      toast({
        title: "Success",
        description: "Book added successfully!",
      });
      reset();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const categories = [
    "Fiction",
    "Non-Fiction",
    "Programming",
    "Self-Help",
    "Historical Fiction",
    "Science",
    "Biography",
    "Children",
    "Romance",
    "Mystery",
    "Fantasy",
    "Business",
    "Health",
    "Travel",
    "Cooking",
    "Art",
    "Music",
    "Sports",
    "Religion",
    "Philosophy",
  ];

  const conditions = [
    { value: "excellent", label: "Excellent - Like new" },
    { value: "good", label: "Good - Minor wear" },
    { value: "fair", label: "Fair - Noticeable wear" },
    { value: "poor", label: "Poor - Heavy wear" },
  ];

  const onSubmit = (data: BookFormData) => {
    createBookMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Book</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Enter book title"
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Author *</Label>
              <Input
                id="author"
                {...register("author")}
                placeholder="Enter author name"
              />
              {errors.author && (
                <p className="text-sm text-red-600">{errors.author.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN</Label>
              <Input
                id="isbn"
                {...register("isbn")}
                placeholder="978-0-123456-78-9"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language *</Label>
              <Input
                id="language"
                {...register("language")}
                placeholder="English"
              />
              {errors.language && (
                <p className="text-sm text-red-600">{errors.language.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select onValueChange={(value) => setValue("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Condition *</Label>
              <Select onValueChange={(value) => setValue("condition", value as "excellent" | "good" | "fair" | "poor")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map((condition) => (
                    <SelectItem key={condition.value} value={condition.value}>
                      {condition.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.condition && (
                <p className="text-sm text-red-600">{errors.condition.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverImageUrl">Cover Image URL</Label>
            <Input
              id="coverImageUrl"
              {...register("coverImageUrl")}
              placeholder="https://example.com/book-cover.jpg"
              type="url"
            />
            {errors.coverImageUrl && (
              <p className="text-sm text-red-600">{errors.coverImageUrl.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Brief description of the book..."
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-primary-500 hover:bg-primary-600 text-white"
              disabled={createBookMutation.isPending}
            >
              {createBookMutation.isPending ? "Adding..." : "Add Book"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
