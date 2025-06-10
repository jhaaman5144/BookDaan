import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Heart, Users, Recycle } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-green-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">BookDaan</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/api/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/api/login">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Share Books, <span className="text-green-600">Share Knowledge</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            BookDaan connects book lovers to share, donate, and discover books. 
            Build a sustainable reading community while reducing waste.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/api/login">
              <Button size="lg" className="px-8 py-3">
                Donate Books
              </Button>
            </Link>
            <Link href="/api/login">
              <Button variant="outline" size="lg" className="px-8 py-3">
                Find Books
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How BookDaan Works</h2>
            <p className="text-xl text-gray-600">Simple steps to start sharing knowledge</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Heart className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Donate Books</CardTitle>
                <CardDescription>
                  Share your favorite books with others. Add them to our platform and help build a community library.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Connect Readers</CardTitle>
                <CardDescription>
                  Browse available books and connect with donors. Request books and arrange pickup or delivery.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Recycle className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>Reduce Waste</CardTitle>
                <CardDescription>
                  Give books a second life instead of throwing them away. Help create a sustainable reading ecosystem.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Impact</h2>
            <p className="text-xl text-gray-600">Together, we're making a difference</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">1,234</div>
              <div className="text-gray-600">Books Donated</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">567</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">89</div>
              <div className="text-gray-600">Cities Covered</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">2.3 kg</div>
              <div className="text-gray-600">CO₂ Saved</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Sharing?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join thousands of book lovers who are already making a difference. 
            Start donating or find your next great read today.
          </p>
          <Link href="/api/login">
            <Button size="lg" variant="secondary" className="px-8 py-3">
              Join BookDaan Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <BookOpen className="h-8 w-8 text-green-500" />
              <span className="ml-2 text-2xl font-bold">BookDaan</span>
            </div>
            <div className="text-gray-400">
              © 2024 BookDaan. Made with ❤️ for book lovers.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}