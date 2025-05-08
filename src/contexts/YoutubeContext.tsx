
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from '../components/ui/sonner';

// Define types
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

interface SavedScript {
  id: string;
  content: string;
  createdAt: string;
  videoId: string;
}

interface Channel {
  id: string;
  title: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  thumbnail: string;
  videos?: Video[];
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
  getSavedScripts: (videoId: string) => SavedScript[];
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
  const [savedScripts, setSavedScripts] = useState<{[videoId: string]: SavedScript[]}>({});
  
  // Check if user is authenticated
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
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
          setSavedScripts({});
        }
      }
    );

    checkUser();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Load saved scripts for a video
  const loadSavedScripts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data, error } = await supabase
        .from('saved_scripts')
        .select('*')
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      const scriptsMap: {[videoId: string]: SavedScript[]} = {};
      
      data?.forEach(script => {
        if (!scriptsMap[script.video_id]) {
          scriptsMap[script.video_id] = [];
        }
        
        scriptsMap[script.video_id].push({
          id: script.id,
          content: script.content,
          createdAt: script.created_at,
          videoId: script.video_id
        });
      });
      
      setSavedScripts(scriptsMap);
    } catch (error) {
      console.error("Error loading saved scripts:", error);
    }
  };
  
  // Get saved scripts for a video
  const getSavedScripts = (videoId: string): SavedScript[] => {
    return savedScripts[videoId] || [];
  };
  
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
      
      // Load saved scripts
      await loadSavedScripts();
      
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
      // In a real app, we'll use real API data
      // For now, we'll still use mock data but pretend it's coming from the API
      const mockChannel: Channel = {
        id: "your-channel-id",
        title: "Your YouTube Channel",
        subscriberCount: 5480,
        viewCount: 286400,
        videoCount: 42,
        thumbnail: "https://i.pravatar.cc/150?u=yourChannel",
        videos: [
          {
            id: "video1",
            title: "How to Grow Your Channel",
            description: "Tips and tricks for growing your YouTube channel",
            publishedAt: new Date().toISOString(),
            thumbnail: "https://picsum.photos/id/1/640/360",
            viewCount: 1500,
            likeCount: 120,
            commentCount: 45,
            isShort: false
          },
          {
            id: "video2",
            title: "Quick Editing Tips",
            description: "Fast video editing techniques",
            publishedAt: new Date().toISOString(),
            thumbnail: "https://picsum.photos/id/2/640/360",
            viewCount: 2500,
            likeCount: 230,
            commentCount: 28,
            isShort: true
          }
        ]
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
      // For a real app, we'd implement a proper OAuth flow
      // For now, we'll simulate success with better toast messages
      toast.info("Connecting to YouTube...");
      
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
      let channelId = channelInput;
      
      // If it's a URL, extract the channel ID
      if (channelInput.includes('youtube.com') || channelInput.includes('youtu.be')) {
        const url = new URL(channelInput);
        if (url.pathname.includes('/channel/')) {
          // Extract channel ID from URL like youtube.com/channel/UCxxxxx
          channelId = url.pathname.split('/channel/')[1].split('/')[0];
        } else if (url.pathname.includes('/c/')) {
          // This is a custom URL, need to first resolve to channel ID
          // For simplicity, we'll use it directly but in a real app would need
          // to first convert to a channel ID using YouTube API
          channelId = url.pathname.split('/c/')[1].split('/')[0];
        } else if (url.pathname.includes('/user/')) {
          channelId = url.pathname.split('/user/')[1].split('/')[0];
        }
      }
      
      // Call our edge function to add the competitor
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error("You must be logged in to add competitors");
      }
      
      const { data, error } = await supabase.functions.invoke('youtube-fetch', {
        body: {
          channelId: channelId,
          action: 'add_competitor'
        }
      });
      
      if (error) throw error;
      
      if (!data.success) {
        throw new Error(data.error || "Failed to add competitor");
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
  
  // Remove a competitor channel
  const removeCompetitor = async (youtubeId: string) => {
    setIsLoading(true);
    
    try {
      // First find the db id for the YouTube ID
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error("You must be logged in to remove competitors");
      }
      
      const { data, error } = await supabase
        .from('competitor_channels')
        .select('id')
        .eq('youtube_id', youtubeId)
        .eq('user_id', userData.user.id)
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
        .eq('user_id', userData.user.id);
        
      if (viewsError) throw viewsError;
      
      // Update the competitors list
      setCompetitors(competitors.filter(comp => comp.id !== youtubeId));
      
      // Update views data
      const newViewsData = {...viewsData};
      delete newViewsData[youtubeId];
      setViewsData(newViewsData);
      
      toast.success("Competitor removed");
    } catch (error: any) {
      console.error("Error removing competitor:", error);
      toast.error(error.message || "Failed to remove competitor");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Refresh data from YouTube API
  const refreshData = async () => {
    setIsLoading(true);
    
    try {
      // In a real app, we would call YouTube API again
      await loadCompetitors();
      await loadViewsData();
      toast.success("Data refreshed successfully");
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
    refreshData,
    getSavedScripts
  };
  
  return (
    <YoutubeContext.Provider value={value}>
      {children}
    </YoutubeContext.Provider>
  );
};
