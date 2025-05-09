
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useYoutube } from '../contexts/YoutubeContext';
import { Edit, Save, Trash2, FileText } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const Scripts: React.FC = () => {
  const { competitors, ownChannel } = useYoutube();
  const [activeTab, setActiveTab] = useState('my-scripts');
  const [editingScript, setEditingScript] = useState<string | null>(null);
  const [scriptContent, setScriptContent] = useState('');
  const [scriptTitle, setScriptTitle] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // This would typically come from a database, but for now we'll mock it
  const [scripts, setScripts] = useState([
    { id: '1', title: 'Hook for tech videos', content: 'Are you tired of complicated tech solutions? In this video, I\'ll show you how to solve [problem] in just a few minutes.', date: '2025-05-05' },
    { id: '2', title: 'Competitor analysis intro', content: 'Today we\'re looking at what makes [competitor] videos so successful and how we can learn from their approach.', date: '2025-05-07' },
  ]);
  
  const handleEditScript = (id: string) => {
    const script = scripts.find(s => s.id === id);
    if (script) {
      setEditingScript(id);
      setScriptContent(script.content);
      setScriptTitle(script.title);
      setDialogOpen(true);
    }
  };
  
  const handleSaveScript = () => {
    if (editingScript) {
      // Update existing script
      setScripts(scripts.map(script => 
        script.id === editingScript 
          ? { ...script, title: scriptTitle, content: scriptContent } 
          : script
      ));
      toast.success("Script updated successfully");
    } else {
      // Create new script
      const newScript = {
        id: Date.now().toString(),
        title: scriptTitle,
        content: scriptContent,
        date: new Date().toISOString().split('T')[0]
      };
      setScripts([newScript, ...scripts]);
      toast.success("New script created");
    }
    
    // Reset and close dialog
    setDialogOpen(false);
    setEditingScript(null);
    setScriptContent('');
    setScriptTitle('');
  };
  
  const handleDeleteScript = (id: string) => {
    setScripts(scripts.filter(script => script.id !== id));
    toast.success("Script deleted");
  };
  
  const handleNewScript = () => {
    setEditingScript(null);
    setScriptTitle('');
    setScriptContent('');
    setDialogOpen(true);
  };
  
  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Scripts</h1>
        
        <Button onClick={handleNewScript}>
          <FileText className="h-4 w-4 mr-2" />
          New Script
        </Button>
      </div>
      
      <Tabs defaultValue="my-scripts" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="my-scripts">My Scripts</TabsTrigger>
          <TabsTrigger value="competitor-scripts">Competitor Scripts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="my-scripts" className="space-y-4">
          {scripts.length > 0 ? (
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-4">
                {scripts.map(script => (
                  <Card key={script.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <CardTitle className="text-lg">{script.title}</CardTitle>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditScript(script.id)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:text-destructive" 
                            onClick={() => handleDeleteScript(script.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">Created: {script.date}</p>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap">{script.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="mb-4">You haven't created any scripts yet.</p>
                <Button onClick={handleNewScript}>Create Your First Script</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="competitor-scripts" className="space-y-4">
          <Card>
            <CardContent className="py-10 text-center">
              <p>Competitor scripts will be available in a future update.</p>
              <p className="text-muted-foreground mt-2">
                This feature will allow you to save and analyze scripts from competitor videos.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingScript ? 'Edit Script' : 'Create New Script'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={scriptTitle} 
                onChange={(e) => setScriptTitle(e.target.value)}
                placeholder="Enter a title for your script"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Script Content</Label>
              <Textarea 
                id="content"
                value={scriptContent}
                onChange={(e) => setScriptContent(e.target.value)}
                placeholder="Write your script here..."
                className="min-h-[200px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleSaveScript} 
              disabled={!scriptTitle.trim() || !scriptContent.trim()}
            >
              <Save className="h-4 w-4 mr-2" />
              {editingScript ? 'Update' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Scripts;
