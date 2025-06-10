import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MapPin } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import RequestBookModal from "./request-book-modal";
import { useAuth } from "@/hooks/useAuth";

interface BookCardProps {
  book: {
    id: number;
    title: string;
    author: string;
    category: string;
    condition: string;
    coverImageUrl?: string;
    donorId: string;
    status: string;
    donor?: {
      firstName?: string;
      lastName?: string;
      profileImageUrl?: string;
    };
  };
}

export default function BookCard({ book }: BookCardProps) {
  const { user, isAuthenticated } = useAuth();
  const [showRequestModal, setShowRequestModal] = useState(false);

  const canRequestBook = isAuthenticated && 
    user?.id !== book.donorId && 
    book.status === "available";

  const handleRequestClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    setShowRequestModal(true);
  };

  return (
    <>
      <Link href={`/books/${book.id}`}>
        <Card className="overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group">
          {/* Book Cover */}
          <div className="aspect-[3/4] bg-slate-200 overflow-hidden">
            {book.coverImageUrl ? (
              <img
                src={book.coverImageUrl}
                alt={book.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">
                <div className="text-center">
                  <div className="text-4xl mb-2">📖</div>
                  <div className="text-sm">No Image</div>
                </div>
              </div>
            )}
          </div>
          
          <CardContent className="p-6 space-y-3">
            <div>
              <h3 className="font-semibold text-slate-900 text-lg line-clamp-2">{book.title}</h3>
              <p className="text-slate-600 line-clamp-1">{book.author}</p>
            </div>
            
            <div className="flex items-center justify-between">
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

            {/* Donor Info */}
            {book.donor && (
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={book.donor.profileImageUrl} />
                  <AvatarFallback className="text-xs">
                    {book.donor.firstName?.[0]}{book.donor.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span>{book.donor.firstName} {book.donor.lastName?.[0]}.</span>
              </div>
            )}

            {/* Request Button */}
            {book.status === "available" ? (
              <Button
                onClick={handleRequestClick}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white text-sm"
                disabled={!canRequestBook}
              >
                <Heart className="h-4 w-4 mr-2" />
                {!isAuthenticated ? "Sign in to Request" : 
                 user?.id === book.donorId ? "Your Book" : "Request Book"}
              </Button>
            ) : (
              <Badge variant="secondary" className="w-full justify-center py-2">
                {book.status === "requested" ? "Currently Requested" : "Already Donated"}
              </Badge>
            )}
          </CardContent>
        </Card>
      </Link>

      {showRequestModal && (
        <RequestBookModal
          book={book}
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
        />
      )}
    </>
  );
}
