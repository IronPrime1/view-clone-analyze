
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useYoutube } from '../contexts/YoutubeContext';
import { ArrowRight, Play, CheckCircle, BarChart2 } from 'lucide-react';
import Nav from '../components/layout/Nav';

const Landing: React.FC = () => {
  const { isAuthenticated, isLoading } = useYoutube();
  const navigate = useNavigate();

  const handleAction = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0c1b] via-[#171a2d] to-[#0d1129] text-white overflow-x-hidden">
      {/* Header */}
      <Nav/>

      {/* Hero Section */}
      <section className="container mx-auto px-4 mt-64 pt-6 md:mt-44 mb-20 sm:pb-2 pb-2">
        <div className="max-w-3xl mx-auto text-center">
          <div className="animate-pulse inline-block px-4 py-1 mb-4 rounded-full bg-white/10 backdrop-blur-sm">
            <span className="text-white/80 text-sm font-medium animate-glow flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-400"></span>
              AI-Powered YouTube Content Creation
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-200 to-blue-400 drop-shadow-lg">
          Clone Viral YouTube Videos with AI
          </h1>
          <p className="sm:mt-6 mt-2 text-md sm:text-xl text-white/80 sm:px-28 px-6">
            Analyze competitors, clone successful videos, and generate engaging scripts for your YouTube channel
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleAction}
              className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-lg px-8 py-2 h-auto rounded-xl sm:mx-0 mx-auto"
            >
              {isAuthenticated ? "Go to Dashboard" : "Get Started"} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="inline" 
              className="text-white hover:bg-white/10 text-lg px-8 py-2 h-auto rounded-xl sm:mx-0 mx-auto border border-white/20"
              onClick={() => window.scrollTo({ top: document.getElementById('features')?.offsetTop, behavior: 'smooth' })}
            >
              <Play className="mr-2 h-5 w-5" /> Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-8 pb-16 pt-48 sm:pt-28">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Powerful Features</h2>
        <p className="text-white/70 text-center max-w-2xl mx-auto mb-16">Transform your YouTube content strategy with our powerful AI tools</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              title: "Competitor Analysis",
              description: "Track your competitors' performance and learn from their success",
              icon: <BarChart2 className="h-10 w-10 text-purple-400" />
            },
            {
              title: "Video Cloning",
              description: "Analyze top-performing videos and create similar content for your channel",
              icon: <CheckCircle className="h-10 w-10 text-blue-400" />
            },
            {
              title: "AI Script Generation",
              description: "Generate engaging scripts tailored to your audience and channel style",
              icon: <Play className="h-10 w-10 text-green-400" />
            }
          ].map((feature, index) => (
            <div 
              key={index} 
              className="bg-white/5 rounded-xl p-8 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all hover:transform hover:translate-y-[-5px] text-center"
            >
              <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-white/70">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "10M+", label: "Scripts Generated" },
            { value: "5K+", label: "Creators" },
            { value: "90%", label: "Time Saved" },
            { value: "24/7", label: "AI Support" }
          ].map((stat, index) => (
            <div key={index} className="p-6">
              <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                {stat.value}
              </div>
              <div className="text-white/60 mt-2">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="container mx-auto sm:px-4 py-16">
        <div className="max-w-4xl mx-auto bg-white/5 rounded-2xl p-4 md:p-6 backdrop-blur-sm border border-white/10">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="sm:w-28 sm:h-16 w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center sm:text-2xl font-bold">
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
            onClick={handleAction}
            className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-lg px-4 py-2 h-auto rounded-xl"
          >
            {isAuthenticated ? "Go to Dashboard" : "Get Started Now"} <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-4 border-t border-white/10 mt-12">
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
