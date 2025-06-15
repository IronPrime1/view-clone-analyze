import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink, Trash2, Clipboard, Download, Edit3, Check, X, FileText, Calendar, User } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Textarea } from '@/components/ui/textarea';
import { useTheme } from '../contexts/ThemeContext';

interface Script {
  id: string;
  content: string;
  created_at: string;
  video_id: string;
  video_title?: string;
  channel_title?: string;
}

const Scripts: React.FC = () => {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingScript, setEditingScript] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  useEffect(() => {
    fetchScripts();
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (editingScript && editContent) {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
      
      const timeout = setTimeout(() => {
        handleAutoSave();
      }, 2000); // Auto-save after 2 seconds of no typing
      
      setSaveTimeout(timeout);
    }
    
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [editContent]);

  const handleAutoSave = async () => {
    if (!editingScript || !editContent) return;
    
    try {
      const { error } = await supabase
        .from('saved_scripts')
        .update({ content: editContent })
        .eq('id', editingScript);
      
      if (error) throw error;
      
      // Update local state
      setScripts(scripts.map(script => 
        script.id === editingScript 
          ? { ...script, content: editContent }
          : script
      ));
      
      toast.success("Script auto-saved", { duration: 2000 });
    } catch (error: any) {
      console.error("Auto-save error:", error);
      toast.error("Failed to auto-save");
    }
  };

  const handleEditStart = (script: Script) => {
    setEditingScript(script.id);
    setEditContent(script.content);
  };

  const handleEditCancel = () => {
    setEditingScript(null);
    setEditContent('');
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
  };

  const handleEditSave = async () => {
    if (!editingScript || !editContent) return;
    
    try {
      const { error } = await supabase
        .from('saved_scripts')
        .update({ content: editContent })
        .eq('id', editingScript);
      
      if (error) throw error;
      
      // Update local state
      setScripts(scripts.map(script => 
        script.id === editingScript 
          ? { ...script, content: editContent }
          : script
      ));
      
      setEditingScript(null);
      setEditContent('');
      toast.success("Script updated successfully");
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error("Failed to save changes");
    }
  };

  // Handle copy to clipboard
  const handleCopyScript = (content: string) => {
    if (!content) return;
    
    navigator.clipboard.writeText(content)
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => toast.error("Failed to copy to clipboard"));
  };
  
  // Handle download script
  const handleDownloadScript = (content: string, videoId: string) => {
    if (!content) return;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `script-${videoId}-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Script downloaded");
  };
  
  const fetchScripts = async () => {
    setIsLoading(true);
    
    try {
      // Get the current user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }
      
      // Fetch saved scripts for the current user
      const { data: scriptsData, error } = await supabase
        .from('saved_scripts')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Fetch video details for each script
      const scriptsWithDetails = await Promise.all(scriptsData.map(async (script) => {
        // Try to find video in competitor_videos table
        const { data: videoData } = await supabase
          .from('competitor_videos')
          .select('title, channel_id')
          .eq('youtube_id', script.video_id)
          .single();
        
        let channelTitle = '';
        
        if (videoData?.channel_id) {
          // Get channel title
          const { data: channelData } = await supabase
            .from('competitor_channels')
            .select('title')
            .eq('id', videoData.channel_id)
            .single();
          
          if (channelData) {
            channelTitle = channelData.title;
          }
        }
        
        return {
          ...script,
          video_title: videoData?.title || 'Unknown Video',
          channel_title: channelTitle || 'Unknown Channel'
        };
      }));
      
      setScripts(scriptsWithDetails);
    } catch (error) {
      console.error('Error fetching scripts:', error);
      toast.error('Failed to load scripts');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteScript = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_scripts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setScripts(scripts.filter(script => script.id !== id));
      toast.success('Script deleted successfully');
    } catch (error) {
      console.error('Error deleting script:', error);
      toast.error('Failed to delete script');
    }
  };
  
  const openYouTubeVideo = (videoId: string) => {
    window.open(`https://youtube.com/watch?v=${videoId}`, '_blank');
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center gap-4">
          <div className={`h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin ${theme === 'neon' ? 'animate-neon-pulse' : ''}`}></div>
          <p className="text-muted-foreground">Loading your scripts...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileText className={`h-8 w-8 text-primary ${theme === 'neon' ? 'neon-glow' : ''}`} />
            <h1 className={`text-3xl lg:text-4xl font-bold ${theme === 'neon' ? 'neon-text' : ''}`}>
              Script Library
            </h1>
          </div>
          <p className="text-muted-foreground text-base lg:text-lg max-w-2xl mx-auto">
            Manage and edit your saved scripts. All changes are automatically saved as you type.
          </p>
        </div>

        {scripts.length > 0 ? (
          <div className="grid gap-4 lg:gap-6">
            {scripts.map(script => (
              <Card 
                key={script.id} 
                className={`overflow-hidden transition-all duration-300 hover-lift card-hover ${
                  theme === 'neon' ? 'neon-border bg-card/90' : 'border-0 shadow-lg bg-card/80 backdrop-blur-sm hover:shadow-xl'
                }`}
              >
                <CardHeader className={`${theme === 'neon' ? 'border-b neon-border' : 'bg-gradient-to-r from-primary/10 to-secondary/10 border-b'}`}>
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="space-y-3">
                      <CardTitle className="text-lg lg:text-xl font-semibold line-clamp-2">
                        {script.video_title}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span className={`px-2 py-1 rounded-full ${theme === 'neon' ? 'bg-primary/20 neon-border' : 'bg-primary/10'}`}>
                            {script.channel_title}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(script.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      {editingScript === script.id ? (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={handleEditSave}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                          >
                            <Check className="h-4 w-4" />
                            <span className="hidden sm:inline ml-1">Save</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={handleEditCancel}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <X className="h-4 w-4" />
                            <span className="hidden sm:inline ml-1">Cancel</span>
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditStart(script)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <Edit3 className="h-4 w-4" />
                            <span className="hidden sm:inline ml-1">Edit</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openYouTubeVideo(script.video_id)}
                            className="text-slate-600 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span className="hidden sm:inline ml-1">View</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:text-destructive/80 hover:bg-destructive/10" 
                            onClick={() => handleDeleteScript(script.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="hidden sm:inline ml-1">Delete</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  <div className="max-h-96 overflow-hidden">
                    {editingScript === script.id ? (
                      <div className="p-4 lg:p-6">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className={`min-h-[300px] border-0 focus:ring-2 focus:ring-primary/20 bg-transparent resize-none font-mono text-sm leading-relaxed ${
                            theme === 'neon' ? 'neon-border focus:neon-glow' : ''
                          }`}
                          placeholder="Edit your script..."
                        />
                        <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full bg-green-500 ${theme === 'neon' ? 'animate-neon-pulse' : 'animate-pulse'}`}></div>
                          Changes are automatically saved as you type
                        </div>
                      </div>
                    ) : (
                      <ScrollArea className="h-96">
                        <div className="p-4 lg:p-6">
                          <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground font-mono">
                            {script.content}
                          </pre>
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                </CardContent>
                
                {editingScript !== script.id && (
                  <div className={`border-t p-4 ${theme === 'neon' ? 'neon-border bg-card/50' : 'border-border bg-muted/30'}`}>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleCopyScript(script.content)}
                        className={`flex-1 ${theme === 'neon' ? 'neon-border hover:neon-glow' : 'hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900/20'}`}
                      >
                        <Clipboard className="mr-2 h-4 w-4" />
                        Copy Script
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadScript(script.content, script.video_id)}
                        className={`flex-1 ${theme === 'neon' ? 'neon-border hover:neon-glow' : 'hover:bg-green-50 hover:border-green-200 dark:hover:bg-green-900/20'}`}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card className={`transition-all duration-300 ${theme === 'neon' ? 'neon-border bg-card/90' : 'border-0 shadow-lg bg-card/80 backdrop-blur-sm'}`}>
            <CardContent className="py-16 text-center">
              <div className="max-w-md mx-auto space-y-6">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${theme === 'neon' ? 'bg-primary/20 neon-border animate-neon-pulse' : 'bg-gradient-to-br from-primary to-secondary'}`}>
                  <FileText className="h-8 w-8 text-primary-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">No scripts saved yet</h3>
                  <p className="text-muted-foreground">
                    Create your first script from competitor videos to get started
                  </p>
                </div>
                <Button 
                  onClick={() => navigate('/dashboard/clone')}
                  className={`transition-all duration-300 ${theme === 'neon' ? 'neon-border hover:neon-glow' : 'bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90'}`}
                >
                  <Edit3 className="mr-2 h-4 w-4" />
                  Create First Script
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Scripts;
