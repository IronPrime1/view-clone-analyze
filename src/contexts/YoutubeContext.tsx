
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from '../components/ui/sonner';

// Define types
interface Channel {
  id: string;
  title: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  thumbnail: string;
}

interface Video {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnail: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isShort: boolean;
}

interface DailyViews {
  date: string;
  views: number;
}

interface ViewsData {
  [channelId: string]: DailyViews[];
}

interface YoutubeContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  ownChannel: Channel | null;
  competitors: Channel[];
  viewsData: ViewsData;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  addCompetitor: (channelUrl: string) => Promise<void>;
  removeCompetitor: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const YoutubeContext = createContext<YoutubeContextType | undefined>(undefined);

export const useYoutube = () => {
  const context = useContext(YoutubeContext);
  if (context === undefined) {
    throw new Error('useYoutube must be used within a YoutubeProvider');
  }
  return context;
};

export const YoutubeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [ownChannel, setOwnChannel] = useState<Channel | null>(null);
  const [competitors, setCompetitors] = useState<Channel[]>([]);
  const [viewsData, setViewsData] = useState<ViewsData>({});
  const [user, setUser] = useState<any>(null);
  
  // Check if user is authenticated
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
        setIsAuthenticated(!!session?.user);
        
        if (session?.user) {
          await loadUserData(session.user.id);
        }
      } catch (error) {
        console.error("Authentication error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        setIsAuthenticated(!!session?.user);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Use setTimeout to prevent potential deadlocks
          setTimeout(() => {
            loadUserData(session.user.id);
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setOwnChannel(null);
          setCompetitors([]);
          setViewsData({});
        }
      }
    );

    checkUser();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Load user's data: profile, competitor channels, and analytics
  const loadUserData = async (userId: string) => {
    setIsLoading(true);
    
    try {
      // Load user profile to check YouTube connection
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profile?.youtube_connected) {
        await loadOwnChannel();
      }
      
      // Load competitor channels
      await loadCompetitors();
      
      // Load daily views data
      await loadViewsData();
      
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Failed to load your data");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load the user's own YouTube channel data
  const loadOwnChannel = async () => {
    try {
      // In a real app, we would call YouTube API here using the stored tokens
      // For now, we'll use mock data
      const mockChannel: Channel = {
        id: "your-channel-id",
        title: "Your YouTube Channel",
        subscriberCount: 5480,
        viewCount: 286400,
        videoCount: 42,
        thumbnail: "https://i.pravatar.cc/150?u=yourChannel"
      };
      
      setOwnChannel(mockChannel);
    } catch (error) {
      console.error("Error loading own channel:", error);
      toast.error("Failed to load your YouTube channel data");
    }
  };
  
  // Load competitor channels from Supabase
  const loadCompetitors = async () => {
    try {
      const { data, error } = await supabase
        .from('competitor_channels')
        .select(`
          id,
          youtube_id,
          title,
          thumbnail,
          subscriber_count,
          video_count,
          view_count,
          competitor_videos (
            id,
            youtube_id,
            title,
            description,
            published_at,
            thumbnail,
            view_count,
            like_count,
            comment_count,
            is_short
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const formattedCompetitors: Channel[] = data?.map(comp => ({
        id: comp.youtube_id,
        title: comp.title,
        subscriberCount: comp.subscriber_count || 0,
        viewCount: comp.view_count || 0,
        videoCount: comp.video_count || 0,
        thumbnail: comp.thumbnail || "https://i.pravatar.cc/150?u=" + comp.youtube_id,
        videos: comp.competitor_videos?.map((video: any) => ({
          id: video.youtube_id,
          title: video.title,
          description: video.description || "",
          publishedAt: video.published_at,
          thumbnail: video.thumbnail,
          viewCount: video.view_count || 0,
          likeCount: video.like_count || 0,
          commentCount: video.comment_count || 0,
          isShort: video.is_short
        }))
      })) || [];
      
      setCompetitors(formattedCompetitors);
    } catch (error) {
      console.error("Error loading competitors:", error);
      toast.error("Failed to load competitor data");
    }
  };
  
  // Load daily views data from Supabase
  const loadViewsData = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_views')
        .select('channel_id, date, views')
        .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date');
      
      if (error) throw error;
      
      const views: ViewsData = {};
      
      data?.forEach(item => {
        if (!views[item.channel_id]) {
          views[item.channel_id] = [];
        }
        
        views[item.channel_id].push({
          date: item.date,
          views: item.views
        });
      });
      
      // If we don't have real data yet, add some mock data
      if (Object.keys(views).length === 0) {
        const dates = Array.from({length: 7}, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return d.toISOString().split('T')[0];
        });
        
        // Mock data for own channel
        if (ownChannel) {
          views[ownChannel.id] = dates.map(date => ({
            date,
            views: Math.floor(Math.random() * 1000) + 500
          }));
        }
        
        // Mock data for competitors
        competitors.forEach(comp => {
          views[comp.id] = dates.map(date => ({
            date,
            views: Math.floor(Math.random() * 800) + 300
          }));
        });
      }
      
      setViewsData(views);
    } catch (error) {
      console.error("Error loading views data:", error);
    }
  };
  
  // Log in with YouTube OAuth
  const login = async () => {
    setIsLoading(true);
    
    try {
      // In a real app, you'd redirect to YouTube OAuth
      // For this prototype, we'll simulate success
      
      // Simulate successful YouTube auth
      setTimeout(() => {
        setIsAuthenticated(true);
        loadOwnChannel();
        toast.success("Successfully connected to YouTube");
        setIsLoading(false);
      }, 1500);
      
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Failed to connect to YouTube");
      setIsLoading(false);
    }
  };
  
  // Log out
  const logout = async () => {
    setIsLoading(true);
    
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setOwnChannel(null);
      toast.info("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add a competitor channel
  const addCompetitor = async (channelInput: string) => {
    setIsLoading(true);
    
    try {
      // Extract channel ID or username from input
      // In a real app, we'd call YouTube API to get channel details
      
      // For now, create a mock competitor
      const randomId = Math.random().toString(36).substring(2, 15);
      const randomSubscribers = Math.floor(Math.random() * 9000) + 1000;
      const randomViews = randomSubscribers * (Math.floor(Math.random() * 50) + 20);
      const randomVideos = Math.floor(Math.random() * 100) + 10;
      
      const newCompetitor = {
        youtube_id: randomId,
        user_id: user.id,
        title: channelInput.includes('/') ? 
          channelInput.split('/').pop() || "Competitor Channel" : 
          channelInput,
        thumbnail: `https://i.pravatar.cc/150?u=${randomId}`,
        subscriber_count: randomSubscribers,
        video_count: randomVideos,
        view_count: randomViews
      };
      
      const { data, error } = await supabase
        .from('competitor_channels')
        .insert(newCompetitor)
        .select();
      
      if (error) throw error;
      
      // Add mock videos
      if (data?.[0]) {
        await addMockVideos(data[0].id, randomId);
      }
      
      toast.success("Competitor channel added");
      
      // Refresh competitors list
      await loadCompetitors();
      await loadViewsData();
      
    } catch (error: any) {
      console.error("Error adding competitor:", error);
      toast.error(error.message || "Failed to add competitor");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add mock videos for a competitor channel
  const addMockVideos = async (channelDbId: string, youtubeId: string) => {
    const videoCount = Math.floor(Math.random() * 6) + 5; // 5-10 videos
    
    const mockVideos = Array.from({ length: videoCount }, (_, i) => {
      const isShort = i % 3 === 0; // Every 3rd video is a short
      const videoId = `v-${Math.random().toString(36).substring(2, 10)}`;
      const viewCount = isShort ? 
        Math.floor(Math.random() * 50000) + 10000 : 
        Math.floor(Math.random() * 10000) + 1000;
      
      const daysAgo = Math.floor(Math.random() * 7);
      const pubDate = new Date();
      pubDate.setDate(pubDate.getDate() - daysAgo);
      
      return {
        channel_id: channelDbId,
        youtube_id: videoId,
        title: isShort ? 
          `Quick ${i + 1}: How to boost engagement instantly` : 
          `The complete guide to growing on YouTube - Part ${i + 1}`,
        description: isShort ? 
          "Short video tip for quick growth!" : 
          "In this video, I share my top strategies for growth on YouTube in 2023...",
        published_at: pubDate.toISOString(),
        thumbnail: `https://picsum.photos/id/${Math.floor(Math.random() * 100)}/640/360`,
        view_count: viewCount,
        like_count: Math.floor(viewCount * 0.1),
        comment_count: Math.floor(viewCount * 0.02),
        is_short: isShort
      };
    });
    
    try {
      const { error } = await supabase
        .from('competitor_videos')
        .insert(mockVideos);
      
      if (error) throw error;
      
      // Generate daily view data
      await generateMockDailyViews(youtubeId);
      
    } catch (error) {
      console.error("Error adding mock videos:", error);
    }
  };
  
  // Generate mock daily view data for a channel
  const generateMockDailyViews = async (youtubeId: string) => {
    const dates = Array.from({length: 7}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });
    
    const mockViews = dates.map(date => ({
      channel_id: youtubeId,
      user_id: user.id,
      date: date,
      views: Math.floor(Math.random() * 1000) + 300
    }));
    
    try {
      const { error } = await supabase
        .from('daily_views')
        .insert(mockViews);
      
      if (error) throw error;
    } catch (error) {
      console.error("Error generating mock views:", error);
    }
  };
  
  // Remove a competitor channel
  const removeCompetitor = async (youtubeId: string) => {
    setIsLoading(true);
    
    try {
      // First find the db id for the YouTube ID
      const { data, error } = await supabase
        .from('competitor_channels')
        .select('id')
        .eq('youtube_id', youtubeId)
        .eq('user_id', user.id)
        .single();
        
      if (error) throw error;
      
      if (data?.id) {
        const { error: deleteError } = await supabase
          .from('competitor_channels')
          .delete()
          .eq('id', data.id);
          
        if (deleteError) throw deleteError;
      }
      
      // Also remove the daily views
      const { error: viewsError } = await supabase
        .from('daily_views')
        .delete()
        .eq('channel_id', youtubeId)
        .eq('user_id', user.id);
        
      if (viewsError) throw viewsError;
      
      // Update the competitors list
      setCompetitors(competitors.filter(comp => comp.id !== youtubeId));
      
      // Update views data
      const newViewsData = {...viewsData};
      delete newViewsData[youtubeId];
      setViewsData(newViewsData);
      
      toast.success("Competitor removed");
    } catch (error) {
      console.error("Error removing competitor:", error);
      toast.error("Failed to remove competitor");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Refresh data from YouTube API
  const refreshData = async () => {
    setIsLoading(true);
    
    try {
      // In a real app, we would call YouTube API again
      toast.success("Data refreshed successfully");
      
      await loadCompetitors();
      await loadViewsData();
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
    } finally {
      setIsLoading(false);
    }
  };
  
  const value = {
    isAuthenticated,
    isLoading,
    ownChannel,
    competitors,
    viewsData,
    login,
    logout,
    addCompetitor,
    removeCompetitor,
    refreshData
  };
  
  return (
    <YoutubeContext.Provider value={value}>
      {children}
    </YoutubeContext.Provider>
  );
};
