
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Clipboard, Download, Save, Wand2 } from 'lucide-react';
import { useYoutube } from '../contexts/YoutubeContext';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

const Clone: React.FC = () => {
  const { competitors } = useYoutube();
  const [selectedCompetitor, setSelectedCompetitor] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [userVideoUrl, setUserVideoUrl] = useState('');
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedScripts, setSavedScripts] = useState<any[]>([]);
  
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
  
  // Handle competitor selection change
  const handleCompetitorChange = (value: string) => {
    setSelectedCompetitor(value);
    setSelectedVideo(null); // Reset video selection
  };
  
  // Handle generate script button click
  const handleGenerateScript = async () => {
    if (!selectedVideo) {
      toast.error("Please select a video first");
      return;
    }
    
    setIsGenerating(true);
    setGeneratedScript(null);
    
    try {
      const video = getVideoById(selectedVideo);
      if (!video) throw new Error("Video not found");
      
      const videoUrl = `https://www.youtube.com/watch?v=${video.id}`;
      
      const { data, error } = await supabase.functions.invoke('clone-script', {
        body: {
          competitorVideoUrl: videoUrl,
          userVideoUrl: userVideoUrl || null
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
      setSavedScripts([...(data || []), savedScripts]);
      
      toast.success("Script saved successfully");
    } catch (error: any) {
      console.error("Error saving script:", error);
      toast.error(error.message || "Failed to save script");
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Clone Competitor Videos</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Content</CardTitle>
              <CardDescription>
                Choose a competitor and video to clone
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
              
              {selectedVideo && getVideoById(selectedVideo) && (
                <div className="mt-4">
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    <img 
                      src={getVideoById(selectedVideo)?.thumbnail} 
                      alt={getVideoById(selectedVideo)?.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="mt-2 font-medium">{getVideoById(selectedVideo)?.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {getVideoById(selectedVideo)?.viewCount.toLocaleString()} views
                  </p>
                </div>
              )}
              
              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="user-video">Your Video (Optional)</Label>
                <Textarea
                  id="user-video"
                  placeholder="Paste your YouTube video URL here"
                  value={userVideoUrl}
                  onChange={(e) => setUserVideoUrl(e.target.value)}
                  className="h-20"
                />
                <p className="text-xs text-muted-foreground">
                  If provided, the script will incorporate elements from your video
                </p>
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
            <CardHeader>
              <CardTitle>Generated Script</CardTitle>
              <CardDescription>
                A customized script based on the competitor's content
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              {generatedScript ? (
                <div className="font-mono text-sm whitespace-pre-wrap bg-muted p-4 rounded-md h-[500px] overflow-y-auto">
                  {generatedScript}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[500px] border-2 border-dashed rounded-md">
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
