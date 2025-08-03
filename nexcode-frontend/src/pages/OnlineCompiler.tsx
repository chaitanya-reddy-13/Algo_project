import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Play, RotateCcw, Download, Upload, Settings, Clock, Zap, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { submissionsAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const LANGUAGES = [
  { value: 'python', label: 'Python', icon: 'Py', defaultCode: '# Welcome to the Online Compiler!\n# Write your code here\n\ndef main():\n    print("Hello, World!")\n    \n    # Uncomment the lines below to read input\n    # name = input("Enter your name: ")\n    # age = input("Enter your age: ")\n    # print(f"Hello, {name}! You are {age} years old.")\n\nif __name__ == "__main__":\n    main()' },
  { value: 'cpp', label: 'C++', icon: 'C++', defaultCode: '#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    \n    // Uncomment the lines below to read input\n    // string name;\n    // int age;\n    // cout << "Enter your name: ";\n    // getline(cin, name);\n    // cout << "Enter your age: ";\n    // cin >> age;\n    // cout << "Hello, " << name << "! You are " << age << " years old." << endl;\n    \n    return 0;\n}' },
  { value: 'java', label: 'Java', icon: 'Java', defaultCode: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n        \n        // Uncomment the lines below to read input\n        // Scanner scanner = new Scanner(System.in);\n        // System.out.print("Enter your name: ");\n        // String name = scanner.nextLine();\n        // System.out.print("Enter your age: ");\n        // int age = scanner.nextInt();\n        // System.out.println("Hello, " + name + "! You are " + age + " years old.");\n        // scanner.close();\n    }\n}' },
  { value: 'javascript', label: 'JavaScript', icon: 'JS', defaultCode: '// Welcome to the Online Compiler!\n// Write your code here\n\nconsole.log("Hello, World!");\n\n// Uncomment the lines below to read input\n// const readline = require(\'readline\');\n// const rl = readline.createInterface({\n//     input: process.stdin,\n//     output: process.stdout\n// });\n// \n// rl.question(\'Enter your name: \', (name) => {\n//     rl.question(\'Enter your age: \', (age) => {\n//         console.log(`Hello, ${name}! You are ${age} years old.`);\n//         rl.close();\n//     });\n// });' },
];

const SAMPLE_INPUTS = {
  python: 'John\n25',
  cpp: 'John\n25',
  java: 'John\n25',
  javascript: 'John\n25',
};

export function OnlineCompiler() {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(LANGUAGES[0].defaultCode);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [errorType, setErrorType] = useState('');
  const [fontSize, setFontSize] = useState(14);
  const [theme, setTheme] = useState('vs-dark');
  const [showSettings, setShowSettings] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [recentExecutions, setRecentExecutions] = useState<any[]>([]);
  const editorRef = useRef<any>(null);
  const { toast } = useToast();

  // Check if code requires input
  const checkIfCodeRequiresInput = (code: string, lang: string) => {
    const inputPatterns = {
      python: [
        /input\s*\(/,
        /sys\.stdin\.read/,
        /raw_input\s*\(/,
      ],
      cpp: [
        /cin\s*>>/,
        /getline\s*\(/,
        /scanf\s*\(/,
        /fgets\s*\(/,
      ],
      java: [
        /Scanner\s*\(/,
        /BufferedReader\s*\(/,
        /System\.in/,
        /readLine\s*\(/,
      ],
      javascript: [
        /readline\s*\(/,
        /process\.stdin/,
        /prompt\s*\(/,
      ],
    };

    const patterns = inputPatterns[lang as keyof typeof inputPatterns] || [];
    return patterns.some(pattern => pattern.test(code));
  };

  // Load saved code from localStorage
  useEffect(() => {
    const savedCode = localStorage.getItem(`compiler_code_${language}`);
    if (savedCode) {
      setCode(savedCode);
    } else {
      const lang = LANGUAGES.find(l => l.value === language);
      if (lang) {
        setCode(lang.defaultCode);
      }
    }
  }, [language]);

  // Save code to localStorage
  useEffect(() => {
    localStorage.setItem(`compiler_code_${language}`, code);
  }, [code, language]);

  // Check if input is required when code changes
  useEffect(() => {
    const requiresInput = checkIfCodeRequiresInput(code, language);
    setShowInput(requiresInput);
  }, [code, language]);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setError('');
    setOutput('');
    setExecutionTime(0);
    setMemoryUsage(0);
    
    // Load sample input for the new language
    setInput(SAMPLE_INPUTS[newLanguage as keyof typeof SAMPLE_INPUTS] || '');
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Please enter some code to run",
        variant: "destructive",
      });
      return;
    }

    // Check if code requires input but no input is provided
    const requiresInput = checkIfCodeRequiresInput(code, language);
    if (requiresInput && !input.trim()) {
      toast({
        title: "Input Required",
        description: "Your code requires input. Please provide input data or uncomment the input lines.",
        variant: "destructive",
      });
      setShowInput(true);
      return;
    }

    setIsRunning(true);
    setError('');
    setOutput('');
    setExecutionTime(0);
    setMemoryUsage(0);
    setErrorType('');

    try {
      const response = await submissionsAPI.onlineCompiler(code, language, input, 10);
      const result = response.data;

      if (result.success) {
        setOutput(result.output);
        setExecutionTime(result.execution_time);
        setMemoryUsage(result.memory_usage);
        
        // Add to recent executions
        const execution = {
          id: Date.now(),
          language,
          code: code.substring(0, 100) + (code.length > 100 ? '...' : ''),
          input: input.substring(0, 50) + (input.length > 50 ? '...' : ''),
          output: result.output.substring(0, 100) + (result.output.length > 100 ? '...' : ''),
          executionTime: result.execution_time,
          timestamp: new Date().toLocaleTimeString(),
          success: true,
        };
        
        setRecentExecutions(prev => [execution, ...prev.slice(0, 9)]);
        
        toast({
          title: "Success! 🎉",
          description: `Code executed successfully in ${result.execution_time}s`,
        });
      } else {
        setError(result.error_message);
        setErrorType(result.error_type);
        setExecutionTime(result.execution_time);
        
        // Add to recent executions
        const execution = {
          id: Date.now(),
          language,
          code: code.substring(0, 100) + (code.length > 100 ? '...' : ''),
          input: input.substring(0, 50) + (input.length > 50 ? '...' : ''),
          error: result.error_message,
          executionTime: result.execution_time,
          timestamp: new Date().toLocaleTimeString(),
          success: false,
        };
        
        setRecentExecutions(prev => [execution, ...prev.slice(0, 9)]);
        
        toast({
          title: "Execution Failed",
          description: result.error_message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Failed to execute code";
      setError(errorMessage);
      setErrorType('system_error');
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    const lang = LANGUAGES.find(l => l.value === language);
    if (lang) {
      setCode(lang.defaultCode);
    }
    setInput('');
    setOutput('');
    setError('');
    setExecutionTime(0);
    setMemoryUsage(0);
    setErrorType('');
  };

  const handleDownloadCode = () => {
    const lang = LANGUAGES.find(l => l.value === language);
    const extension = lang?.value === 'cpp' ? '.cpp' : lang?.value === 'java' ? '.java' : lang?.value === 'javascript' ? '.js' : '.py';
    const filename = `code${extension}`;
    
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUploadCode = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCode(content);
      };
      reader.readAsText(file);
    }
  };

  const getErrorIcon = () => {
    switch (errorType) {
      case 'compilation_error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'runtime_error':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'timeout_error':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getErrorColor = () => {
    switch (errorType) {
      case 'compilation_error':
        return 'border-red-500 bg-red-50';
      case 'runtime_error':
        return 'border-orange-500 bg-orange-50';
      case 'timeout_error':
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-red-500 bg-red-50';
    }
  };

  const requiresInput = checkIfCodeRequiresInput(code, language);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Online Compiler
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="gap-2"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>
      </div>

      {showSettings && (
        <Card className="bg-gradient-card border-code-border">
          <CardHeader>
            <CardTitle className="text-lg">Editor Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Font Size</label>
                <Select value={fontSize.toString()} onValueChange={(value) => setFontSize(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12px</SelectItem>
                    <SelectItem value="14">14px</SelectItem>
                    <SelectItem value="16">16px</SelectItem>
                    <SelectItem value="18">18px</SelectItem>
                    <SelectItem value="20">20px</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Theme</label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vs-dark">Dark</SelectItem>
                    <SelectItem value="vs-light">Light</SelectItem>
                    <SelectItem value="hc-black">High Contrast</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Editor */}
        <Card className="bg-gradient-card border-code-border">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Code Editor</CardTitle>
              <div className="flex items-center space-x-2">
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-40 bg-code-bg border-code-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        <span className="flex items-center gap-2">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold ${
                            lang.value === 'python' ? 'bg-blue-500 text-white' :
                            lang.value === 'cpp' ? 'bg-blue-600 text-white' :
                            lang.value === 'java' ? 'bg-orange-500 text-white' :
                            'bg-yellow-400 text-black'
                          }`}>
                            {lang.icon}
                          </span>
                          {lang.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadCode}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".py,.cpp,.java,.js,.txt"
                    onChange={handleUploadCode}
                    className="hidden"
                  />
                  <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="w-4 h-4" />
                    Upload
                  </Button>
                </label>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="rounded-b-lg overflow-hidden border border-code-border">
              <Editor
                height="500px"
                language={language}
                value={code}
                onChange={(value) => setCode(value || '')}
                theme={theme}
                onMount={(editor) => {
                  editorRef.current = editor;
                }}
                options={{
                  minimap: { enabled: false },
                  fontSize: fontSize,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 16 },
                  fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
                  wordWrap: 'on',
                  folding: true,
                  lineDecorationsWidth: 10,
                  lineNumbersMinChars: 3,
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Input/Output Panel */}
        <div className="space-y-6">
          {/* Input - Only show when needed */}
          {(showInput || requiresInput) && (
            <Card className="bg-gradient-card border-code-border">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Input</CardTitle>
                  {requiresInput && (
                    <Badge variant="outline" className="text-xs">
                      Required
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter your input here..."
                  className="min-h-[120px] font-mono text-sm bg-code-bg border-code-border"
                />
                {!requiresInput && (
                  <div className="mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowInput(false)}
                      className="text-xs text-muted-foreground"
                    >
                      Hide Input
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Show Input Toggle - Only when input is not required but user might want it */}
          {!requiresInput && !showInput && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInput(true)}
              className="w-full gap-2"
            >
              <Upload className="w-4 h-4" />
              Add Input (Optional)
            </Button>
          )}

          {/* Input Info Message */}
          {!requiresInput && !showInput && (
            <div className="text-center p-4 bg-muted/50 border border-border rounded-lg">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Tip:</strong> The input field will automatically appear when your code uses input functions like <code className="bg-muted px-1 rounded">input()</code>, <code className="bg-muted px-1 rounded">cin</code>, <code className="bg-muted px-1 rounded">Scanner</code>, etc.
              </p>
            </div>
          )}

          {/* Output */}
          <Card className="bg-gradient-card border-code-border">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Output</CardTitle>
                <div className="flex items-center space-x-4">
                  {executionTime > 0 && (
                    <Badge variant="outline" className="gap-1">
                      <Clock className="w-3 h-3" />
                      {executionTime}s
                    </Badge>
                  )}
                  {memoryUsage > 0 && (
                    <Badge variant="outline" className="gap-1">
                      <Zap className="w-3 h-3" />
                      {memoryUsage}MB
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {error ? (
                <Alert className={getErrorColor()}>
                  <div className="flex items-start gap-2">
                    {getErrorIcon()}
                    <AlertDescription className="font-mono text-sm">
                      <div className="font-semibold mb-1">
                        {errorType === 'compilation_error' && 'Compilation Error'}
                        {errorType === 'runtime_error' && 'Runtime Error'}
                        {errorType === 'timeout_error' && 'Timeout Error'}
                        {errorType === 'system_error' && 'System Error'}
                      </div>
                      {error}
                    </AlertDescription>
                  </div>
                </Alert>
              ) : (
                <div className="bg-code-bg border border-code-border rounded-lg p-4 min-h-[120px]">
                  <pre className="font-mono text-sm text-foreground whitespace-pre-wrap">
                    {output || 'Output will appear here...'}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Run Button */}
          <Button
            onClick={handleRunCode}
            disabled={isRunning}
            size="lg"
            className="w-full gap-2"
          >
            <Play className="w-4 h-4" />
            {isRunning ? 'Running...' : 'Run Code'}
          </Button>
        </div>
      </div>

      {/* Recent Executions */}
      {recentExecutions.length > 0 && (
        <Card className="bg-gradient-card border-code-border">
          <CardHeader>
            <CardTitle className="text-lg">Recent Executions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentExecutions.map((execution) => (
                <div
                  key={execution.id}
                  className="flex items-center justify-between p-3 bg-code-bg border border-code-border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">
                      <span className={`inline-flex items-center justify-center w-4 h-4 rounded text-xs font-bold mr-1 ${
                        execution.language === 'python' ? 'bg-blue-500 text-white' :
                        execution.language === 'cpp' ? 'bg-blue-600 text-white' :
                        execution.language === 'java' ? 'bg-orange-500 text-white' :
                        'bg-yellow-400 text-black'
                      }`}>
                        {LANGUAGES.find(l => l.value === execution.language)?.icon}
                      </span>
                      {execution.language}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {execution.timestamp}
                    </span>
                    {execution.success ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {execution.executionTime}s
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features Info */}
      <Card className="bg-gradient-card border-code-border">
        <CardHeader>
          <CardTitle className="text-lg">Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-code-bg border border-code-border rounded-lg">
              <Zap className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <h3 className="font-semibold">Fast Execution</h3>
              <p className="text-sm text-muted-foreground">Quick code compilation and execution</p>
            </div>
            <div className="text-center p-4 bg-code-bg border border-code-border rounded-lg">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <h3 className="font-semibold">Error Detection</h3>
              <p className="text-sm text-muted-foreground">Comprehensive error handling and reporting</p>
            </div>
            <div className="text-center p-4 bg-code-bg border border-code-border rounded-lg">
              <Clock className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <h3 className="font-semibold">Timeout Protection</h3>
              <p className="text-sm text-muted-foreground">Prevents infinite loops and excessive execution</p>
            </div>
            <div className="text-center p-4 bg-code-bg border border-code-border rounded-lg">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <h3 className="font-semibold">Multiple Languages</h3>
              <p className="text-sm text-muted-foreground">Support for Python, C++, Java, and JavaScript</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 