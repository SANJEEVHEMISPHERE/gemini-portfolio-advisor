import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PortfolioRecommendation } from "@/pages/Index";

interface PortfolioResultsProps {
  recommendations: PortfolioRecommendation[];
}

const getRiskColor = (risk: string) => {
  const riskLower = risk.toLowerCase();
  if (riskLower.includes("low")) return "bg-green-500/10 text-green-700 dark:text-green-400";
  if (riskLower.includes("medium")) return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
  if (riskLower.includes("high")) return "bg-red-500/10 text-red-700 dark:text-red-400";
  return "bg-muted text-muted-foreground";
};

export const PortfolioResults = ({ recommendations }: PortfolioResultsProps) => {
  const totalAllocation = recommendations.reduce((sum, rec) => sum + rec.allocation, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Personalized Portfolio</CardTitle>
          <CardDescription>
            AI-generated recommendations with clear explanations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="font-semibold">Total Allocation</span>
              <span className="text-2xl font-bold">{totalAllocation}%</span>
            </div>

            {recommendations.map((rec, index) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{rec.symbol}</CardTitle>
                      <CardDescription>{rec.name}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{rec.allocation}%</div>
                      <Badge className={getRiskColor(rec.risk)}>{rec.risk}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Allocation</span>
                      <span>{rec.allocation}%</span>
                    </div>
                    <Progress value={rec.allocation} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Why This Stock?</h4>
                      <p className="text-sm text-muted-foreground">{rec.rationale}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-2 bg-muted/50 rounded">
                        <p className="text-xs text-muted-foreground mb-1">Expected Return</p>
                        <p className="text-sm font-semibold">{rec.expectedReturn}</p>
                      </div>
                      <div className="p-2 bg-muted/50 rounded">
                        <p className="text-xs text-muted-foreground mb-1">Risk Level</p>
                        <p className="text-sm font-semibold">{rec.risk}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Disclaimer:</strong> These recommendations are AI-generated for educational purposes. 
            Always consult with a qualified financial advisor before making investment decisions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
