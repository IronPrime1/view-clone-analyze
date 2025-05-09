
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchScripts();
  }, []);
  
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
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Saved Scripts</h1>
      </div>
      
      {scripts.length > 0 ? (
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="space-y-4">
            {scripts.map(script => (
              <Card key={script.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div>
                      <CardTitle className="text-lg">{script.video_title}</CardTitle>
                      <p className="text-xs text-muted-foreground">{script.channel_title}</p>
                    </div>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openYouTubeVideo(script.video_id)}
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span className="sr-only">Open Video</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:text-destructive" 
                        onClick={() => handleDeleteScript(script.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Saved: {new Date(script.created_at).toLocaleDateString()}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{script.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="mb-4">You haven't saved any scripts yet.</p>
            <Button onClick={() => navigate('/competitors')}>
              Browse Competitor Videos
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Scripts;
