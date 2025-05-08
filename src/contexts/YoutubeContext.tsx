import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '../components/ui/sonner';

export interface Channel {
  id: string;
  title: string;
  thumbnail: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  isOwn: boolean;
  videos?: Video[];
}

export interface Video {
  id: string;
  channelId: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnail: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isShort: boolean;
  savedScripts?: SavedScript[];
}

export interface ViewData {
  date: string;
  views: number;
}

export interface SavedScript {
  id: string;
  videoId: string;
  content: string;
  createdAt: string;
}

interface YoutubeContextProps {
  isAuthenticated: boolean;
  ownChannel: Channel | null;
  competitors: Channel[];
  viewsData: Record<string, ViewData[]>;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  addCompetitor: (channelId: string) => Promise<void>;
  removeCompetitor: (channelId: string) => Promise<void>;
  refreshData: () => Promise<void>;
  generateScript: (competitorVideoUrl: string, ownVideoUrl?: string) => Promise<string>;
  saveScript: (videoId: string, content: string) => Promise<void>;
  getSavedScripts: (videoId: string) => SavedScript[];
}

const YoutubeContext = createContext<YoutubeContextProps>({} as YoutubeContextProps);

export const useYoutube = () => useContext(YoutubeContext);

export const YoutubeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [ownChannel, setOwnChannel] = useState<Channel | null>(null);
  const [competitors, setCompetitors] = useState<Channel[]>([]);
  const [viewsData, setViewsData] = useState<Record<string, ViewData[]>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Check for existing authentication on mount
  useEffect(() => {
    // For demo purposes, we'll check local storage
    const authToken = localStorage.getItem('yt_auth_token');
    
    if (authToken) {
      setIsAuthenticated(true);
      // We would fetch the user's channel data here
      const storedChannel = localStorage.getItem('yt_own_channel');
      if (storedChannel) {
        setOwnChannel(JSON.parse(storedChannel));
      } else {
        fetchOwnChannelData(authToken);
      }
      
      // Load competitors from local storage
      const storedCompetitors = localStorage.getItem('yt_competitors');
      if (storedCompetitors) {
        setCompetitors(JSON.parse(storedCompetitors));
      }
      
      // Load views data from local storage
      const storedViewsData = localStorage.getItem('yt_views_data');
      if (storedViewsData) {
        setViewsData(JSON.parse(storedViewsData));
      } else {
        fetchViewsData(authToken);
      }
    }
  }, []);
  
  // Mock function to fetch own channel data
  const fetchOwnChannelData = async (authToken: string) => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call to YouTube
      // For now, let's use mock data
      const mockChannel: Channel = {
        id: 'UC_x5XG1OV2P6uZZ5FSM9Ttw',
        title: 'Your Channel',
        thumbnail: 'https://via.placeholder.com/150',
        subscriberCount: 10000,
        viewCount: 500000,
        videoCount: 50,
        isOwn: true,
        videos: []
      };
      
      setOwnChannel(mockChannel);
      localStorage.setItem('yt_own_channel', JSON.stringify(mockChannel));
    } catch (error) {
      console.error('Error fetching channel data:', error);
      toast.error('Failed to fetch your channel data');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Mock function to fetch views data
  const fetchViewsData = async (authToken: string) => {
    setIsLoading(true);
    try {
      // This would be an API call to YouTube Analytics API
      // Generate mock data for now
      const today = new Date();
      const last7Days: Record<string, ViewData[]> = {
        'UC_x5XG1OV2P6uZZ5FSM9Ttw': [] // Own channel id
      };
      
      // Add mock data for own channel
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const formattedDate = date.toISOString().split('T')[0];
        last7Days['UC_x5XG1OV2P6uZZ5FSM9Ttw'].push({
          date: formattedDate,
          views: Math.floor(Math.random() * 1000 + 500)
        });
      }
      
      // Add mock data for competitors
      competitors.forEach(comp => {
        last7Days[comp.id] = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const formattedDate = date.toISOString().split('T')[0];
          last7Days[comp.id].push({
            date: formattedDate,
            views: Math.floor(Math.random() * 2000 + 200)
          });
        }
      });
      
      setViewsData(last7Days);
      localStorage.setItem('yt_views_data', JSON.stringify(last7Days));
    } catch (error) {
      console.error('Error fetching views data:', error);
      toast.error('Failed to fetch view data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const login = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would redirect to OAuth flow
      // For now, simulate a successful login
      toast.info('Simulating YouTube authentication...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockAuthToken = 'mock_auth_token_' + Date.now();
      localStorage.setItem('yt_auth_token', mockAuthToken);
      setIsAuthenticated(true);
      
      // Fetch channel data
      await fetchOwnChannelData(mockAuthToken);
      await fetchViewsData(mockAuthToken);
      toast.success('Successfully connected to YouTube');
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error('Failed to authenticate with YouTube');
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = () => {
    localStorage.removeItem('yt_auth_token');
    localStorage.removeItem('yt_own_channel');
    // Keep competitors and views data for demo purposes
    setIsAuthenticated(false);
    setOwnChannel(null);
    toast.success('Logged out successfully');
  };
  
  const addCompetitor = async (channelId: string) => {
    setIsLoading(true);
    try {
      // This would be an API call to YouTube Data API
      // For now, generate mock data
      
      // Check if competitor already exists
      if (competitors.some(comp => comp.id === channelId || comp.id === 'mock_' + channelId)) {
        toast.error('This competitor is already added');
        return;
      }
      
      const mockCompetitor: Channel = {
        id: 'mock_' + channelId,
        title: `Competitor ${Math.floor(Math.random() * 100)}`,
        thumbnail: `https://via.placeholder.com/150/6b46c1/FFFFFF?text=${channelId.substring(0, 2).toUpperCase()}`,
        subscriberCount: Math.floor(Math.random() * 1000000 + 10000),
        viewCount: Math.floor(Math.random() * 10000000 + 500000),
        videoCount: Math.floor(Math.random() * 200 + 10),
        isOwn: false,
        videos: Array.from({ length: 10 }, (_, i) => ({
          id: `video_${Date.now()}_${i}`,
          channelId: 'mock_' + channelId,
          title: `Video ${i+1} - Amazing Content for YouTube`,
          description: 'This is a mock video description for demo purposes.',
          publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          thumbnail: `https://via.placeholder.com/320x180/1a365d/FFFFFF?text=Video ${i+1}`,
          viewCount: Math.floor(Math.random() * 100000 + 1000),
          likeCount: Math.floor(Math.random() * 10000 + 100),
          commentCount: Math.floor(Math.random() * 1000 + 10),
          isShort: i % 3 === 0, // Every third video is a short
          savedScripts: []
        }))
      };
      
      const newCompetitors = [...competitors, mockCompetitor];
      setCompetitors(newCompetitors);
      localStorage.setItem('yt_competitors', JSON.stringify(newCompetitors));
      
      // Update views data with the new competitor
      const newViewsData = { ...viewsData };
      newViewsData[mockCompetitor.id] = [];
      
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const formattedDate = date.toISOString().split('T')[0];
        newViewsData[mockCompetitor.id].push({
          date: formattedDate,
          views: Math.floor(Math.random() * 2000 + 200)
        });
      }
      
      setViewsData(newViewsData);
      localStorage.setItem('yt_views_data', JSON.stringify(newViewsData));
      toast.success('Competitor added successfully');
    } catch (error) {
      console.error('Error adding competitor:', error);
      toast.error('Failed to add competitor');
    } finally {
      setIsLoading(false);
    }
  };
  
  const removeCompetitor = async (channelId: string) => {
    setIsLoading(true);
    try {
      const newCompetitors = competitors.filter(comp => comp.id !== channelId);
      setCompetitors(newCompetitors);
      localStorage.setItem('yt_competitors', JSON.stringify(newCompetitors));
      
      // Update views data
      const newViewsData = { ...viewsData };
      delete newViewsData[channelId];
      setViewsData(newViewsData);
      localStorage.setItem('yt_views_data', JSON.stringify(newViewsData));
      toast.success('Competitor removed');
    } catch (error) {
      console.error('Error removing competitor:', error);
      toast.error('Failed to remove competitor');
    } finally {
      setIsLoading(false);
    }
  };
  
  const refreshData = async () => {
    setIsLoading(true);
    try {
      const authToken = localStorage.getItem('yt_auth_token');
      if (!authToken) {
        toast.error('Please authenticate first');
        return;
      }
      
      // Re-fetch data
      await fetchOwnChannelData(authToken);
      await fetchViewsData(authToken);
      
      // Update competitors data
      const updatedCompetitors = [...competitors];
      updatedCompetitors.forEach(comp => {
        // Update video stats
        if (comp.videos) {
          comp.videos.forEach(video => {
            // Increase view count by a random amount
            video.viewCount += Math.floor(Math.random() * 500 + 50);
            video.likeCount += Math.floor(Math.random() * 50 + 5);
            video.commentCount += Math.floor(Math.random() * 10 + 1);
          });
        }
        
        // Update channel stats
        comp.viewCount += Math.floor(Math.random() * 5000 + 500);
        comp.subscriberCount += Math.floor(Math.random() * 100 + 10);
      });
      
      setCompetitors(updatedCompetitors);
      localStorage.setItem('yt_competitors', JSON.stringify(updatedCompetitors));
      
      toast.success('Data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const generateScript = async (competitorVideoUrl: string, ownVideoUrl?: string) => {
    setIsLoading(true);
    try {
      // In a real app, this would be a call to a Supabase Edge function
      // For now, generate mock content
      toast.info('Generating script...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock script generation
      const scriptParts = [
        "# Video Analysis Script",
        `\n\n## Competitor Video: ${competitorVideoUrl}`,
        ownVideoUrl ? `\n\n## Your Video: ${ownVideoUrl}` : '',
        "\n\n## Structure Analysis",
        "\n\n### Hook (0:00-0:15)",
        "\nThe competitor starts with a powerful question and visual demonstration that immediately grabs attention.",
        "\n\n### Introduction (0:15-1:00)",
        "\nPresents the main problem and teases the solution with strong statements about results.",
        "\n\n### Main Content (1:00-8:30)",
        "\nBreaks down solution into 3 clear steps with visual examples for each point.",
        "\nUses data visualization at 5:20 to reinforce key metrics.",
        "\n\n### Call to Action (8:30-9:00)",
        "\nStrongly encourages viewers to implement the strategy with a time-based incentive.",
        "\n\n## Engagement Techniques",
        "\n- Uses pattern interrupts every ~2 minutes with visual or audio cues",
        "\n- Asks viewers questions throughout to maintain engagement",
        "\n- Shows before/after results with specific metrics",
        "\n- Uses emotional storytelling to connect with viewers' pain points",
        "\n\n## Technical Elements",
        "\n- Fast-paced editing with minimal dead air",
        "\n- Background music shifts to match emotional tone of content",
        "\n- Color grading emphasizes blue tones for trust and authority",
        "\n- Text overlays highlight key points and statistics",
        "\n\n## Replication Strategy",
        "\n1. Follow similar structure but customize examples for your niche",
        "\n2. Use same hook format but with your unique angle",
        "\n3. Create similar data visualization for your results",
        "\n4. Match editing pace but improve production quality where possible",
      ].join('');
      
      return scriptParts;
    } catch (error) {
      console.error('Error generating script:', error);
      toast.error('Failed to generate script');
      return 'Error generating script. Please try again.';
    } finally {
      setIsLoading(false);
    }
  };
  
  const saveScript = async (videoId: string, content: string) => {
    setIsLoading(true);
    try {
      // Find the video and add the script to it
      const newCompetitors = [...competitors];
      
      let foundVideo = false;
      for (const comp of newCompetitors) {
        if (!comp.videos) continue;
        
        const videoIndex = comp.videos.findIndex(v => v.id === videoId);
        if (videoIndex >= 0) {
          const video = comp.videos[videoIndex];
          const savedScripts = video.savedScripts || [];
          
          const newScript: SavedScript = {
            id: `script_${Date.now()}`,
            videoId,
            content,
            createdAt: new Date().toISOString()
          };
          
          savedScripts.push(newScript);
          comp.videos[videoIndex] = {
            ...video,
            savedScripts
          };
          
          foundVideo = true;
          break;
        }
      }
      
      if (!foundVideo) {
        throw new Error('Video not found');
      }
      
      setCompetitors(newCompetitors);
      localStorage.setItem('yt_competitors', JSON.stringify(newCompetitors));
      toast.success('Script saved successfully');
    } catch (error) {
      console.error('Error saving script:', error);
      toast.error('Failed to save script');
    } finally {
      setIsLoading(false);
    }
  };
  
  const getSavedScripts = (videoId: string): SavedScript[] => {
    for (const comp of competitors) {
      if (!comp.videos) continue;
      
      const video = comp.videos.find(v => v.id === videoId);
      if (video && video.savedScripts) {
        return video.savedScripts;
      }
    }
    return [];
  };

  return (
    <YoutubeContext.Provider
      value={{
        isAuthenticated,
        ownChannel,
        competitors,
        viewsData,
        isLoading,
        login,
        logout,
        addCompetitor,
        removeCompetitor,
        refreshData,
        generateScript,
        saveScript,
        getSavedScripts
      }}
    >
      {children}
    </YoutubeContext.Provider>
  );
};
