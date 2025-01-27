"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import SQLGenerator from "@/components/SQLGenerator";
import MongoGenerator from "@/components/MongoGenerator";
import Manual from "@/components/Manual";
import { Button } from "@/components/ui/button";
import { Book, History, Moon, Sun, Code, Database } from "lucide-react";
import { useTheme } from "next-themes";

export default function Home() {
  const [activeTab, setActiveTab] = useState("sql");
  const { theme, setTheme } = useTheme();
  const [showHistory, setShowHistory] = useState(false);
  const [queryHistory, setQueryHistory] = useState<Array<{type: string, query: string, timestamp: Date}>>([]);

  const addToHistory = (type: string, query: string) => {
    setQueryHistory(prev => [{
      type,
      query,
      timestamp: new Date()
    }, ...prev.slice(0, 9)]);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-3">
              <Database className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">Database Schema Generator</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="sql">SQL Generator</TabsTrigger>
                  <TabsTrigger value="mongodb">MongoDB Generator</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center">
                    <Book className="mr-2 h-4 w-4" />
                    Manual
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Database Schema Generator Manual</DialogTitle>
                  </DialogHeader>
                  <Manual />
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <History className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Query History</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {queryHistory.map((item, i) => (
                      <div key={i} className="p-4 rounded-lg border">
                        <div className="flex justify-between text-sm text-muted-foreground mb-2">
                          <span>{item.type}</span>
                          <span>{item.timestamp.toLocaleString()}</span>
                        </div>
                        <pre className="bg-muted p-2 rounded text-sm">
                          <code>{item.query}</code>
                        </pre>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2"
                          onClick={() => navigator.clipboard.writeText(item.query)}
                        >
                          <Code className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow container mx-auto py-8 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="sql" className="w-full">
            <SQLGenerator onQueryGenerated={(query) => addToHistory("SQL", query)} />
          </TabsContent>
          <TabsContent value="mongodb" className="w-full">
            <MongoGenerator onQueryGenerated={(query) => addToHistory("MongoDB", query)} />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t py-8 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Terms of Service</h3>
              <p className="text-sm text-muted-foreground">
                By using this service, you agree to our terms and conditions. This tool is provided as-is without any warranties.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Privacy Policy</h3>
              <p className="text-sm text-muted-foreground">
                We respect your privacy. No data is stored or collected when using this generator.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <p className="text-sm text-muted-foreground">
                For support or inquiries, please visit our GitHub repository.
              </p>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Database Schema Generator. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}