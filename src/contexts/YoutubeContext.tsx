
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';

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

interface YoutubeContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  ownChannel: Channel | null;
  competitors: Channel[];
  topVideos: Video[];
  login: () => Promise<void>;
  logout: () => Promise<void>;
  addCompetitor: (channelUrl: string) => Promise<void>;
  removeCompetitor: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
  getSavedScripts: (videoId: string) => SavedScript[];
}

// Create the context
const YoutubeContext = createContext<YoutubeContextType | undefined>(undefined);

// Custom hook to use the context
export const useYoutube = () => {
  const context = useContext(YoutubeContext);
  if (context === undefined) {
    throw new Error('useYoutube must be used within a YoutubeProvider');
  }
  return context;
};

// Provider component
export const YoutubeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [ownChannel, setOwnChannel] = useState<Channel | null>(null);
  const [competitors, setCompetitors] = useState<Channel[]>([]);
  const [savedScripts, setSavedScripts] = useState<{[videoId: string]: SavedScript[]}>({});
  const [topVideos, setTopVideos] = useState<Video[]>([]);
  const sessionLoadedRef = useRef(false);
  
  // Check if user is authenticated
  useEffect(() => {
    console.log("🔁 useEffect ran - checking user session");
      const checkUser = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          setIsAuthenticated(!!session?.user);

          if (session?.user) {
            sessionLoadedRef.current = true;
            await loadUserData(session.user.id);
          }
        } catch (error) {
          console.error("Authentication error:", error);
        } finally {
          setIsLoading(false);
        }
      };

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setIsAuthenticated(!!session?.user);

          if (event === 'SIGNED_IN' && session?.user && !sessionLoadedRef.current) {
            setTimeout(() => {
              loadUserData(session.user.id);
            }, 0);
          } else if (event === 'SIGNED_OUT') {
            setOwnChannel(null);
            setCompetitors([]);
            setSavedScripts({});
            setTopVideos([]);
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
  
  // Load user's data: profile, competitor channels
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
        await loadOwnChannel(profile);
        // If connected, also load top videos for the user's channel
        if (profile.youtube_channel_id) {
          await loadTopVideos(profile.youtube_channel_id);
        }
      }
      
      // Load competitor channels
      await loadCompetitors();
      
      // Load saved scripts
      await loadSavedScripts();
      
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Failed to load your data");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load top videos for a channel
  const loadTopVideos = async (channelId: string) => {
    try {
      console.log("Loading top videos for channel:", channelId);
      const { data, error } = await supabase.functions.invoke('youtube-fetch', {
        body: {
          channelId: channelId,
          action: 'get_top_videos'
        }
      });
      
      if (error) {
        console.error("Error from edge function:", error);
        throw error;
      }
      
      console.log("Received top videos data:", data);
      
      if (data?.videos && Array.isArray(data.videos)) {
        // Already sorted by view count in the edge function
        setTopVideos(data.videos);
      }
    } catch (error) {
      console.error("Error loading top videos:", error);
    }
  };
  
  // Load the user's own YouTube channel data from their profile
  const loadOwnChannel = async (profile: any) => {
    try {
      if (profile.youtube_channel_id) {
        const channel: Channel = {
          id: profile.youtube_channel_id,
          title: profile.youtube_channel_title || "Your Channel",
          subscriberCount: profile.youtube_subscriber_count || 0,
          viewCount: profile.youtube_view_count || 0,
          videoCount: profile.youtube_video_count || 0,
          thumbnail: profile.youtube_channel_thumbnail || "https://via.placeholder.com/48",
        };
        
        // Fetch videos if needed
        if (!channel.videos) {
          const { data, error } = await supabase.functions.invoke('youtube-fetch', {
            body: {
              channelId: channel.id,
              action: 'get_channel_data'
            }
          });
          
          if (!error && data?.channel?.videos) {
            channel.videos = data.channel.videos;
          }
        }
        
        setOwnChannel(channel);
      }
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
  
  // Log in with YouTube OAuth
  const login = async () => {
    setIsLoading(true);
    
    try {
      // Real Google OAuth URL setup
      const clientId = "423620523301-nje2pffr52v3ast88m2hg6a63qavu4dt.apps.googleusercontent.com";
      const redirectUri = `${window.location.origin}/youtubeauth`;
      const scope = "https://www.googleapis.com/auth/youtube.readonly";
      const responseType = "code";
      const accessType = "offline";
      const prompt = "consent";
      
      // Build authorization URL
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=${responseType}&access_type=${accessType}&prompt=${prompt}`;
      
      // Save auth state in localStorage for when the user returns from OAuth
      localStorage.setItem('pendingYoutubeAuth', 'true');
      
      // Redirect to Google's OAuth page
      window.location.href = authUrl;
      
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
      // The channelInput is now already processed by extractChannelId in the component
      const channelId = channelInput;
      
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
      
      // Update the competitors list
      setCompetitors(competitors.filter(comp => comp.id !== youtubeId));
      
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
      // Call edge function to refresh data
      const { data, error } = await supabase.functions.invoke('youtube-fetch', {
        body: {
          action: 'refresh_data'
        }
      });
      
      if (error) throw error;
      
      await loadCompetitors();
      
      if (ownChannel) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', (await supabase.auth.getUser()).data.user?.id || '')
          .single();
          
        if (profile) {
          await loadOwnChannel(profile);
          // Also refresh top videos
          if (profile.youtube_channel_id) {
            await loadTopVideos(profile.youtube_channel_id);
          }
        }
      }
      
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
    topVideos,
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
