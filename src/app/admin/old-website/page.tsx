import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";

export const metadata = {
  title: 'Old Website - Truth24x7 Admin',
};

export default function OldWebsitePage() {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Old Website</h1>
          <p className="text-muted-foreground mt-2">Legacy WordPress interface</p>
        </div>
        <Button variant="outline" asChild>
          <a href="https://truth24x7.site.je/" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" /> Open in New Tab
          </a>
        </Button>
      </div>
      
      <Card className="flex-1 overflow-hidden border-border/50">
        <div className="w-full min-h-[calc(100vh-200px)] relative bg-muted/20">
          <iframe 
            src="https://truth24x7.site.je/" 
            className="absolute inset-0 w-full h-full border-0"
            title="Old WordPress Website"
          />
        </div>
      </Card>
    </div>
  );
}
