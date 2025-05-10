
import React, { useState, useEffect } from 'react';
import { useYoutube } from '../contexts/YoutubeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { PlusCircle, RefreshCw, Upload, User, PlaySquare, Eye, ThumbsUp, MessageSquare } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { ownChannel, competitors, viewsData, topVideos, addCompetitor, refreshData, isLoading, login, triggerDailyViewsUpdate } = useYoutube();
  const [channelInput, setChannelInput] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  
  // Effect to trigger daily views update when the component mounts
  useEffect(() => {
    // Only run once at page load
    const runOnce = async () => {
      // Check if there is at least one channel
      if (ownChannel || competitors.length > 0) {
        // Wait a bit for other data to load first
        setTimeout(async () => {
          await triggerDailyViewsUpdate();
        }, 1000);
      }
    };
    
    runOnce();
  }, [ownChannel, competitors.length]);
  
  // Format chart data from viewsData
  const prepareChartData = () => {
    // If there's no data, return empty array
    if (!viewsData || Object.keys(viewsData).length === 0) {
      return [];
    }
    
    // Get all dates from all channels
    const allDates: string[] = [];
    Object.values(viewsData).forEach(channelData => {
      channelData.forEach(item => {
        if (!allDates.includes(item.date)) {
          allDates.push(item.date);
        }
      });
    });
    
    // Sort dates
    allDates.sort();
    
    if (allDates.length === 0) {
      return [];
    }
    
    // Get the current date and make sure we only include data up to yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // Filter dates to only include up to yesterday
    const filteredDates = allDates.filter(date => date <= yesterdayStr);
    
    // Prepare chart data with dates and views for each channel
    return filteredDates.map(date => {
      const dataPoint: any = { date };
      
      // Add own channel data
      if (ownChannel && viewsData[ownChannel.id]) {
        const dayData = viewsData[ownChannel.id].find(d => d.date === date);
        if (dayData) {
          dataPoint[ownChannel.title || 'Your Channel'] = dayData.views;
        }
      }
      
      // Add competitor data
      competitors.forEach(comp => {
        if (viewsData[comp.id]) {
          const dayData = viewsData[comp.id].find(d => d.date === date);
          if (dayData) {
            dataPoint[comp.title] = dayData.views;
          }
        }
      });
      
      return dataPoint;
    });
  };
  
  const chartData = prepareChartData();
  
  const handleAddCompetitor = async () => {
    if (!channelInput.trim()) {
      return;
    }
    
    await addCompetitor(channelInput);
    setChannelInput('');
    setDialogOpen(false);
  };
  
  // Generate colors based on index
  const getLineColor = (index: number) => {
    const colors = ['#6b46c1', '#e53e3e', '#38a169', '#d69e2e', '#3182ce', '#d53f8c', '#718096'];
    return colors[index % colors.length];
  };
  
  const handleConnectYoutube = () => {
    login()
      .catch(err => toast.error("Failed to connect YouTube channel"));
  };
  
  // Format view counts for better readability
  const formatViewCount = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };
  
  // Format dates for better readability
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  return (
    <div className="space-y-6 px-2 pb-2">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Dashboard</h1>
        
        {/* Action buttons */}
        <div className="flex gap-2">
          {!ownChannel && (
            <Button onClick={handleConnectYoutube} className="bg-youtube-red hover:bg-youtube-red/90 h-8 w-10 sm:w-auto sm:px-3">
              <Upload className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Add Your Channel</span>
            </Button>
          )}
          
          <Button onClick={() => setDialogOpen(true)} size="sm" className="h-8 w-10 sm:w-auto sm:px-3">
            <PlusCircle className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Add Competitor</span>
          </Button>
          
          <Button variant="outline" onClick={refreshData} disabled={isLoading} size="sm" className="h-8 w-10 sm:w-auto sm:px-3">
            <RefreshCw className={`h-4 w-4 sm:mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Competitor Channel</DialogTitle>
          </DialogHeader>
          <div className="pt-4">
            <Label htmlFor="channel-url">Channel ID</Label>
            <Input
              id="channel-url"
              placeholder="channel ID"
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

      {ownChannel ? (
          <Card className="shadow-sm border-2 border-primary/10">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg align-center justify-center">
                {ownChannel.thumbnail ? (
                  <img 
                    src={ownChannel.thumbnail} 
                    alt={ownChannel.title}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                    <User className="h-4 w-4" />
                  </div>
                )}
                <span className="truncate text-blue-600">{ownChannel.title || 'Your Channel'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-sm font-medium">{ownChannel.subscriberCount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Subscribers</p>
                </div>
                <div>
                  <p className="text-sm font-medium">{ownChannel.viewCount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Views</p>
                </div>
                <div>
                  <p className="text-sm font-medium">{ownChannel.videoCount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Videos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-sm border-2 border-dashed border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Upload className="h-12 w-12 text-youtube-red mb-4" />
              <h3 className="text-lg font-medium mb-2">Connect Your Channel</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Add your YouTube channel to see stats
              </p>
              <Button onClick={handleConnectYoutube} className="bg-youtube-red hover:bg-youtube-red/90">
                <Upload className="h-4 w-4 mr-2" />
                Connect YouTube
              </Button>
            </CardContent>
          </Card>
        )}
      
      {/* Top Videos Card - Only show when user has connected their channel */}
      {ownChannel && topVideos.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Your Top Performing Videos</CardTitle>
            <CardDescription>Videos with the highest view counts</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {topVideos.map((video, index) => (
                <div key={video.id} className="flex gap-3 bg-accent/20 p-3 rounded-lg">
                  <div className="relative flex-shrink-0">
                    <img 
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-md"
                    />
                    {video.isShort && (
                      <span className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        Short
                      </span>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="font-medium text-sm line-clamp-2">{video.title}</h4>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{formatViewCount(video.viewCount)} views</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        <span>{formatViewCount(video.likeCount)} likes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>{formatViewCount(video.commentCount)} comments</span>
                      </div>
                    </div>
                    <a 
                      href={`https://youtube.com/watch?v=${video.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-xs text-primary hover:underline"
                    >
                      <PlaySquare className="h-3 w-3" />
                      Watch on YouTube
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card className="shadow-sm">
        <CardHeader className="pb-3 pt-3 mt-0">
          <CardTitle className="text-lg text-center">Views Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="sm:h-[200px] h-[150px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 20,
                    left: 0,
                    bottom: 20,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    fontSize={10} 
                    tickFormatter={formatDate}
                    tick={{fontSize: 10}}
                  />
                  <YAxis 
                    fontSize={10} 
                    width={40} 
                    tickFormatter={(value: number) => formatViewCount(value)}
                    tick={{fontSize: 10}}
                  />
                  <Tooltip content={({ active, payload, label }) => {
                    if (active && payload?.length) {
                      return (
                        <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
                          <p className="font-medium mb-2">{formatDate(label)}</p>
                          {payload.map((entry, index) => (
                            <div key={index} className="flex justify-between items-center gap-4 mb-1">
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                <p className="text-xs text-muted-foreground">{entry.name}</p>
                              </div>
                              <p className="font-mono text-xs font-medium">{formatViewCount(Number(entry.value))} views</p>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }} />
                  <Legend 
                    iconSize={8} 
                    iconType="circle" 
                    wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} 
                  />
                  
                  {/* Own channel line */}
                  {ownChannel && viewsData[ownChannel.id] && (
                    <Line
                      type="monotone"
                      dataKey={ownChannel.title || 'Your Channel'}
                      stroke="#6b46c1"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 6 }}
                    />
                  )}
                  
                  {/* Competitor lines */}
                  {competitors.map((comp, index) => (
                    viewsData[comp.id] && (
                      <Line
                        key={comp.id}
                        type="monotone"
                        dataKey={comp.title}
                        stroke={getLineColor(index + 1)}
                        strokeWidth={1.5}
                        dot={{ r: 2 }}
                      />
                    )
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No view data available yet. Data will appear after collecting at least one day of data.</p>
              </div>
            )}
          </div>
          {chartData.length === 0 && (
            <div className="flex justify-center mt-2">
              <Button variant="outline" size="sm" onClick={triggerDailyViewsUpdate} className="text-xs">
                <RefreshCw className="h-3 w-3 mr-1" /> Get View Data
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Competitor Channel Cards */}
        {competitors.slice(0, 5).map(competitor => (
          <Card key={competitor.id} className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg justify-center align-center">
                <img 
                  src={competitor.thumbnail} 
                  alt={competitor.title}
                  className="w-8 h-8 rounded-full"
                />
                <span className="truncate text-red-600">{competitor.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-sm font-medium">{competitor.subscriberCount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Subscribers</p>
                </div>
                <div>
                  <p className="text-sm font-medium">{competitor.viewCount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Views</p>
                </div>
                <div>
                  <p className="text-sm font-medium">{competitor.videoCount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Videos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
