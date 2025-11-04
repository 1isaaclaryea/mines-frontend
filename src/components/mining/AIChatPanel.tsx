import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  BarChart3,
  AlertTriangle,
  TrendingUp,
  Lightbulb,
  ArrowLeft
} from "lucide-react";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestions?: string[];
}

interface AIChatPanelProps {
  className?: string;
  onBack?: () => void;
}

export function AIChatPanel({ className, onBack }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your Mining Operations AI Assistant. I can help you analyze your production data, identify trends, and provide insights. What would you like to know?",
      timestamp: new Date().toLocaleTimeString(),
      suggestions: [
        "Show me today's production efficiency",
        "What equipment needs attention?",
        "Analyze throughput trends",
        "Predict maintenance requirements"
      ]
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickQueries = [
    {
      icon: <BarChart3 className="h-4 w-4" />,
      text: "Production Analysis",
      query: "Analyze today's production performance and identify any anomalies"
    },
    {
      icon: <AlertTriangle className="h-4 w-4" />,
      text: "Critical Alerts",
      query: "What are the most critical alerts requiring immediate attention?"
    },
    {
      icon: <TrendingUp className="h-4 w-4" />,
      text: "Efficiency Trends",
      query: "Show me the efficiency trends for the past week"
    },
    {
      icon: <Lightbulb className="h-4 w-4" />,
      text: "Optimization Tips",
      query: "What optimization recommendations do you have based on current data?"
    }
  ];

  const simulateAIResponse = (userQuery: string): string => {
    const responses = {
      production: "Based on current data, production efficiency is at 87.3%, which is 2.7% below target. The primary bottleneck appears to be Crusher Unit 3, which is operating at reduced capacity due to bearing temperature issues. I recommend immediate inspection and potential bearing replacement to restore optimal performance.",
      
      alerts: "Currently, there are 3 critical alerts: 1) Crusher Unit 3 bearing temperature exceeding safe limits (85°C), 2) Conveyor Belt B-7 showing increased vibration patterns indicating potential bearing failure in 36 hours, 3) Water Pump P-12 seal pressure anomaly suggesting replacement needed within 48 hours.",
      
      trends: "Efficiency has declined 3.2% over the past week, primarily due to: increased downtime on Crusher Unit 3 (4.2 hours), suboptimal feed rates during night shifts (avg 238 tons/hr vs 250 target), and higher than normal power consumption in Separation Plant 2 (+8.3% above baseline).",
      
      optimization: "Key optimization opportunities: 1) Increase crusher speed from 85 to 92 RPM for +3.2% throughput, 2) Adjust water pressure from 4.2 to 4.6 bar for +2.1% separation efficiency, 3) Optimize feed rate to 238 tons/hr during peak hours for +1.8% overall efficiency. Estimated annual savings: $2.3M.",
      
      default: "I can help you analyze production data, equipment performance, maintenance schedules, and optimization opportunities. Try asking about specific equipment, production metrics, or requesting trend analysis."
    };

    const query = userQuery.toLowerCase();
    if (query.includes('production') || query.includes('efficiency')) return responses.production;
    if (query.includes('alert') || query.includes('critical')) return responses.alerts;
    if (query.includes('trend') || query.includes('week')) return responses.trends;
    if (query.includes('optimization') || query.includes('recommend')) return responses.optimization;
    return responses.default;
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: simulateAIResponse(inputMessage),
        timestamp: new Date().toLocaleTimeString()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickQuery = (query: string) => {
    setInputMessage(query);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <div className="flex items-center space-x-3">
          {onBack && (
            <Button
              onClick={onBack}
              variant="ghost"
              className="hover:bg-accent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              
            </Button>
          )}
          <h2 className="text-2xl font-bold">AI Assistant</h2>
        </div>
        <p className="text-muted-foreground">Ask questions about your mining operations data and get intelligent insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Quick Query Buttons */}
        <div className="space-y-3">
          <h3 className="font-medium">Quick Queries</h3>
          {quickQueries.map((query, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-start h-auto p-3 border-border"
              onClick={() => handleQuickQuery(query.query)}
            >
              <div className="flex items-start space-x-2">
                {query.icon}
                <span className="text-sm text-left">{query.text}</span>
              </div>
            </Button>
          ))}
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="bg-card border-border h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-blue-400" />
                <span>Chat with AI Assistant</span>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  Online
                </Badge>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex items-start space-x-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <div className={`p-2 rounded-full ${message.type === 'user' ? 'bg-blue-600' : 'bg-green-600'}`}>
                          {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        </div>
                        <div className={`p-3 rounded-lg ${message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-muted'}`}>
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
                          
                          {message.suggestions && (
                            <div className="mt-3 space-y-1">
                              <p className="text-xs opacity-70">Try asking:</p>
                              {message.suggestions.map((suggestion, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  className="mr-2 mb-1 text-xs h-7"
                                  onClick={() => handleSuggestionClick(suggestion)}
                                >
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex items-start space-x-2">
                        <div className="p-2 rounded-full bg-green-600">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="p-3 rounded-lg bg-muted">
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              <div className="flex items-center space-x-2 pt-4 border-t border-border">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask about production data, equipment status, trends..."
                  className="flex-1 bg-input border-border"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Insights Summary */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-400" />
            <span>AI Insights Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <h4 className="font-medium text-blue-400 mb-2">Production Optimization</h4>
              <p className="text-sm text-muted-foreground">
                Potential 7.1% throughput increase identified through parameter adjustments
              </p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <h4 className="font-medium text-yellow-400 mb-2">Maintenance Predictions</h4>
              <p className="text-sm text-muted-foreground">
                3 equipment failures predicted within 48 hours with 85%+ confidence
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
              <h4 className="font-medium text-green-400 mb-2">Cost Savings</h4>
              <p className="text-sm text-muted-foreground">
                Estimated $2.3M annual savings through recommended optimizations
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}