"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, Lock, Eye, Trash2, Download, Settings, AlertCircle } from "lucide-react";

interface SecurityProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uiStyle?: "modern" | "pixel";
}

export function Security({ open, onOpenChange, uiStyle = "modern" }: SecurityProps) {

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
                  <Button variant="outline" size="sm" className="w-full">
                    Export My Data
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
                  <Button variant="outline" size="sm" className="w-full text-red-600 hover:text-red-700">
                    Delete All Data
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
                  <h4 className="font-medium mb-2">End-to-End Encryption</h4>
                  <p className="text-sm text-muted-foreground">
                    All communications are encrypted in transit and at rest
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
            <Button variant="link" className="text-blue-600 hover:text-blue-700">
              Contact our Privacy Team
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
