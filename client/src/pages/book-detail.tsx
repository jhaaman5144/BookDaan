import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import RequestBookModal from "@/components/request-book-modal";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, MapPin, Calendar, User } from "lucide-react";
import { Link } from "wouter";

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const [showRequestModal, setShowRequestModal] = useState(false);

  const { data: bookData, isLoading } = useQuery({
    queryKey: [`/api/books/${id}`],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!bookData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Book Not Found</h2>
            <p className="text-slate-600 mb-4">The book you're looking for doesn't exist.</p>
            <Link href="/books">
              <Button>Browse Books</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canRequestBook = isAuthenticated && 
    user?.id !== bookData.donorId && 
    bookData.status === "available";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <Link href="/books">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Books
          </Button>
        </Link>

        <Card>
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Book Image */}
              <div className="space-y-4">
                <div className="aspect-[3/4] bg-slate-200 rounded-lg overflow-hidden">
                  {bookData.coverImageUrl ? (
                    <img
                      src={bookData.coverImageUrl}
                      alt={bookData.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                      No image available
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Badge 
                    variant="secondary" 
                    className={
                      bookData.condition === "excellent" ? "bg-green-100 text-green-800" :
                      bookData.condition === "good" ? "bg-blue-100 text-blue-800" :
                      bookData.condition === "fair" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }
                  >
                    {bookData.condition.charAt(0).toUpperCase() + bookData.condition.slice(1)} Condition
                  </Badge>
                  <Badge variant="outline">{bookData.category}</Badge>
                </div>
              </div>

              {/* Book Details */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">{bookData.title}</h1>
                  <p className="text-xl text-slate-600 mb-4">by {bookData.author}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                    <span>Language: {bookData.language}</span>
                    {bookData.isbn && <span>ISBN: {bookData.isbn}</span>}
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(bookData.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {bookData.description && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Description</h3>
                    <p className="text-slate-600 leading-relaxed">{bookData.description}</p>
                  </div>
                )}

                {/* Donor Info */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-slate-900 mb-3">Shared by</h3>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={bookData.donor?.profileImageUrl} />
                      <AvatarFallback>
                        {bookData.donor?.firstName?.[0]}{bookData.donor?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-slate-900">
                        {bookData.donor?.firstName} {bookData.donor?.lastName}
                      </p>
                      <p className="text-sm text-slate-500 flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        Donor
                      </p>
                    </div>
                  </div>
                </div>

                {/* Request Button */}
                <div className="border-t pt-6">
                  {!isAuthenticated ? (
                    <div className="text-center">
                      <p className="text-slate-600 mb-4">Please sign in to request this book</p>
                      <Link href="/login">
                        <Button className="bg-primary-500 hover:bg-primary-600 text-white">
                          Sign In
                        </Button>
                      </Link>
                    </div>
                  ) : canRequestBook ? (
                    <Button
                      onClick={() => setShowRequestModal(true)}
                      className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3"
                      size="lg"
                    >
                      Request This Book
                    </Button>
                  ) : bookData.status !== "available" ? (
                    <div className="text-center">
                      <Badge variant="secondary" className="mb-2">
                        {bookData.status === "requested" ? "Currently Requested" : "Already Donated"}
                      </Badge>
                      <p className="text-sm text-slate-600">This book is no longer available</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-slate-600">You cannot request your own book</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {showRequestModal && (
        <RequestBookModal
          book={bookData}
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
        />
      )}
    </div>
  );
}
