
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ExternalLink, Trash2, Clipboard, Download, Edit3, Check, X, FileText, Calendar, User, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [expandedScripts, setExpandedScripts] = useState<Set<string>>(new Set());
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
      }, 2000);
      
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
      
      setScripts(scripts.map(script => 
        script.id === editingScript 
          ? { ...script, content: editContent }
          : script
      ));
      
      toast.success("Auto-saved", { duration: 1500 });
    } catch (error: any) {
      console.error("Auto-save error:", error);
      toast.error("Failed to auto-save");
    }
  };

  const toggleScriptExpansion = (scriptId: string) => {
    setExpandedScripts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(scriptId)) {
        newSet.delete(scriptId);
      } else {
        newSet.add(scriptId);
      }
      return newSet;
    });
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
      
      setScripts(scripts.map(script => 
        script.id === editingScript 
          ? { ...script, content: editContent }
          : script
      ));
      
      setEditingScript(null);
      setEditContent('');
      toast.success("Script saved");
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error("Failed to save changes");
    }
  };

  const handleCopyScript = (content: string) => {
    if (!content) return;
    
    navigator.clipboard.writeText(content)
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => toast.error("Failed to copy"));
  };
  
  const handleDownloadScript = (content: string, videoId: string, videoTitle: string) => {
    if (!content) return;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const sanitizedTitle = videoTitle?.replace(/[^a-zA-Z0-9]/g, '_') || 'script';
    a.download = `${sanitizedTitle}_${videoId}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Script downloaded");
  };
  
  const fetchScripts = async () => {
    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }
      
      const { data: scriptsData, error } = await supabase
        .from('saved_scripts')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      const scriptsWithDetails = await Promise.all(scriptsData.map(async (script) => {
        const { data: videoData } = await supabase
          .from('competitor_videos')
          .select('title, channel_id')
          .eq('youtube_id', script.video_id)
          .single();
        
        let channelTitle = '';
        
        if (videoData?.channel_id) {
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
      toast.success('Script deleted');
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
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading scripts...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen p-4 lg:p-6 bg-background">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-2xl lg:text-3xl font-bold">Script Library</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your saved scripts with auto-save editing
          </p>
        </div>

        {scripts.length > 0 ? (
          <div className="space-y-4">
            {scripts.map(script => {
              const isExpanded = expandedScripts.has(script.id);
              
              return (
                <Card key={script.id} className="border card-shadow card-shadow-hover">
                  <Collapsible 
                    open={isExpanded}
                    onOpenChange={() => toggleScriptExpansion(script.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <CardHeader className="hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col items-start text-left space-y-2 flex-1">
                            <CardTitle className="text-base line-clamp-2 text-left">
                              {script.video_title}
                            </CardTitle>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>{script.channel_title}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(script.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="ml-4">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {editingScript === script.id ? (
                              <>
                                <Button 
                                  size="sm"
                                  onClick={handleEditSave}
                                  className="text-green-600 hover:text-green-700"
                                  variant="outline"
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Save
                                </Button>
                                <Button 
                                  size="sm"
                                  onClick={handleEditCancel}
                                  variant="outline"
                                  className="text-gray-600 hover:text-gray-700"
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Cancel
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button 
                                  size="sm"
                                  onClick={() => handleEditStart(script)}
                                  variant="outline"
                                >
                                  <Edit3 className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button 
                                  size="sm" 
                                  onClick={() => handleCopyScript(script.content)}
                                  variant="outline"
                                >
                                  <Clipboard className="h-4 w-4 mr-1" />
                                  Copy
                                </Button>
                                <Button 
                                  size="sm"
                                  onClick={() => handleDownloadScript(script.content, script.video_id, script.video_title || 'script')}
                                  variant="outline"
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </Button>
                                <Button 
                                  size="sm" 
                                  onClick={() => openYouTubeVideo(script.video_id)}
                                  variant="outline"
                                >
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  View Video
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-destructive hover:text-destructive/80" 
                                  onClick={() => handleDeleteScript(script.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </>
                            )}
                          </div>

                          {/* Script Content */}
                          <div className="border rounded-lg card-shadow">
                            {editingScript === script.id ? (
                              <div className="p-4">
                                <Textarea
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  className="min-h-[300px] border-0 focus:ring-0 bg-transparent resize-none font-mono text-sm"
                                  placeholder="Edit your script..."
                                />
                                <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                  Auto-saving changes...
                                </div>
                              </div>
                            ) : (
                              <ScrollArea className="h-80 p-4">
                                <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono">
                                  {script.content}
                                </pre>
                              </ScrollArea>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-16 card-shadow">
            <CardContent>
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">No scripts saved yet</h3>
                  <p className="text-muted-foreground">
                    Create your first script from competitor videos
                  </p>
                </div>
                <Button 
                  onClick={() => navigate('/dashboard/clone')}
                  className="mt-4"
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
