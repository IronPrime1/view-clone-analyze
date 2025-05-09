
import React from 'react';
import { useYoutube } from '../contexts/YoutubeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Clipboard, Eye, MessageSquare, ThumbsUp, Clock, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from '../components/ui/sonner';
import { ScrollArea } from '../components/ui/scroll-area';
import { Badge } from '../components/ui/badge';

const Scripts: React.FC = () => {
  const { competitors, getSavedScripts } = useYoutube();

  // Find all competitors that have videos with saved scripts
  const competitorsWithScripts = competitors.filter(comp => 
    comp.videos?.some(video => 
      getSavedScripts(video.id).length > 0
    )
  );

  const handleCopyScript = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Script copied to clipboard');
  };

  const openYoutubeVideo = (videoId: string) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Scripts</h1>
      </div>

      {competitorsWithScripts.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="py-8 flex flex-col items-center justify-center">
            <h3 className="text-lg font-medium mb-2">No saved scripts yet</h3>
            <p className="text-muted-foreground text-center">
              Go to the Clone tab to analyze competitors' videos and save scripts
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue={competitorsWithScripts[0].id} className="w-full">
          <ScrollArea className="max-w-full">
            <TabsList className="mb-4 w-full justify-start">
              {competitorsWithScripts.map(comp => (
                <TabsTrigger key={comp.id} value={comp.id} className="flex items-center gap-2">
                  <img 
                    src={comp.thumbnail} 
                    alt={comp.title}
                    className="w-5 h-5 rounded-full"
                  />
                  <span className="truncate max-w-[120px]">{comp.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>
          
          {competitorsWithScripts.map(comp => (
            <TabsContent key={comp.id} value={comp.id} className="space-y-6">
              {comp.videos?.filter(video => getSavedScripts(video.id).length > 0).map(video => (
                <Card key={video.id} className="shadow-sm">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div 
                        className="flex-shrink-0 w-full sm:w-32 h-18 cursor-pointer relative"
                        onClick={() => openYoutubeVideo(video.id)}
                      >
                        <img 
                          src={video.thumbnail} 
                          alt={video.title}
                          className="w-full h-full object-cover rounded-md"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/30 transition-opacity rounded-md">
                          <ExternalLink className="w-6 h-6 text-white" />
                        </div>
                        {video.isShort && (
                          <Badge className="absolute bottom-1 left-1 bg-youtube-red text-white">
                            Short
                          </Badge>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{video.title}</CardTitle>
                          {video.isShort && (
                            <Badge className="bg-youtube-red text-white">
                              Short
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="flex items-center gap-3 mt-2">
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
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {getSavedScripts(video.id).map((script, index) => (
                        <AccordionItem key={script.id} value={script.id}>
                          <AccordionTrigger className="text-base font-medium">
                            <div className="flex items-center justify-between w-full">
                              <span>Script {index + 1}</span>
                              <span className="text-xs font-normal text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDate(script.createdAt)}
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="bg-muted/50 p-4 rounded-md relative">
                              <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm overflow-auto max-h-[500px]">
                                {script.content}
                              </pre>
                              <div className="absolute top-2 right-2">
                                <Button 
                                  size="icon" 
                                  variant="ghost"
                                  onClick={() => handleCopyScript(script.content)}
                                  className="h-8 w-8"
                                >
                                  <Clipboard className="h-4 w-4" />
                                  <span className="sr-only">Copy script</span>
                                </Button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default Scripts;
