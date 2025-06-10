import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BookCard from "@/components/book-card";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { BookOpen, Users, Award, Recycle, Heart, Search, UserPlus, Ticket, Handshake } from "lucide-react";

export default function Home() {
  const { isAuthenticated } = useAuth();
  
  const { data: booksData } = useQuery({
    queryKey: ["/api/books?limit=4&status=available"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    retry: false,
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-primary py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 leading-tight">
                  Share Books,<br />
                  <span className="text-primary-600">Spread Knowledge</span>
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed">
                  Connect book lovers across communities. Donate books you've loved, discover new reads, and make knowledge accessible to everyone.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={isAuthenticated ? "/dashboard/donor" : "/login"}>
                  <Button className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 text-lg h-auto">
                    <Heart className="mr-2 h-5 w-5" />
                    Donate Books
                  </Button>
                </Link>
                <Link href="/books">
                  <Button variant="outline" className="border-2 px-8 py-4 text-lg h-auto">
                    <Search className="mr-2 h-5 w-5" />
                    Find Books
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 pt-8 border-t border-slate-200">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600">
                    {stats?.totalBooks || 0}
                  </div>
                  <div className="text-sm text-slate-600">Books Shared</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary-600">
                    {stats?.totalUsers || 0}
                  </div>
                  <div className="text-sm text-slate-600">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent-600">
                    {stats?.co2Saved || 0}T
                  </div>
                  <div className="text-sm text-slate-600">CO₂ Saved</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                alt="Stack of diverse books"
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
              
              {/* Floating cards */}
              <div className="absolute -top-4 -left-4 bg-white rounded-xl p-4 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-secondary-50 rounded-lg flex items-center justify-center">
                    <Recycle className="h-6 w-6 text-secondary-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">98%</div>
                    <div className="text-xs text-slate-600">Books Reused</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-white rounded-xl p-4 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-accent-50 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-accent-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">5.2K+</div>
                    <div className="text-xs text-slate-600">Happy Readers</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">Recently Added Books</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Discover amazing books that fellow readers have shared. From fiction to technical guides, find your next favorite read.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {booksData?.books?.slice(0, 4).map((book: any) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>

          <div className="text-center">
            <Link href="/books">
              <Button variant="outline" className="px-8 py-3">
                View All Books
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">How BookDaan Works</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Simple steps to share knowledge and build a community of readers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-6 group">
              <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-primary-100 transition-colors">
                <UserPlus className="h-8 w-8 text-primary-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-slate-900">Sign Up & Choose Role</h3>
                <p className="text-slate-600">
                  Register as a donor to share books or as a recipient to discover new reads. Join our community in seconds.
                </p>
              </div>
            </div>

            <div className="text-center space-y-6 group">
              <div className="w-20 h-20 bg-secondary-50 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-secondary-100 transition-colors">
                <Ticket className="h-8 w-8 text-secondary-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-slate-900">Share or Request</h3>
                <p className="text-slate-600">
                  Donors can list books they want to share. Recipients can browse and request books they're interested in reading.
                </p>
              </div>
            </div>

            <div className="text-center space-y-6 group">
              <div className="w-20 h-20 bg-accent-50 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-accent-100 transition-colors">
                <Handshake className="h-8 w-8 text-accent-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-slate-900">Connect & Ticket</h3>
                <p className="text-slate-600">
                  Get matched with nearby readers. Coordinate pickup or delivery. Share knowledge and build lasting connections.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16 space-y-6">
            <Card className="bg-gradient-primary">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Ready to Start Sharing?</h3>
                <p className="text-slate-600 mb-6 max-w-xl mx-auto">
                  Join thousands of book lovers who are making knowledge accessible to everyone. Start your journey today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href={isAuthenticated ? "/dashboard/donor" : "/login"}>
                    <Button className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3">
                      Become a Donor
                    </Button>
                  </Link>
                  <Link href="/books">
                    <Button variant="outline" className="border-primary-500 text-primary-600 hover:bg-primary-50 px-8 py-3">
                      Find Books to Read
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">BookDaan</h3>
                  <p className="text-sm text-slate-400">Share Books, Spread Knowledge</p>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Connecting book lovers across communities to make knowledge accessible to everyone through the power of sharing.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/books" className="text-slate-400 hover:text-white text-sm transition-colors">Browse Books</Link></li>
                <li><a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">How it Works</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">Success Stories</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">About Us</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">For Users</h4>
              <ul className="space-y-2">
                <li><Link href="/dashboard/donor" className="text-slate-400 hover:text-white text-sm transition-colors">Become a Donor</Link></li>
                <li><Link href="/books" className="text-slate-400 hover:text-white text-sm transition-colors">Find Books</Link></li>
                <li><Link href="/dashboard/recipient" className="text-slate-400 hover:text-white text-sm transition-colors">Dashboard</Link></li>
                <li><Link href="/dashboard/recipient" className="text-slate-400 hover:text-white text-sm transition-colors">My Requests</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">Help Center</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">© 2024 BookDaan. All rights reserved.</p>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <span className="text-slate-400 text-sm">Made with</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-slate-400 text-sm">for book lovers everywhere</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
