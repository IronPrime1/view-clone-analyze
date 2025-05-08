
import React, { useState } from 'react';
import { useYoutube } from '../contexts/YoutubeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { PlusCircle, RefreshCw, Youtube } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

const Dashboard: React.FC = () => {
  const { ownChannel, competitors, viewsData, addCompetitor, refreshData, isLoading, login } = useYoutube();
  const [channelInput, setChannelInput] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Format chart data from viewsData
  const prepareChartData = () => {
    // If there's no data, return empty array
    if (!viewsData || Object.keys(viewsData).length === 0) {
      return [];
    }
    
    // Get all dates from own channel
    const dates = ownChannel && viewsData[ownChannel.id] 
      ? viewsData[ownChannel.id].map(d => d.date)
      : [];
      
    if (dates.length === 0) {
      return [];
    }
    
    // Prepare chart data with dates and views for each channel
    return dates.map(date => {
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
      .then(() => toast.success("YouTube channel connected successfully"))
      .catch(err => toast.error("Failed to connect YouTube channel"));
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        
        <div className="flex gap-2">
          {!ownChannel && (
            <Button onClick={handleConnectYoutube} className="bg-youtube-red hover:bg-youtube-red/90">
              <Youtube className="h-4 w-4 mr-2" />
              Add Your Channel
            </Button>
          )}
          
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
                <Label htmlFor="channel-url">Channel URL or ID</Label>
                <Input
                  id="channel-url"
                  placeholder="https://youtube.com/c/channel or channel ID"
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
      
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Views Comparison - Last 7 Days</CardTitle>
          <CardDescription>
            Compare daily views between your channel and competitors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  
                  {/* Own channel line */}
                  {ownChannel && (
                    <Line
                      type="monotone"
                      dataKey={ownChannel.title || 'Your Channel'}
                      stroke="#6b46c1"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 8 }}
                    />
                  )}
                  
                  {/* Competitor lines */}
                  {competitors.map((comp, index) => (
                    <Line
                      key={comp.id}
                      type="monotone"
                      dataKey={comp.title}
                      stroke={getLineColor(index + 1)}
                      strokeWidth={1.5}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No view data available. Add competitors to see comparison.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Own Channel Card */}
        {ownChannel ? (
          <Card className="shadow-sm border-2 border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                {ownChannel.thumbnail ? (
                  <img 
                    src={ownChannel.thumbnail} 
                    alt={ownChannel.title}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                    {ownChannel.title?.charAt(0) || 'Y'}
                  </div>
                )}
                <span className="truncate">{ownChannel.title || 'Your Channel'}</span>
              </CardTitle>
              <CardDescription>Your channel</CardDescription>
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
              <Youtube className="h-12 w-12 text-youtube-red mb-4" />
              <h3 className="text-lg font-medium mb-2">Connect Your Channel</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Add your YouTube channel to see stats and compare with competitors
              </p>
              <Button onClick={handleConnectYoutube} className="bg-youtube-red hover:bg-youtube-red/90">
                <Youtube className="h-4 w-4 mr-2" />
                Connect YouTube
              </Button>
            </CardContent>
          </Card>
        )}
        
        {/* Competitor Channel Cards */}
        {competitors.slice(0, 5).map(competitor => (
          <Card key={competitor.id} className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <img 
                  src={competitor.thumbnail} 
                  alt={competitor.title}
                  className="w-8 h-8 rounded-full"
                />
                <span className="truncate">{competitor.title}</span>
              </CardTitle>
              <CardDescription>Competitor</CardDescription>
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
