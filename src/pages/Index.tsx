import { useState } from "react";
import { PortfolioForm } from "@/components/PortfolioForm";
import { PortfolioResults } from "@/components/PortfolioResults";
import { useToast } from "@/hooks/use-toast";

export interface PortfolioRecommendation {
  symbol: string;
  name: string;
  allocation: number;
  rationale: string;
  expectedReturn: string;
  risk: string;
}

const Index = () => {
  const [portfolio, setPortfolio] = useState<PortfolioRecommendation[] | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGeneratePortfolio = async (preferences: {
    riskTolerance: string;
    investmentAmount: number;
    sectors: string[];
    timeHorizon: string;
  }) => {
    setLoading(true);
    
    try {
      // Update this URL to your backend server URL
      const response = await fetch('http://localhost:3000/api/generate-portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...preferences,
          userId: 'demo-user',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPortfolio(data.portfolio.recommendations);
        toast({
          title: "Portfolio Generated",
          description: "Your personalized portfolio recommendations are ready!",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error generating portfolio:', error);
      toast({
        title: "Error",
        description: "Failed to generate portfolio. Make sure the backend server is running.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            AI Stock Portfolio Recommender
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get personalized stock portfolio recommendations powered by AI with clear explanations for every pick
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <PortfolioForm 
              onSubmit={handleGeneratePortfolio} 
              loading={loading}
            />
          </div>

          <div>
            {loading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Analyzing your preferences and generating recommendations...</p>
                </div>
              </div>
            )}
            
            {!loading && portfolio && (
              <PortfolioResults recommendations={portfolio} />
            )}

            {!loading && !portfolio && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <p className="text-lg mb-2">👈 Fill in your preferences</p>
                  <p>Your AI-powered portfolio will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
