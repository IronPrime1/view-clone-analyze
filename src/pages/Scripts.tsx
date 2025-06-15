
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink, Trash2, Clipboard, Download, Edit3, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Textarea } from '@/components/ui/textarea';

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
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Your Script Library
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Manage and edit your saved scripts. All changes are automatically saved as you type.
          </p>
        </div>

        {scripts.length > 0 ? (
          <div className="grid gap-6">
            {scripts.map(script => (
              <Card key={script.id} className="overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-blue-100 dark:border-slate-700">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                        {script.video_title}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                          {script.channel_title}
                        </span>
                        <span>
                          Saved: {new Date(script.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {editingScript === script.id ? (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={handleEditSave}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={handleEditCancel}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <X className="h-4 w-4" />
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
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openYouTubeVideo(script.video_id)}
                            className="text-slate-600 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:text-destructive/80 hover:bg-destructive/10" 
                            onClick={() => handleDeleteScript(script.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  <div className="max-h-96 overflow-hidden">
                    {editingScript === script.id ? (
                      <div className="p-6">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="min-h-[300px] border-0 focus:ring-2 focus:ring-blue-500/20 bg-transparent resize-none font-mono text-sm leading-relaxed"
                          placeholder="Edit your script..."
                        />
                        <div className="mt-2 text-xs text-muted-foreground">
                          Changes are automatically saved as you type
                        </div>
                      </div>
                    ) : (
                      <ScrollArea className="h-96">
                        <div className="p-6">
                          <pre className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-mono">
                            {script.content}
                          </pre>
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                </CardContent>
                
                {editingScript !== script.id && (
                  <div className="border-t border-slate-100 dark:border-slate-700 p-4 bg-slate-50/50 dark:bg-slate-800/50">
                    <div className="flex gap-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleCopyScript(script.content)}
                        className="flex-1 hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900/20"
                      >
                        <Clipboard className="mr-2 h-4 w-4" />
                        Copy
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadScript(script.content, script.video_id)}
                        className="flex-1 hover:bg-green-50 hover:border-green-200 dark:hover:bg-green-900/20"
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
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardContent className="py-16 text-center">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Edit3 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold">No scripts yet</h3>
                <p className="text-muted-foreground">
                  Start by creating your first script from competitor videos
                </p>
                <Button 
                  onClick={() => navigate('/dashboard/clone')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
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
