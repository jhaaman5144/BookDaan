import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddBookModal from "@/components/add-book-modal";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Book, Heart, Star, Award, Edit, Trash2, Check, X } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function DonorDashboard() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showAddBookModal, setShowAddBookModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, setLocation]);

  const { data: books } = useQuery({
    queryKey: ["/api/books/donor/me"],
  });

  const { data: requests } = useQuery({
    queryKey: ["/api/requests/donor/me"],
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: number; status: string }) => {
      await apiRequest("PATCH", `/api/requests/${requestId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/requests/donor/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/books/donor/me"] });
      toast({
        title: "Success",
        description: "Request status updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteBookMutation = useMutation({
    mutationFn: async (bookId: number) => {
      await apiRequest("DELETE", `/api/books/${bookId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books/donor/me"] });
      toast({
        title: "Success",
        description: "Book deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!user) {
    return <div>Loading...</div>;
  }

  const stats = {
    totalBooks: books?.length || 0,
    availableBooks: books?.filter((book: any) => book.status === "available").length || 0,
    donatedBooks: books?.filter((book: any) => book.status === "donated").length || 0,
    pendingRequests: requests?.filter((req: any) => req.status === "pending").length || 0,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Donor Dashboard</h1>
          <p className="text-slate-600">Welcome back, {user.firstName}! Manage your book donations here.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Total Books</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.totalBooks}</p>
                </div>
                <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                  <Book className="h-6 w-6 text-primary-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary-600 font-medium">Available</p>
                  <p className="text-3xl font-bold text-secondary-900">{stats.availableBooks}</p>
                </div>
                <div className="w-12 h-12 bg-secondary-50 rounded-lg flex items-center justify-center">
                  <Heart className="h-6 w-6 text-secondary-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-accent-600 font-medium">Donated</p>
                  <p className="text-3xl font-bold text-accent-900">{stats.donatedBooks}</p>
                </div>
                <div className="w-12 h-12 bg-accent-50 rounded-lg flex items-center justify-center">
                  <Award className="h-6 w-6 text-accent-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Pending Requests</p>
                  <p className="text-3xl font-bold text-purple-900">{stats.pendingRequests}</p>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button
            onClick={() => setShowAddBookModal(true)}
            className="bg-primary-500 hover:bg-primary-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Book
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="books" className="space-y-6">
          <TabsList>
            <TabsTrigger value="books">My Books</TabsTrigger>
            <TabsTrigger value="requests">Book Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="books">
            <Card>
              <CardHeader>
                <CardTitle>My Books</CardTitle>
              </CardHeader>
              <CardContent>
                {books?.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-600 mb-4">You haven't added any books yet.</p>
                    <Button onClick={() => setShowAddBookModal(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Book
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date Added</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {books?.map((book: any) => (
                        <TableRow key={book.id}>
                          <TableCell className="font-medium">{book.title}</TableCell>
                          <TableCell>{book.author}</TableCell>
                          <TableCell>{book.category}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                book.status === "available" ? "secondary" :
                                book.status === "requested" ? "default" : "outline"
                              }
                            >
                              {book.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(book.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="ghost">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteBookMutation.mutate(book.id)}
                                disabled={book.status !== "available"}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Book Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {requests?.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-600">No requests yet. Share more books to get requests!</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Book</TableHead>
                        <TableHead>Requested By</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests?.map((request: any) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">Book #{request.bookId}</TableCell>
                          <TableCell>User #{request.recipientId}</TableCell>
                          <TableCell>{request.message || "No message"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                request.status === "pending" ? "default" :
                                request.status === "accepted" ? "secondary" :
                                request.status === "completed" ? "outline" : "destructive"
                              }
                            >
                              {request.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {request.status === "pending" && (
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => updateRequestMutation.mutate({
                                    requestId: request.id,
                                    status: "accepted"
                                  })}
                                  disabled={updateRequestMutation.isPending}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => updateRequestMutation.mutate({
                                    requestId: request.id,
                                    status: "rejected"
                                  })}
                                  disabled={updateRequestMutation.isPending}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                            {request.status === "accepted" && (
                              <Button
                                size="sm"
                                onClick={() => updateRequestMutation.mutate({
                                  requestId: request.id,
                                  status: "completed"
                                })}
                                disabled={updateRequestMutation.isPending}
                              >
                                Mark Complete
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {showAddBookModal && (
        <AddBookModal
          isOpen={showAddBookModal}
          onClose={() => setShowAddBookModal(false)}
        />
      )}
    </div>
  );
}
