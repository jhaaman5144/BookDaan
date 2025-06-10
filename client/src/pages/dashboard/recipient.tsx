import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BookCard from "@/components/book-card";
import { useAuth } from "@/hooks/useAuth";
import { Search, Heart, BookOpen, Clock } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function RecipientDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, setLocation]);

  const { data: requests } = useQuery({
    queryKey: ["/api/requests/recipient/me"],
  });

  const { data: recommendations } = useQuery({
    queryKey: ["/api/recommendations"],
  });

  if (!user) {
    return <div>Loading...</div>;
  }

  const stats = {
    totalRequests: requests?.length || 0,
    pendingRequests: requests?.filter((req: any) => req.status === "pending").length || 0,
    acceptedRequests: requests?.filter((req: any) => req.status === "accepted").length || 0,
    completedRequests: requests?.filter((req: any) => req.status === "completed").length || 0,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Reader Dashboard</h1>
          <p className="text-slate-600">Welcome back, {user.firstName}! Discover your next great read.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Total Requests</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.totalRequests}</p>
                </div>
                <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-accent-600 font-medium">Pending</p>
                  <p className="text-3xl font-bold text-accent-900">{stats.pendingRequests}</p>
                </div>
                <div className="w-12 h-12 bg-accent-50 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-accent-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary-600 font-medium">Accepted</p>
                  <p className="text-3xl font-bold text-secondary-900">{stats.acceptedRequests}</p>
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
                  <p className="text-sm text-purple-600 font-medium">Completed</p>
                  <p className="text-3xl font-bold text-purple-900">{stats.completedRequests}</p>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Search className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="recommendations" className="space-y-6">
          <TabsList>
            <TabsTrigger value="recommendations">Recommended for You</TabsTrigger>
            <TabsTrigger value="requests">My Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations">
            <Card>
              <CardHeader>
                <CardTitle>Recommended Books</CardTitle>
              </CardHeader>
              <CardContent>
                {recommendations?.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-600 mb-4">No recommendations yet. Update your preferences to get personalized suggestions!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {recommendations?.map((book: any) => (
                      <BookCard key={book.id} book={book} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>My Book Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {requests?.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-600">You haven't made any book requests yet. Browse books to get started!</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Book</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Pickup Location</TableHead>
                        <TableHead>Date Requested</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests?.map((request: any) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">Book #{request.bookId}</TableCell>
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
                          <TableCell>{request.pickupLocation || "Not specified"}</TableCell>
                          <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
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
    </div>
  );
}
