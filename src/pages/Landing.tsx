import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useYoutube } from '../contexts/YoutubeContext';
import { ArrowRight, Play, CheckCircle, BarChart2, Sparkles, Zap, Target } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0c1b] via-[#171a2d] to-[#0d1129]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0c1b] via-[#171a2d] to-[#0d1129] text-white overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-indigo-500/15 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
        
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
        
        {/* Gradient Mesh */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-blue-900/20 animate-pulse"></div>
      </div>

      {/* Header */}
      <div className="relative z-50">
        <Nav/>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 mt-8 md:mt-16 mb-20 sm:mb-4 pt-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
              <span className="text-white/90 text-sm font-medium">
                AI-Powered YouTube Content Creation
              </span>
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-200 to-blue-400 drop-shadow-2xl animate-fade-in mb-6" style={{animationDelay: '0.2s'}}>
            Clone Viral YouTube
            <br />
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Videos with AI
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8 animate-fade-in" style={{animationDelay: '0.4s'}}>
            Transform competitor analysis into viral content. Generate engaging scripts, 
            analyze performance patterns, and accelerate your YouTube success.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{animationDelay: '0.6s'}}>
            <Button 
              onClick={handleAction}
              className="group bg-gradient-to-r text-white from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-lg px-8 py-3 h-auto rounded-xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105"
            >
              {isAuthenticated ? "Go to Dashboard" : "Start Creating"} 
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              className="group text-white bg-black text-lg px-8 py-3 h-auto rounded-xl border border-white/20 backdrop-blur-sm hover:border-white/40 transition-all duration-300"
              onClick={() => window.scrollTo({ top: document.getElementById('features')?.offsetTop, behavior: 'smooth' })}
            >
              <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" /> 
              See How It Works
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 container mx-auto px-6 sm:pt-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Powerful Features
          </h2>
          <p className="text-white/70 text-xl max-w-4xl mx-auto">
            Everything you need to dominate YouTube with data-driven content creation
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Smart Competitor Analysis",
              description: "Track performance metrics, identify trending topics, and learn from successful channels in your niche",
              icon: <BarChart2 className="h-8 w-8" />,
              gradient: "from-purple-500 to-pink-500",
              delay: "0s"
            },
            {
              title: "AI Video Cloning",
              description: "Analyze viral videos and recreate their success formula with your unique style and voice",
              icon: <Target className="h-8 w-8" />,
              gradient: "from-blue-500 to-cyan-500",
              delay: "0.2s"
            },
            {
              title: "Instant Script Generation",
              description: "Generate engaging, high-converting scripts that capture attention and maximize watch time",
              icon: <Zap className="h-8 w-8" />,
              gradient: "from-green-500 to-emerald-500",
              delay: "0.4s"
            }
          ].map((feature, index) => (
            <div 
              key={index} 
              className="group relative bg-white/5 rounded-2xl p-8 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-500 hover:transform hover:translate-y-[-8px] hover:shadow-2xl"
              style={{animationDelay: feature.delay}}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className={`relative bg-gradient-to-r ${feature.gradient} rounded-xl w-16 h-16 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                <div className="text-white">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-center group-hover:text-white transition-colors">
                {feature.title}
              </h3>
              <p className="text-white/70 text-center leading-relaxed group-hover:text-white/90 transition-colors">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 container mx-auto px-4 pt-12 sm:pt-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "10M+", label: "Scripts Generated", delay: "0s" },
            { value: "5K+", label: "Creators", delay: "0.1s" },
            { value: "90%", label: "Time Saved", delay: "0.2s" },
            { value: "24/7", label: "AI Support", delay: "0.3s" }
          ].map((stat, index) => (
            <div key={index} className="group" style={{animationDelay: stat.delay}}>
              <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-2 group-hover:scale-110 transition-transform duration-300">
                {stat.value}
              </div>
              <div className="text-white/60 group-hover:text-white/80 transition-colors">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="relative z-10 container mx-auto px-6 pt-12 sm:pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-r from-white/10 to-white/5 rounded-3xl p-8 md:p-12 backdrop-blur-sm border border-white/20 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-3xl"></div>
            <div className="relative flex flex-col md:flex-row items-center gap-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-2xl font-bold shadow-lg">
                CR
              </div>
              <div className="flex-1">
                <p className="text-lg md:text-xl italic mb-4 text-white/90 leading-relaxed">
                  "ScriptX revolutionized my content strategy. The AI-generated scripts feel natural, 
                  engage my audience better, and I've seen a 300% increase in watch time."
                </p>
                <div>
                  <p className="font-semibold text-white">Chris Reynolds</p>
                  <p className="text-sm text-white/60">Content Creator, 500K subscribers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-4 pt-12 sm:pt-24 sm:pb-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
            Ready to 10x Your YouTube Growth?
          </h2>
          <p className="text-lg mb-10 text-white/80 max-w-2xl mx-auto leading-relaxed">
            Join thousands of successful creators who use ScriptX to analyze competitors, 
            generate viral scripts, and build thriving YouTube channels.
          </p>
          <Button 
            onClick={handleAction}
            className="group bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-lg px-10 py-4 h-auto rounded-xl shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105"
          >
            {isAuthenticated ? "Go to Dashboard" : "Start Your Journey"} 
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 container mx-auto px-4 py-4 border-t border-white/10 mt-10">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <img src="/Logo1.png" alt="ScriptX Logo" className="h-8 w-8" />
            <span className="text-xl font-semibold">ScriptX</span>
          </div>
          <div className="text-white/60 text-sm">
            © {new Date().getFullYear()} ScriptX. Empowering creators worldwide.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
