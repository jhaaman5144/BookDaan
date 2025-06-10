import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { MapPin, User, Book } from "lucide-react";

const requestSchema = z.object({
  message: z.string().optional(),
  pickupLocation: z.string().min(1, "Pickup location is required"),
});

type RequestFormData = z.infer<typeof requestSchema>;

interface RequestBookModalProps {
  book: {
    id: number;
    title: string;
    author: string;
    category: string;
    condition: string;
    coverImageUrl?: string;
    description?: string;
    donorId: string;
    donor?: {
      firstName?: string;
      lastName?: string;
      profileImageUrl?: string;
    };
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function RequestBookModal({ book, isOpen, onClose }: RequestBookModalProps) {
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      message: "",
      pickupLocation: "",
    },
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data: RequestFormData) => {
      await apiRequest("POST", "/api/requests", {
        bookId: book.id,
        message: data.message,
        pickupLocation: data.pickupLocation,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/requests/recipient/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      queryClient.invalidateQueries({ queryKey: [`/api/books/${book.id}`] });
      toast({
        title: "Request Sent!",
        description: "Your book request has been sent to the donor. You'll be notified when they respond.",
      });
      reset();
      onClose();
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RequestFormData) => {
    createRequestMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Book</DialogTitle>
        </DialogHeader>
        
        {/* Book Information */}
        <div className="bg-slate-50 rounded-lg p-6 mb-6">
          <div className="flex space-x-4">
            <div className="w-16 h-20 bg-slate-200 rounded-md overflow-hidden flex-shrink-0">
              {book.coverImageUrl ? (
                <img
                  src={book.coverImageUrl}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500">
                  <Book className="h-6 w-6" />
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-slate-900">{book.title}</h3>
              <p className="text-slate-600">by {book.author}</p>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {book.category}
                </Badge>
                <Badge 
                  variant="secondary"
                  className={
                    book.condition === "excellent" ? "bg-green-100 text-green-800" :
                    book.condition === "good" ? "bg-blue-100 text-blue-800" :
                    book.condition === "fair" ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  }
                >
                  {book.condition.charAt(0).toUpperCase() + book.condition.slice(1)}
                </Badge>
              </div>

              {/* Donor Information */}
              {book.donor && (
                <div className="flex items-center space-x-2 text-sm text-slate-600 pt-2 border-t border-slate-200">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={book.donor.profileImageUrl} />
                    <AvatarFallback className="text-xs">
                      {book.donor.firstName?.[0]}{book.donor.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    {book.donor.firstName} {book.donor.lastName}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Request Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="pickupLocation">Pickup Location *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                id="pickupLocation"
                {...register("pickupLocation")}
                placeholder="Enter your preferred pickup location"
                className="pl-10"
              />
            </div>
            {errors.pickupLocation && (
              <p className="text-sm text-red-600">{errors.pickupLocation.message}</p>
            )}
            <p className="text-xs text-slate-500">
              Provide a convenient location where you can meet the donor to collect the book.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message to Donor (Optional)</Label>
            <Textarea
              id="message"
              {...register("message")}
              placeholder="Let the donor know why you're interested in this book or any other relevant information..."
              rows={4}
            />
            <p className="text-xs text-slate-500">
              A personal message can help the donor understand your interest and may increase your chances of getting the book.
            </p>
          </div>

          {/* Request Guidelines */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">📚 Request Guidelines</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Be respectful and courteous in your communication</li>
              <li>• Suggest a convenient and safe public meeting location</li>
              <li>• Be flexible with timing for pickup arrangements</li>
              <li>• Only request books you genuinely plan to read</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-primary-500 hover:bg-primary-600 text-white"
              disabled={createRequestMutation.isPending}
            >
              {createRequestMutation.isPending ? "Sending Request..." : "Send Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
