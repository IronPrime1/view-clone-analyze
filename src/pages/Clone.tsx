
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Clipboard, Download, Save, Wand2 } from 'lucide-react';
import { useYoutube } from '../contexts/YoutubeContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

const Clone: React.FC = () => {
  const { competitors, ownChannel } = useYoutube();
  const [selectedCompetitor, setSelectedCompetitor] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedScripts, setSavedScripts] = useState<any[]>([]);
  const [ownVideos, setOwnVideos] = useState<any[]>([]);
  const [selectedOwnVideo, setSelectedOwnVideo] = useState<string | null>(null);
  
  // Fetch user's videos on component mount
  useEffect(() => {
    if (ownChannel) {
      // Extract videos from ownChannel if they exist
      if (ownChannel.videos && Array.isArray(ownChannel.videos)) {
        // Take the latest 10 videos
        const latestVideos = ownChannel.videos.slice(0, 10);
        setOwnVideos(latestVideos);
      }
    }
  }, [ownChannel]);
  
  // Get videos for the selected competitor
  const getVideos = () => {
    if (!selectedCompetitor) return [];
    
    const competitor = competitors.find(c => c.id === selectedCompetitor);
    return competitor?.videos || [];
  };
  
  // Get video details by ID
  const getVideoById = (id: string) => {
    if (!selectedCompetitor) return null;
    
    const competitor = competitors.find(c => c.id === selectedCompetitor);
    return competitor?.videos?.find(v => v.id === id);
  };
  
  // Get own video by ID
  const getOwnVideoById = (id: string) => {
    return ownVideos.find(v => v.id === id);
  };
  
  // Handle competitor selection change
  const handleCompetitorChange = (value: string) => {
    setSelectedCompetitor(value);
    setSelectedVideo(null); // Reset video selection
  };
  
  // Handle generate script button click
  const handleGenerateScript = async () => {
    if (!selectedVideo) {
      toast.error("Please select a competitor video first");
      return;
    }

    let userVideoId: string | null = null;
    
    // Get user video if provided
    if (selectedOwnVideo) {
      userVideoId = selectedOwnVideo;
    }
    
    setIsGenerating(true);
    setGeneratedScript(null);
    
    try {
      const video = getVideoById(selectedVideo);
        
      if (!video) throw new Error("Video not found");
      
      const videourl = `https://www.youtube.com/watch?v=${video.id}`;
      const userVideoUrl = userVideoId 
        ? `https://www.youtube.com/watch?v=${userVideoId}` 
        : null;
      
      const { data, error } = await supabase.functions.invoke('clone-script', {
        body: {
          videoUrl: videourl,
          userUrl: userVideoUrl || null,
        }
      });
      
      if (error) throw error;
      
      setGeneratedScript(data.script);
      toast.success("Script generated successfully!");
    } catch (error: any) {
      console.error("Error generating script:", error);
      toast.error(error.message || "Failed to generate script");
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Handle copy to clipboard
  const handleCopyScript = () => {
    if (!generatedScript) return;
    
    navigator.clipboard.writeText(generatedScript)
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => toast.error("Failed to copy to clipboard"));
  };
  
  // Handle download script
  const handleDownloadScript = () => {
    if (!generatedScript) return;
    
    const blob = new Blob([generatedScript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `script-${selectedVideo}-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Script downloaded");
  };
  
  // Handle save script
  const handleSaveScript = async () => {
    if (!generatedScript || !selectedVideo) return;
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      
      if (!userId) {
        toast.error("You must be logged in to save scripts");
        return;
      }
      
      const { data, error } = await supabase
        .from('saved_scripts')
        .insert({
          user_id: userId,
          video_id: selectedVideo,
          content: generatedScript
        })
        .select();
      
      if (error) throw error;
      
      // Add to saved scripts
      setSavedScripts([...(data || []), ...savedScripts]);
      
      toast.success("Script saved successfully");
    } catch (error: any) {
      console.error("Error saving script:", error);
      toast.error(error.message || "Failed to save script");
    }
  };
  
  return (
    <div className="space-y-5 px-2">
      <h1 className="text-xl font-bold">Clone Videos</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardContent className="space-y-2">
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="competitor">Competitor Channel</Label>
                  <Select
                    value={selectedCompetitor || ''}
                    onValueChange={handleCompetitorChange}
                  >
                    <SelectTrigger id="competitor">
                      <SelectValue placeholder="Select a channel" />
                    </SelectTrigger>
                    <SelectContent>
                      {competitors.map(competitor => (
                        <SelectItem key={competitor.id} value={competitor.id}>
                          {competitor.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="video">Competitor Video</Label>
                  <Select
                    value={selectedVideo || ''}
                    onValueChange={setSelectedVideo}
                    disabled={!selectedCompetitor}
                  >
                    <SelectTrigger id="video">
                      <SelectValue placeholder={
                        !selectedCompetitor 
                          ? "Select a channel first" 
                          : "Select a video"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {getVideos().map(video => (
                        <SelectItem key={video.id} value={video.id}>
                          {video.isShort ? "[SHORT] " : ""}{video.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Reference Video Section (showing up to 10 videos) */}
                {ownVideos.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="reference">Reference (Optional)</Label>
                    <Select
                      value={selectedOwnVideo || ''}
                      onValueChange={setSelectedOwnVideo}
                    >
                      <SelectTrigger id="reference">
                        <SelectValue placeholder="Select one of your videos (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {ownVideos.map(video => (
                          <SelectItem key={video.id} value={video.id}>
                            {video.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {selectedVideo && getVideoById(selectedVideo) && (
                  <div className="pt-2">
                    <div className="relative aspect-video rounded-lg overflow-hidden">
                      <img 
                        src={getVideoById(selectedVideo)?.thumbnail} 
                        alt={getVideoById(selectedVideo)?.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="mt-2 font-medium text-center">{getVideoById(selectedVideo)?.title}</h3>
                    <p className="text-sm text-muted-foreground text-center">
                      {getVideoById(selectedVideo)?.viewCount.toLocaleString()} views
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleGenerateScript} 
                disabled={!selectedVideo || isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <div className="mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Script
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader className="sm:pt-4 pt-3 mt-0 mb-0 pb-4 border-b">
              <CardTitle className="text-xl pt-0 mt-0">Generated Script</CardTitle>
              <CardDescription>
                A customized script based on the selected video content
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto pt-6">
              {generatedScript ? (
                <div className="font-mono text-sm rounded-md h-[300px] sm:h-[400px]overflow-y-auto whitespace-pre-wrap pt-2">
                  {generatedScript}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px] sm:h-[440px] border-2 border-dashed rounded-md">
                  <div className="text-center">
                    <Wand2 className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">
                      {isGenerating 
                        ? "Generating script..." 
                        : "Select a video and click 'Generate Script' to create a customized script"}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
            {generatedScript && (
              <CardFooter className="border-t pt-4 gap-2 flex-wrap sm:flex-nowrap">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleCopyScript}
                >
                  <Clipboard className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleDownloadScript}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleSaveScript}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Clone;
