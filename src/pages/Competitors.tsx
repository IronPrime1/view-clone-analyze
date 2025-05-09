
import React, { useState } from 'react';
import { useYoutube } from '../contexts/YoutubeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { PlusCircle, RefreshCw, Trash2, Eye, MessageSquare, ThumbsUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';

const Competitors: React.FC = () => {
  const { competitors, addCompetitor, removeCompetitor, refreshData, isLoading } = useYoutube();
  const [channelInput, setChannelInput] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddCompetitor = async () => {
    if (!channelInput.trim()) {
      return;
    }
    
    await addCompetitor(channelInput);
    setChannelInput('');
    setDialogOpen(false);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Competitors</h1>
        
        <div className="flex gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Competitor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Competitor Channel</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="channel-url">Channel ID</Label>
                <Input
                  id="channel-url"
                  placeholder="channel ID"
                  value={channelInput}
                  onChange={(e) => setChannelInput(e.target.value)}
                  className="mt-2"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddCompetitor} disabled={!channelInput.trim() || isLoading}>
                  {isLoading ? 'Adding...' : 'Add Channel'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" onClick={refreshData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      </div>
      
      {competitors.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="py-8 flex flex-col items-center justify-center">
            <h3 className="text-lg font-medium mb-2">No competitors added yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add competitor channels to track their performance and analyze their content
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Your First Competitor
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {competitors.map(competitor => (
            <Card key={competitor.id} className="shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={competitor.thumbnail} 
                      alt={competitor.title}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <CardTitle>{competitor.title}</CardTitle>
                      <CardDescription>
                        {competitor.subscriberCount.toLocaleString()} subscribers • {competitor.videoCount.toLocaleString()} videos
                      </CardDescription>
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeCompetitor(competitor.id)}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-5 w-5" />
                    <span className="sr-only">Remove competitor</span>
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">All Videos</TabsTrigger>
                    <TabsTrigger value="regular">Regular Videos</TabsTrigger>
                    <TabsTrigger value="shorts">Shorts</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="space-y-4">
                    {competitor.videos?.map(video => (
                      <div key={video.id} className="flex gap-4 pb-4 border-b">
                        <div className="flex-shrink-0 w-32 h-18 relative">
                          <img 
                            src={video.thumbnail} 
                            alt={video.title}
                            className="w-full h-full object-cover rounded-md"
                          />
                          {video.isShort && (
                            <Badge className="absolute bottom-1 left-1 bg-youtube-red text-white">
                              Short
                            </Badge>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium line-clamp-2">{video.title}</h3>
                          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {video.viewCount.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3" />
                              {video.likeCount.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {video.commentCount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="regular" className="space-y-4">
                    {competitor.videos?.filter(video => !video.isShort).map(video => (
                      <div key={video.id} className="flex gap-4 pb-4 border-b">
                        <div className="flex-shrink-0 w-32 h-18">
                          <img 
                            src={video.thumbnail} 
                            alt={video.title}
                            className="w-full h-full object-cover rounded-md"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium line-clamp-2">{video.title}</h3>
                          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {video.viewCount.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3" />
                              {video.likeCount.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {video.commentCount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="shorts" className="space-y-4">
                    {competitor.videos?.filter(video => video.isShort).map(video => (
                      <div key={video.id} className="flex gap-4 pb-4 border-b">
                        <div className="flex-shrink-0 w-32 h-18 relative">
                          <img 
                            src={video.thumbnail} 
                            alt={video.title}
                            className="w-full h-full object-cover rounded-md"
                          />
                          <Badge className="absolute bottom-1 left-1 bg-youtube-red text-white">
                            Short
                          </Badge>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium line-clamp-2">{video.title}</h3>
                          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {video.viewCount.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3" />
                              {video.likeCount.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {video.commentCount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Competitors;
