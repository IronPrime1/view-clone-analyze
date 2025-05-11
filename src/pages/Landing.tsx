
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useYoutube } from '../contexts/YoutubeContext';
import { ArrowRight } from 'lucide-react';

const Landing: React.FC = () => {
  const { isAuthenticated, isLoading } = useYoutube();
  const navigate = useNavigate();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleGetStarted = () => {
    navigate('/auth');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f101a] via-[#171a2d] to-[#0d1129] text-white overflow-x-hidden">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img src="/Logo1.png" alt="ScriptX Logo" className="h-10 w-10" />
          <h1 className="text-2xl font-bold">ScriptX</h1>
        </div>
        <Button 
          onClick={handleGetStarted} 
          variant="outline" 
          className="border-white/20 text-white hover:bg-white/10"
        >
          Sign In
        </Button>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 mt-12 md:mt-20 mb-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            Create YouTube Scripts with AI
          </h1>
          <p className="mt-6 text-xl md:text-2xl text-white/80">
            Analyze competitors, clone successful videos, and generate engaging scripts for your YouTube channel
          </p>
          <div className="mt-12">
            <Button 
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-lg px-8 py-6 h-auto rounded-full"
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Powerful Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              title: "Competitor Analysis",
              description: "Track your competitors' performance and learn from their success"
            },
            {
              title: "Video Cloning",
              description: "Analyze top-performing videos and create similar content for your channel"
            },
            {
              title: "AI Script Generation",
              description: "Generate engaging scripts tailored to your audience and channel style"
            }
          ].map((feature, index) => (
            <div 
              key={index} 
              className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all hover:transform hover:translate-y-[-5px]"
            >
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-white/70">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto bg-white/5 rounded-2xl p-8 md:p-12 backdrop-blur-sm border border-white/10">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-2xl font-bold">
              CR
            </div>
            <div>
              <p className="text-lg md:text-xl italic mb-4">"ScriptX has transformed my YouTube strategy. I've saved hours on content planning and script writing, allowing me to upload more consistently."</p>
              <p className="font-semibold">Chris Reynolds</p>
              <p className="text-sm text-white/60">Content Creator, 500K subscribers</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to grow your YouTube channel?</h2>
          <p className="text-lg mb-10 text-white/80">
            Join thousands of creators using ScriptX to analyze competitors and create better content
          </p>
          <Button 
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-lg px-8 py-6 h-auto rounded-full"
          >
            Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-white/10 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <img src="/Logo1.png" alt="ScriptX Logo" className="h-8 w-8" />
            <span className="text-xl font-semibold">ScriptX</span>
          </div>
          <div className="text-white/60 text-sm">
            © {new Date().getFullYear()} ScriptX. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
