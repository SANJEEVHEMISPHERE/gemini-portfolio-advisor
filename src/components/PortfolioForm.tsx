import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface PortfolioFormProps {
  onSubmit: (preferences: {
    riskTolerance: string;
    investmentAmount: number;
    sectors: string[];
    timeHorizon: string;
  }) => void;
  loading: boolean;
}

const SECTORS = [
  "Technology",
  "Healthcare",
  "Finance",
  "Energy",
  "Consumer Goods",
  "Real Estate",
  "Utilities",
  "Materials",
];

export const PortfolioForm = ({ onSubmit, loading }: PortfolioFormProps) => {
  const [riskTolerance, setRiskTolerance] = useState("moderate");
  const [investmentAmount, setInvestmentAmount] = useState("10000");
  const [timeHorizon, setTimeHorizon] = useState("5-10 years");
  const [selectedSectors, setSelectedSectors] = useState<string[]>(["Technology", "Healthcare"]);

  const handleSectorToggle = (sector: string) => {
    setSelectedSectors(prev =>
      prev.includes(sector)
        ? prev.filter(s => s !== sector)
        : [...prev, sector]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      riskTolerance,
      investmentAmount: parseFloat(investmentAmount),
      sectors: selectedSectors,
      timeHorizon,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Investment Preferences</CardTitle>
        <CardDescription>Tell us about your investment goals and we'll create a personalized portfolio</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="risk">Risk Tolerance</Label>
            <Select value={riskTolerance} onValueChange={setRiskTolerance}>
              <SelectTrigger id="risk">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conservative">Conservative - Minimize risk</SelectItem>
                <SelectItem value="moderate">Moderate - Balanced approach</SelectItem>
                <SelectItem value="aggressive">Aggressive - Maximum growth</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Investment Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(e.target.value)}
              placeholder="10000"
              min="1000"
              step="1000"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="horizon">Time Horizon</Label>
            <Select value={timeHorizon} onValueChange={setTimeHorizon}>
              <SelectTrigger id="horizon">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-3 years">1-3 years - Short term</SelectItem>
                <SelectItem value="5-10 years">5-10 years - Medium term</SelectItem>
                <SelectItem value="10+ years">10+ years - Long term</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Preferred Sectors (select at least 2)</Label>
            <div className="grid grid-cols-2 gap-3">
              {SECTORS.map((sector) => (
                <div key={sector} className="flex items-center space-x-2">
                  <Checkbox
                    id={sector}
                    checked={selectedSectors.includes(sector)}
                    onCheckedChange={() => handleSectorToggle(sector)}
                  />
                  <label
                    htmlFor={sector}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {sector}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || selectedSectors.length < 2}
          >
            {loading ? "Generating..." : "Generate Portfolio"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
