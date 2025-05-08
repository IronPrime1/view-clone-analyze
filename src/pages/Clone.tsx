
import React, { useState } from 'react';
import { useYoutube } from '../contexts/YoutubeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Clipboard, Download, Save } from 'lucide-react';
import { toast } from '../components/ui/sonner';

const Clone: React.FC = () => {
  const { competitors, ownChannel, generateScript, saveScript, isLoading } = useYoutube();
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>('');
  const [selectedVideo, setSelectedVideo] = useState<string>('');
  const [ownVideoUrl, setOwnVideoUrl] = useState<string>('');
  const [generatedScript, setGeneratedScript] = useState<string>('');

  const handleCompetitorChange = (value: string) => {
    setSelectedCompetitor(value);
    setSelectedVideo(''); // Reset video selection
    setGeneratedScript(''); // Reset generated script
  };

  const handleVideoChange = (value: string) => {
    setSelectedVideo(value);
    setGeneratedScript(''); // Reset generated script
  };

  const handleGenerateScript = async () => {
    if (!selectedVideo) return;
    
    // Find competitor and video objects
    const competitor = competitors.find(c => c.id === selectedCompetitor);
    if (!competitor || !competitor.videos) return;
    
    const video = competitor.videos.find(v => v.id === selectedVideo);
    if (!video) return;
    
    // Mock URL for demo purposes
    const competitorVideoUrl = `https://youtube.com/watch?v=${video.id}`;
    
    const script = await generateScript(competitorVideoUrl, ownVideoUrl || undefined);
    setGeneratedScript(script);
  };

  const handleSaveScript = async () => {
    if (!selectedVideo || !generatedScript) return;
    
    await saveScript(selectedVideo, generatedScript);
    toast.success('Script saved successfully');
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(generatedScript);
    toast.success('Script copied to clipboard');
  };

  const handleDownloadScript = () => {
    // Create a blob and download it
    const blob = new Blob([generatedScript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `script-${selectedVideo}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Script downloaded');
  };

  // Determine if there are competitors with videos
  const hasCompetitorsWithVideos = competitors.some(c => c.videos && c.videos.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clone</h1>
      </div>

      {!hasCompetitorsWithVideos ? (
        <Card className="shadow-sm">
          <CardContent className="py-8 flex flex-col items-center justify-center">
            <h3 className="text-lg font-medium mb-2">No competitors added yet</h3>
            <p className="text-muted-foreground text-center">
              Add competitor channels to clone their content strategy
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Card className="shadow-sm h-full">
              <CardHeader>
                <CardTitle>Select Content to Clone</CardTitle>
                <CardDescription>
                  Choose a competitor and video to analyze
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="competitor">Competitor Channel</Label>
                  <Select 
                    value={selectedCompetitor} 
                    onValueChange={handleCompetitorChange}
                  >
                    <SelectTrigger id="competitor">
                      <SelectValue placeholder="Select a competitor" />
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

                {selectedCompetitor && (
                  <div>
                    <Label htmlFor="video">Video to Clone</Label>
                    <Select 
                      value={selectedVideo} 
                      onValueChange={handleVideoChange}
                    >
                      <SelectTrigger id="video">
                        <SelectValue placeholder="Select a video" />
                      </SelectTrigger>
                      <SelectContent>
                        {competitors
                          .find(c => c.id === selectedCompetitor)?.videos?.map(video => (
                            <SelectItem key={video.id} value={video.id}>
                              {video.isShort ? '[SHORT] ' : ''}{video.title.substring(0, 50)}
                              {video.title.length > 50 ? '...' : ''}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="own-video">Your Video (Optional)</Label>
                  <Input
                    id="own-video"
                    placeholder="https://youtube.com/watch?v=your-video-id"
                    value={ownVideoUrl}
                    onChange={(e) => setOwnVideoUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Add your own video URL for more personalized analysis
                  </p>
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleGenerateScript}
                  disabled={!selectedVideo || isLoading}
                >
                  {isLoading ? 'Generating...' : 'Generate Script'}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="shadow-sm h-full">
              <CardHeader>
                <CardTitle>Generated Script</CardTitle>
                <CardDescription>
                  Analysis and clone script for the selected video
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea 
                  className="min-h-[300px] font-mono text-sm" 
                  placeholder="Script will appear here after generation"
                  value={generatedScript}
                  readOnly
                />
                
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={handleCopyScript}
                    disabled={!generatedScript}
                  >
                    <Clipboard className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDownloadScript}
                    disabled={!generatedScript}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    onClick={handleSaveScript}
                    disabled={!generatedScript}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clone;
