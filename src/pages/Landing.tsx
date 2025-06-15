
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="modern-card p-8 neon-glow">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-foreground font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground overflow-hidden relative">
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large Morphing Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-primary/20 to-accent/10 rounded-full blur-3xl animate-float animate-morphing"></div>
        <div className="absolute top-3/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-secondary/20 to-primary/10 rounded-full blur-3xl animate-float animate-morphing" style={{animationDelay: '2s', animationDuration: '6s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-accent/25 to-muted/15 rounded-full blur-2xl animate-float animate-morphing" style={{animationDelay: '4s', animationDuration: '10s'}}></div>
        
        {/* Orbiting Elements */}
        <div className="absolute top-1/3 left-1/3 w-4 h-4 bg-primary rounded-full animate-orbit opacity-60"></div>
        <div className="absolute top-2/3 right-1/3 w-3 h-3 bg-accent rounded-full animate-orbit opacity-50" style={{animationDelay: '5s', animationDuration: '15s'}}></div>
        
        {/* Enhanced Floating Particles */}
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              backgroundColor: `hsl(var(--primary) / ${0.3 + Math.random() * 0.4})`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 4}s`
            }}
          />
        ))}
        
        {/* Gradient Mesh Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 animate-gradient"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-secondary/10 via-transparent to-primary/10 animate-gradient" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Header */}
      <div className="relative z-10">
        <Nav/>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 mt-32 pt-8 md:mt-24 mb-20">
        <div className="max-w-5xl mx-auto text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-3 px-6 py-3 mb-8 rounded-full bg-card/80 backdrop-blur-md border border-border/50 shadow-lg neon-border">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <span className="text-foreground text-sm font-medium">
                AI-Powered YouTube Content Creation
              </span>
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse-glow"></div>
            </div>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold leading-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent drop-shadow-2xl animate-fade-in mb-8" style={{animationDelay: '0.2s'}}>
            Clone Viral YouTube
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-glow">
              Videos with AI
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 animate-fade-in leading-relaxed" style={{animationDelay: '0.4s'}}>
            Transform competitor analysis into viral content. Generate engaging scripts, 
            analyze performance patterns, and accelerate your YouTube success.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in" style={{animationDelay: '0.6s'}}>
            <Button 
              onClick={handleAction}
              className="group modern-button text-xl px-10 py-4 h-auto rounded-xl shadow-2xl hover-lift neon-glow"
            >
              {isAuthenticated ? "Go to Dashboard" : "Start Creating"} 
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              className="group text-foreground hover:bg-accent/20 text-xl px-10 py-4 h-auto rounded-xl border-2 border-border/50 backdrop-blur-md hover:border-primary/50 transition-all duration-300 hover-lift neon-border"
              onClick={() => window.scrollTo({ top: document.getElementById('features')?.offsetTop, behavior: 'smooth' })}
            >
              <Play className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" /> 
              See How It Works
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 container mx-auto px-8 pb-20 pt-32">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Powerful Features
          </h2>
          <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
            Everything you need to dominate YouTube with data-driven content creation
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              title: "Smart Competitor Analysis",
              description: "Track performance metrics, identify trending topics, and learn from successful channels in your niche",
              icon: <BarChart2 className="h-10 w-10" />,
              gradient: "from-primary to-primary/70",
              delay: "0s"
            },
            {
              title: "AI Video Cloning",
              description: "Analyze viral videos and recreate their success formula with your unique style and voice",
              icon: <Target className="h-10 w-10" />,
              gradient: "from-accent to-accent/70",
              delay: "0.2s"
            },
            {
              title: "Instant Script Generation",
              description: "Generate engaging, high-converting scripts that capture attention and maximize watch time",
              icon: <Zap className="h-10 w-10" />,
              gradient: "from-secondary to-secondary/70",
              delay: "0.4s"
            }
          ].map((feature, index) => (
            <div 
              key={index} 
              className="group relative modern-card p-10 hover-lift neon-border"
              style={{animationDelay: feature.delay}}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className={`relative bg-gradient-to-r ${feature.gradient} rounded-2xl w-20 h-20 flex items-center justify-center mb-8 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg neon-glow`}>
                <div className="text-primary-foreground">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-6 text-center group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-center leading-relaxed group-hover:text-foreground transition-colors">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 container mx-auto px-6 py-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
          {[
            { value: "10M+", label: "Scripts Generated", delay: "0s" },
            { value: "5K+", label: "Creators", delay: "0.1s" },
            { value: "90%", label: "Time Saved", delay: "0.2s" },
            { value: "24/7", label: "AI Support", delay: "0.3s" }
          ].map((stat, index) => (
            <div key={index} className="group hover-lift" style={{animationDelay: stat.delay}}>
              <div className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-4 group-hover:scale-110 transition-transform duration-300 neon-text">
                {stat.value}
              </div>
              <div className="text-muted-foreground group-hover:text-foreground transition-colors font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="relative modern-card p-12 md:p-16 neon-border hover-lift">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl"></div>
            <div className="relative flex flex-col md:flex-row items-center gap-10">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-3xl font-bold shadow-lg neon-glow">
                CR
              </div>
              <div className="flex-1">
                <p className="text-xl md:text-2xl italic mb-6 text-foreground leading-relaxed">
                  "ScriptX revolutionized my content strategy. The AI-generated scripts feel natural, 
                  engage my audience better, and I've seen a 300% increase in watch time."
                </p>
                <div>
                  <p className="font-semibold text-primary text-lg">Chris Reynolds</p>
                  <p className="text-muted-foreground">Content Creator, 500K subscribers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Ready to 10x Your YouTube Growth?
          </h2>
          <p className="text-xl mb-12 text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Join thousands of successful creators who use ScriptX to analyze competitors, 
            generate viral scripts, and build thriving YouTube channels.
          </p>
          <Button 
            onClick={handleAction}
            className="group modern-button text-xl px-12 py-5 h-auto rounded-xl shadow-2xl hover-lift neon-glow"
          >
            {isAuthenticated ? "Go to Dashboard" : "Start Your Journey"} 
            <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 container mx-auto px-6 py-10 border-t border-border/50 mt-16">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-6 md:mb-0">
            <div className="relative">
              <img src="/Logo1.png" alt="ScriptX Logo" className="h-10 w-10 rounded-lg shadow-md" />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-lg"></div>
            </div>
            <span className="text-2xl font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">ScriptX</span>
          </div>
          <div className="text-muted-foreground">
            © {new Date().getFullYear()} ScriptX. Empowering creators worldwide.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
