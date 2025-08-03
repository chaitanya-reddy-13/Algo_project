import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface TestResult {
  test_case_id: number;
  input: string;
  expected_output: string;
  actual_output: string;
  error: string;
  passed: boolean;
  execution_time: number;
}

interface TestResultsProps {
  results: TestResult[];
  summary: {
    passed: number;
    total: number;
    success_rate: number;
  };
  isVisible: boolean;
}

export function TestResults({ results, summary, isVisible }: TestResultsProps) {
  if (!isVisible) return null;

  return (
    <Card className="bg-gradient-card border-code-border mt-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Test Results</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={summary.passed === summary.total ? "default" : "secondary"}>
              {summary.passed}/{summary.total} passed
            </Badge>
            <Badge variant="outline">
              {summary.success_rate}% success rate
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {results.map((result, index) => (
          <div key={result.test_case_id} className="border rounded-lg p-4 bg-code-bg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {result.passed ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className="font-medium">Test Case {index + 1}</span>
                <Badge variant={result.passed ? "default" : "destructive"}>
                  {result.passed ? "PASSED" : "FAILED"}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {result.execution_time}ms
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium text-muted-foreground mb-1">Input:</div>
                <pre className="bg-background p-2 rounded text-xs overflow-x-auto">
                  {result.input}
                </pre>
              </div>
              
              <div>
                <div className="font-medium text-muted-foreground mb-1">Expected Output:</div>
                <pre className="bg-background p-2 rounded text-xs overflow-x-auto">
                  {result.expected_output}
                </pre>
              </div>
              
              <div>
                <div className="font-medium text-muted-foreground mb-1">Your Output:</div>
                <pre className={`p-2 rounded text-xs overflow-x-auto ${
                  result.passed ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'
                }`}>
                  {result.actual_output || '(no output)'}
                </pre>
              </div>
            </div>
            
            {result.error && (
              <div className="mt-2">
                <div className="font-medium text-muted-foreground mb-1">Error:</div>
                <pre className="bg-red-900/20 text-red-400 p-2 rounded text-xs overflow-x-auto">
                  {result.error}
                </pre>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
} 