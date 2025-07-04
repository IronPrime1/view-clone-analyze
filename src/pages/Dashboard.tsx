import React, { useState, useEffect } from "react";
import { useYoutube } from "../contexts/YoutubeContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  PlusCircle,
  RefreshCw,
  Upload,
  User,
  PlaySquare,
  Eye,
  ThumbsUp,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const {
    ownChannel,
    competitors,
    topVideos,
    addCompetitor,
    refreshData,
    isLoading,
    login,
  } = useYoutube();
  const [channelInput, setChannelInput] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleAddCompetitor = async () => {
    if (!channelInput.trim()) {
      return;
    }

    await addCompetitor(channelInput);
    setChannelInput("");
    setDialogOpen(false);
  };

  const handleConnectYoutube = () => {
    login().catch((err) => toast.error("Failed to connect YouTube channel"));
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

  // Check if we have actual top videos data
  const hasTopVideosData = topVideos.length > 0;

  return (
    <div className="space-y-6 px-2 pb-2">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Dashboard</h1>

        {/* Action buttons */}
        <div className="flex gap-2">
          {!ownChannel && (
            <Button
              onClick={handleConnectYoutube}
              className="bg-youtube-red hover:bg-youtube-red/90 h-8 w-10 sm:w-auto sm:px-3"
            >
              <Upload className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Add Your Channel</span>
            </Button>
          )}

          <Button
            onClick={() => setDialogOpen(true)}
            size="sm"
            className="h-8 w-10 sm:w-auto sm:px-3"
          >
            <PlusCircle className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Add Competitor</span>
          </Button>

          <Button
            variant="outline"
            onClick={refreshData}
            disabled={isLoading}
            size="sm"
            className="h-8 w-10 sm:w-auto sm:px-3"
          >
            <RefreshCw
              className={`h-4 w-4 sm:mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
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
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddCompetitor}
              disabled={!channelInput.trim() || isLoading}
            >
              {isLoading ? "Adding..." : "Add Channel"}
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
              <span className="truncate text-blue-600">
                {ownChannel.title || "Your Channel"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-sm font-medium">
                  {ownChannel.subscriberCount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Subscribers</p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  {ownChannel.viewCount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Total Views</p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  {ownChannel.videoCount.toLocaleString()}
                </p>
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
            <Button
              onClick={handleConnectYoutube}
              className="bg-youtube-red hover:bg-youtube-red/90"
            >
              <Upload className="h-4 w-4 mr-2" />
              Connect YouTube
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Top Videos Card */}
      {ownChannel && hasTopVideosData && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b pt-3 mt-0">
            <CardTitle className="text-lg text-center">Top Videos</CardTitle>
          </CardHeader>
          <CardContent className="pt-2 pb-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
              {topVideos.slice(0, 3).map((video) => (
                <a
                  key={video.id}
                  href={`https://youtube.com/watch?v=${video.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-accent/10 hover:bg-accent/20 transition-colors py-2 rounded-xl flex flex-col gap-2"
                >
                  <div className="flex gap-3 items-start">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-24 h-16 sm:w-36 sm:h-24 object-cover rounded-md"
                    />
                    <div className="flex flex-col">
                      <h4 className="text-sm font-semibold line-clamp-2 flex-1">
                        {video.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                        <Eye className="h-3.5 w-3.5" />
                        <span className="font-medium text-sm">
                          {formatViewCount(video.viewCount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Competitor Channel Cards */}
        {competitors.slice(0, 5).map((competitor) => (
          <Card key={competitor.id} className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg justify-center align-center">
                <img
                  src={competitor.thumbnail}
                  alt={competitor.title}
                  className="w-8 h-8 rounded-full"
                />
                <span className="truncate text-red-600">
                  {competitor.title}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-sm font-medium">
                    {competitor.subscriberCount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Subscribers</p>
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {competitor.viewCount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Views</p>
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {competitor.videoCount.toLocaleString()}
                  </p>
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
