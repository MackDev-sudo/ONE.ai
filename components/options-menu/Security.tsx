"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, Lock, Eye, Trash2, Download, Settings, AlertCircle } from "lucide-react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { Conversation } from "@/types/chat";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase";
import { ContactUs } from "./ContactUs";

interface SecurityProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uiStyle?: "modern" | "pixel";
  user?: SupabaseUser | null;
  conversations?: Conversation[];
}

export function Security({ open, onOpenChange, uiStyle = "modern", user, conversations = [] }: SecurityProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isContactUsOpen, setIsContactUsOpen] = useState(false);

  const handleExportData = async () => {
    if (!user) {
      toast.error('Please sign in to export your data');
      return;
    }

    if (conversations.length === 0) {
      toast.info('No conversation data to export');
      return;
    }

    setIsExporting(true);
    
    try {
      toast.info('Exporting data... Please wait.');
      
      const supabase = createClient();
      
      // Prepare CSV headers for detailed export
      const headers = ['Conversation ID', 'Conversation Title', 'Mode', 'Message ID', 'Role', 'Message Content', 'Message Date', 'Conversation Created', 'Conversation Updated'];
      
      const csvRows = [];
      
      // Fetch messages for each conversation
      for (const conversation of conversations) {
        try {
          const { data: messages, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversation.id)
            .order('created_at', { ascending: true });

          if (error) {
            console.error('Error fetching messages for conversation:', conversation.id, error);
            // Add conversation without messages if there's an error
            csvRows.push([
              conversation.id || '',
              (conversation.title || 'Untitled Chat').replace(/"/g, '""'),
              conversation.mode || 'general',
              '',
              '',
              'Error fetching messages',
              '',
              conversation.created_at ? new Date(conversation.created_at).toLocaleString() : '',
              conversation.updated_at ? new Date(conversation.updated_at).toLocaleString() : ''
            ]);
            continue;
          }

          if (messages && messages.length > 0) {
            // Add each message as a separate row
            messages.forEach((message: any) => {
              csvRows.push([
                conversation.id || '',
                (conversation.title || 'Untitled Chat').replace(/"/g, '""'),
                conversation.mode || 'general',
                message.id || '',
                message.role || '',
                (String(message.content || '')).replace(/"/g, '""'), // Escape quotes and clean content
                message.created_at ? new Date(String(message.created_at)).toLocaleString() : '',
                conversation.created_at ? new Date(conversation.created_at).toLocaleString() : '',
                conversation.updated_at ? new Date(conversation.updated_at).toLocaleString() : ''
              ]);
            });
          } else {
            // Add conversation without messages if no messages found
            csvRows.push([
              conversation.id || '',
              (conversation.title || 'Untitled Chat').replace(/"/g, '""'),
              conversation.mode || 'general',
              '',
              '',
              'No messages found',
              '',
              conversation.created_at ? new Date(conversation.created_at).toLocaleString() : '',
              conversation.updated_at ? new Date(conversation.updated_at).toLocaleString() : ''
            ]);
          }
        } catch (msgError) {
          console.error('Error processing conversation:', conversation.id, msgError);
          csvRows.push([
            conversation.id || '',
            (conversation.title || 'Untitled Chat').replace(/"/g, '""'),
            conversation.mode || 'general',
            '',
            '',
            'Error processing conversation',
            '',
            conversation.created_at ? new Date(conversation.created_at).toLocaleString() : '',
            conversation.updated_at ? new Date(conversation.updated_at).toLocaleString() : ''
          ]);
        }
      }

      // Create footer section with disclaimer
      const footerSection = [
        ``,
        `END OF DATA`,
        ``,
        `DISCLAIMER:`,
        `This export contains your personal chat history from ONE.ai platform.`,
        `Please handle this data responsibly and in accordance with privacy laws.`,
        `ONE.ai and Mackdev Inc. are not responsible for the use or misuse of exported data.`,
        `For support or questions, contact: support@mackdev.com`,
        ``,
        `Generated by ONE.ai v1.0.2 - Code Name: Malibu`,
        `Technology by Mackdev Inc. - ${new Date().getFullYear()}`,
        `Visit us: https://github.com/MackDev-sudo`
      ];

      // Create the file content with data table and footer
      const csvContent = [
        // Data table
        headers.join(','),
        ...csvRows.map(row => row.map(field => `"${field}"`).join(',')),
        
        // Footer section (single column)
        ...footerSection.map(line => `"${line}"`)
      ].join('\n');

      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `OneAI_FullChatHistory_${user.email || 'user'}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Chat history exported successfully! ${csvRows.length} messages from ${conversations.length} conversations.`);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAllData = async () => {
    if (!user) {
      toast.error('Please sign in to delete your data');
      return;
    }

    // Show confirmation dialog
    const confirmed = window.confirm(
      'Are you sure you want to delete ALL your data? This action cannot be undone.\n\n' +
      'This will permanently delete:\n' +
      '• All your conversations\n' +
      '• All your messages\n' +
      '• Your chat history\n\n' +
      'Click OK to confirm deletion or Cancel to abort.'
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    
    try {
      toast.info('Deleting all data... Please wait.');
      
      const supabase = createClient();
      
      // First delete all messages for the user's conversations
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .in('conversation_id', conversations.map(c => c.id));

      if (messagesError) {
        console.error('Error deleting messages:', messagesError);
        toast.error('Failed to delete messages. Please try again.');
        return;
      }

      // Then delete all conversations for the user
      const { error: conversationsError } = await supabase
        .from('conversations')
        .delete()
        .eq('user_id', user.id);

      if (conversationsError) {
        console.error('Error deleting conversations:', conversationsError);
        toast.error('Failed to delete conversations. Please try again.');
        return;
      }

      toast.success('All data deleted successfully! Your chat history has been permanently removed.');
      
      // Close the dialog after successful deletion
      onOpenChange(false);
      
    } catch (error) {
      console.error('Error deleting data:', error);
      toast.error('Failed to delete data. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Security & Privacy
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Privacy Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Your Privacy Matters
              </CardTitle>
              <CardDescription>
                We are committed to protecting your privacy and giving you full control over your data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">No Personal Data Collection</p>
                  <p className="text-sm text-muted-foreground">
                    We don't collect or use your personal information for any commercial purposes.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Eye className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium">Chat Data Usage</p>
                  <p className="text-sm text-muted-foreground">
                    Your chat conversations may be used solely for AI training and model improvement. This helps us provide better responses and enhance the overall experience.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Settings className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium">You Are in Control</p>
                  <p className="text-sm text-muted-foreground">
                    You have complete control over your data and can delete it at any time through your account settings.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Data Management
              </CardTitle>
              <CardDescription>
                Manage your data with these simple controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Download className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Export Data</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Download all your chat history and account data
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={handleExportData}
                    disabled={!user || conversations.length === 0 || isExporting}
                  >
                    {isExporting ? 'Exporting...' : 'Export My Data'}
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Trash2 className="h-4 w-4 text-red-500" />
                    <span className="font-medium">Delete Data</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Permanently remove all your data from our systems
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-red-600 hover:text-red-700"
                    onClick={handleDeleteAllData}
                    disabled={!user || conversations.length === 0 || isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete All Data'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Features */}
          <Card>
            <CardHeader>
              <CardTitle>Security Features</CardTitle>
              <CardDescription>
                How we protect your data and conversations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4">
                  <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                    <Lock className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-medium mb-2">Encryption Enabled</h4>
                  <p className="text-sm text-muted-foreground">
                    All communications are encrypted in transit. 
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-medium mb-2">Secure Infrastructure</h4>
                  <p className="text-sm text-muted-foreground">
                    Hosted on enterprise-grade secure cloud infrastructure
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                    <Eye className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-medium mb-2">Privacy by Design</h4>
                  <p className="text-sm text-muted-foreground">
                    Built with privacy and data protection as core principles
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Guest Mode */}
          <Card>
            <CardHeader>
              <CardTitle>Guest Mode Privacy</CardTitle>
              <CardDescription>
                Enhanced privacy for anonymous users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Guest Mode</Badge>
                  <span className="text-sm">No data is saved when using guest access</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  When you use ONE.ai without signing in, your conversations are processed in real-time but not stored. 
                  This provides maximum privacy for users who prefer not to create an account.
                </p>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Contact */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Have questions about our privacy practices?
            </p>
            <Button 
              variant="link" 
              className="text-blue-600 hover:text-blue-700"
              onClick={() => setIsContactUsOpen(true)}
            >
              Contact our Privacy Team
            </Button>
          </div>
        </div>
      </DialogContent>
      
      {/* ContactUs Dialog */}
      <ContactUs 
        open={isContactUsOpen} 
        onOpenChange={setIsContactUsOpen}
        uiStyle={uiStyle}
      />
    </Dialog>
  );
}
