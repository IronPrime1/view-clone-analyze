
import React, { useState } from 'react';
import { useYoutube } from '../contexts/YoutubeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  PlusCircle, 
  RefreshCw, 
  Trash2, 
  Eye, 
  MessageSquare, 
  ThumbsUp, 
  ChevronDown, 
  ExternalLink 
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const Competitors: React.FC = () => {
  const { competitors, addCompetitor, removeCompetitor, refreshData, isLoading } = useYoutube();
  const [channelInput, setChannelInput] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [openCompetitors, setOpenCompetitors] = useState<Record<string, boolean>>({});

  const handleAddCompetitor = async () => {
    if (!channelInput.trim()) {
      return;
    }
    
    // Send the raw input to the edge function - it will handle URL parsing and channel ID resolution
    await addCompetitor(channelInput.trim());
    setChannelInput('');
    setDialogOpen(false);
  };

  const toggleCompetitor = (id: string) => {
    setOpenCompetitors(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const openYoutubeVideo = (videoId: string) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };
  
  return (
    <div className="space-y-6 px-2">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Competitors</h1>
        
        <div className="flex gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-8 w-10 sm:h-[100%] sm:w-[100%] whitespace-nowrap">
                <PlusCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Add Competitor</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Competitor Channel</DialogTitle>
              </DialogHeader>
              <div className="pt-4">
                <Label htmlFor="channel-url">Channel URL, Handle, or ID</Label>
                <Input
                  id="channel-url"
                  placeholder="https://youtube.com/@channelname"
                  value={channelInput}
                  onChange={(e) => setChannelInput(e.target.value)}
                  className="mt-2"
                />
              </div>
              <DialogFooter className="gap-3 mt-0 pt-0">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddCompetitor} disabled={!channelInput.trim() || isLoading}>
                  {isLoading ? 'Adding...' : 'Add Channel'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" onClick={refreshData} disabled={isLoading} className="whitespace-nowrap h-8 w-10 sm:h-[100%] sm:w-[100%]">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Data</span>
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
        <div className="space-y-4">
          {competitors.map(competitor => (
            <Collapsible
              key={competitor.id}
              open={openCompetitors[competitor.id]}
              onOpenChange={() => toggleCompetitor(competitor.id)}
            >
              <Card className="shadow-sm">
                <CardHeader className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center gap-4 cursor-pointer w-full">
                        <img 
                          src={competitor.thumbnail} 
                          alt={competitor.title}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1">
                          <CardTitle className="flex items-center text-base sm:text-lg">
                            {competitor.title}
                            <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${openCompetitors[competitor.id] ? 'rotate-180' : ''}`} />
                          </CardTitle>
                          <CardDescription>
                            {competitor.subscriberCount.toLocaleString()} subscribers
                          </CardDescription>
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCompetitor(competitor.id);
                      }}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-5 w-5" />
                      <span className="sr-only">Remove competitor</span>
                    </Button>
                  </div>
                </CardHeader>

                <CollapsibleContent>
                  <CardContent className="max-h-[60vh] overflow-y-auto pt-4 px-4 pb-4 border-t border-gray-300">
                    <div className="space-y-4">
                      {competitor.videos?.map(video => (
                        <div 
                          key={video.id} 
                          className="flex gap-4 pb-2 border-b cursor-pointer hover:bg-muted/50 p-0 rounded-md transition-colors"
                          onClick={() => openYoutubeVideo(video.id)}
                        >
                          <div className="flex-shrink-0 w-20 h-14 relative">
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
                            <div className="flex items-start justify-between">
                              <h3 className="font-medium line-clamp-2">{video.title}</h3>
                              <ExternalLink className="h-4 w-4 flex-shrink-0 ml-2 text-muted-foreground" />
                            </div>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
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
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      )}
    </div>
  );
};

export default Competitors;
