import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loader from './Loader';
import { getUserStats, recordActivity } from '../utils/stats';
import { useClickSound } from '../utils/useClickSound';
import { generateZoneChallenge } from '../utils/openrouter';
import yaml from 'js-yaml';

// By declaring monaco, we can use the Monaco Editor API loaded from the CDN script
// without TypeScript complaining.
declare const monaco: any;

type AnalysisResult = {
  feedback: string;
};

// Markdown rendering functions
const renderMessageContent = (content: string) => {
  const parts: React.ReactNode[] = [];
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const textBefore = content.substring(lastIndex, match.index);
      parts.push(
        <span key={`text-${key++}`}>
          {renderTextWithHeadings(textBefore)}
        </span>
      );
    }

    const language = match[1] || 'code';
    const code = match[2];
    parts.push(
      <div key={`code-${key++}`} className="my-3 bg-gray-100 border-2 border-black p-3 rounded overflow-x-auto">
        <div className="text-xs font-bold text-gray-600 mb-1">{language}</div>
        <pre className="text-sm font-mono text-black">
          <code>{code}</code>
        </pre>
      </div>
    );

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    const textAfter = content.substring(lastIndex);
    parts.push(
      <span key={`text-${key++}`}>
        {renderTextWithHeadings(textAfter)}
      </span>
    );
  }

  return <div>{parts}</div>;
};

const renderTextWithHeadings = (text: string) => {
  const lines = text.split('\n');
  const parts: React.ReactNode[] = [];
  let key = 0;

  lines.forEach((line, idx) => {
    const h1Match = line.match(/^# (.+)$/);
    const h2Match = line.match(/^## (.+)$/);
    const h3Match = line.match(/^### (.+)$/);

    if (h1Match) {
      parts.push(
        <h1 key={`h1-${key++}`} className="text-2xl font-black mt-4 mb-2 text-black">
          {renderInlineFormatting(h1Match[1])}
        </h1>
      );
    } else if (h2Match) {
      parts.push(
        <h2 key={`h2-${key++}`} className="text-xl font-black mt-3 mb-2 text-black">
          {renderInlineFormatting(h2Match[1])}
        </h2>
      );
    } else if (h3Match) {
      parts.push(
        <h3 key={`h3-${key++}`} className="text-lg font-black mt-2 mb-1 text-black">
          {renderInlineFormatting(h3Match[1])}
        </h3>
      );
    } else {
      parts.push(
        <span key={`line-${key++}`} className="whitespace-pre-wrap">
          {renderInlineFormatting(line)}
          {idx < lines.length - 1 && '\n'}
        </span>
      );
    }
  });

  return parts;
};

const renderInlineFormatting = (text: string) => {
  const parts: (string | React.ReactElement)[] = [];
  let remaining = text;
  let key = 0;

  const patterns = [
    { regex: /`([^`]+)`/, type: 'code' },
    { regex: /\*\*(.+?)\*\*/, type: 'bold' },
    { regex: /\*(.+?)\*/, type: 'italic' },
  ];

  while (remaining.length > 0) {
    let earliestMatch: { index: number; length: number; content: string; type: string } | null = null;

    for (const pattern of patterns) {
      const match = remaining.match(pattern.regex);
      if (match && match.index !== undefined) {
        if (!earliestMatch || match.index < earliestMatch.index) {
          earliestMatch = {
            index: match.index,
            length: match[0].length,
            content: match[1],
            type: pattern.type,
          };
        }
      }
    }

    if (earliestMatch) {
      if (earliestMatch.index > 0) {
        parts.push(remaining.substring(0, earliestMatch.index));
      }

      if (earliestMatch.type === 'code') {
        parts.push(
          <code key={`inline-${key++}`} className="bg-gray-200 px-1 py-0.5 rounded text-sm font-mono border border-gray-300">
            {earliestMatch.content}
          </code>
        );
      } else if (earliestMatch.type === 'bold') {
        parts.push(<strong key={`bold-${key++}`}>{earliestMatch.content}</strong>);
      } else if (earliestMatch.type === 'italic') {
        parts.push(<em key={`italic-${key++}`}>{earliestMatch.content}</em>);
      }

      remaining = remaining.substring(earliestMatch.index + earliestMatch.length);
    } else {
      parts.push(remaining);
      break;
    }
  }

  return parts.length > 0 ? parts : text;
};

const defaultPrompt: { [key: string]: string } = {
  json: JSON.stringify({
    "greeting": "Welcome to the Xeltra Playground!",
    "instructions": "You've selected JSON mode. Write your JSON prompt here and then click 'Analyze Prompt' to get feedback on its structure and quality.",
    "example_prompt": {
      "task": "Generate a list of three creative names for a new tech startup.",
      "constraints": {
        "tone": "Modern and catchy",
        "related_to": ["AI", "data", "cloud"],
        "must_not_contain": ["corp", "tech", "solutions"]
      },
      "output_format": "A simple JSON array of strings."
    }
  }, null, 2),
  xml: `<!-- 
  Welcome to the Xeltra Playground!
  You've selected XML mode. Write your XML prompt here and then click 'Analyze Prompt' to get feedback on its structure and quality.
  Note: You can use multiple root-level tags without nesting them!
-->
<task>Generate a list of three creative names for a new tech startup.</task>
<constraints>
  <tone>Modern and catchy</tone>
  <related_to>
    <item>AI</item>
    <item>data</item>
    <item>cloud</item>
  </related_to>
  <must_not_contain>
    <item>corp</item>
    <item>tech</item>
    <item>solutions</item>
  </must_not_contain>
</constraints>
<output_format>A simple XML structure with a root names element and three name children.</output_format>`,
  yaml: `# Welcome to the Xeltra Playground!
# You've selected YAML mode. Write your YAML prompt here and then click 'Analyze Prompt' to get feedback on its structure and quality.
task: Generate a list of three creative names for a new tech startup.
constraints:
  tone: Modern and catchy
  related_to:
    - AI
    - data
    - cloud
  must_not_contain:
    - corp
    - tech
    - solutions
output_format: A simple YAML list.`
};

const promptingChallenges = {
    easy: [
      { prompt: 'Write a prompt to generate three rhyming words for "sun".', language: 'plaintext' },
      { prompt: 'Create a prompt that asks an AI to explain what a computer is to a grandparent.', language: 'plaintext' },
      { prompt: 'Draft a prompt to get a list of 5 creative names for a new coffee shop.', language: 'plaintext' },
    ],
    medium: [
      { prompt: 'Craft a prompt asking an AI to act as a personal stylist and suggest an outfit for a formal wedding, specifying a color to avoid.', language: 'plaintext' },
      { prompt: 'Generate a prompt to create a short, optimistic news report about the future of renewable energy, written in the style of a 1950s broadcaster.', language: 'plaintext' },
      { prompt: 'Write a prompt to summarize a complex topic like "blockchain" in a simple analogy.', language: 'plaintext' },
    ],
    hard: [
      { prompt: 'Construct a detailed prompt for an AI to generate a marketing email for a new productivity app. Specify the target audience (freelancers), a persuasive tone, and a clear call-to-action.', language: 'plaintext' },
      { prompt: 'Write a "Chain of Thought" prompt that guides an AI to solve a simple logic puzzle, asking it to explain its reasoning step-by-step.', language: 'plaintext' },
      { prompt: 'Design a prompt that instructs an AI to take on the persona of a skeptical historian and critique the feasibility of a fictional historical event.', language: 'plaintext' },
    ],
};

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const LoungeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 21h7a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z" /><path d="M17 9V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2" /></svg>
);
const ZoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m13 2-3 14h3l-3 6 10-14H10Z" /></svg>
);
const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
);
const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);
const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m6 9 6 6 6-6"/></svg>
);

const PlaygroundPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const playClick = useClickSound();
  const editorRef = useRef<HTMLDivElement | null>(null);
  const editorInstanceRef = useRef<any | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const loungeDropdownRef = useRef<HTMLDivElement>(null);
  const zoneDropdownRef = useRef<HTMLDivElement>(null);

  const [selectedMode, setSelectedMode] = useState<'lounge' | 'zone' | null>(null);
  const [language, setLanguage] = useState<'json' | 'xml' | 'yaml'>('json');
  const [zoneLanguage, setZoneLanguage] = useState<'plaintext' | 'json' | 'xml' | 'yaml'>('plaintext');

  const [isLoungeDropdownOpen, setIsLoungeDropdownOpen] = useState(false);
  const [isZoneDropdownOpen, setIsZoneDropdownOpen] = useState(false);

  const [currentChallenge, setCurrentChallenge] = useState<{ prompt: string; language: string; } | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isChallengeActive, setIsChallengeActive] = useState(false);
  const [isLoadingChallenge, setIsLoadingChallenge] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  
  const [promptsCompleted, setPromptsCompleted] = useState(() => getUserStats().promptsCompleted);

  // New state for analysis
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [copyButtonText, setCopyButtonText] = useState('Copy Code');

  // State for validation
  const [isValid, setIsValid] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateContent = useCallback((content: string) => {
    if (selectedMode !== 'lounge' || !content) {
      setIsValid(true);
      setValidationError(null);
      return;
    }
    
    try {
        switch (language) {
            case 'json':
                JSON.parse(content);
                break;
            case 'xml':
                // Wrap content in a root element to allow multiple top-level tags
                const wrappedXml = `<root>${content}</root>`;
                const parser = new DOMParser();
                const doc = parser.parseFromString(wrappedXml, 'application/xml');
                const errorNode = doc.querySelector('parsererror');
                if (errorNode) {
                    throw new Error(errorNode.textContent || 'Invalid XML structure');
                }
                break;
            case 'yaml':
                yaml.load(content);
                break;
        }
        setIsValid(true);
        setValidationError(null);
    } catch (error: any) {
        setIsValid(false);
        setValidationError(error.message);
    }
  }, [language, selectedMode]);

  useEffect(() => {
    if (selectedMode && typeof (window as any).require === 'function') {
      (window as any).require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.49.0/min/vs' }});
      (window as any).require(['vs/editor/editor.main'], () => {
        if (editorRef.current && !editorInstanceRef.current) {
          const initialPrompt = selectedMode === 'lounge' ? defaultPrompt[language] : '// Click "Get Challenge" to start...';
          editorInstanceRef.current = monaco.editor.create(editorRef.current, {
            value: initialPrompt,
            language: selectedMode === 'lounge' ? language : zoneLanguage,
            theme: 'vs',
            automaticLayout: true,
          });

          // Add content change listener for validation
          editorInstanceRef.current.onDidChangeModelContent(() => {
            validateContent(editorInstanceRef.current.getValue());
          });
          // Initial validation
          validateContent(initialPrompt);
        }
      });
    }

    return () => {
      if (editorInstanceRef.current) {
        editorInstanceRef.current.dispose();
        editorInstanceRef.current = null;
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [selectedMode, validateContent]);

  useEffect(() => {
    const editor = editorInstanceRef.current;
    if (!editor || !selectedMode) return;
    
    // Clear previous validation errors on mode/language change
    setIsValid(true);
    setValidationError(null);

    if (selectedMode === 'lounge') {
      monaco.editor.setModelLanguage(editor.getModel(), language);
      const newContent = defaultPrompt[language];
      editor.setValue(newContent);
      validateContent(newContent); // Re-validate new content
      editor.updateOptions({ readOnly: false });
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setCurrentChallenge(null);
      setTimeLeft(null);
      setIsChallengeActive(false);
    } else { // zone mode
      monaco.editor.setModelLanguage(editor.getModel(), zoneLanguage);
      editor.setValue('// Click "Get Challenge" to start...');
      editor.updateOptions({ readOnly: true });
    }
  }, [selectedMode, language, zoneLanguage, validateContent]);
  
  useEffect(() => {
    if (isChallengeActive && timeLeft !== null && timeLeft > 0) {
      timerIntervalRef.current = window.setInterval(() => {
        setTimeLeft(prevTime => (prevTime !== null ? prevTime - 1 : 0));
      }, 1000);
    } else if (timeLeft === 0 && isChallengeActive) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setIsChallengeActive(false);
      const editor = editorInstanceRef.current;
      if (editor) {
        editor.updateOptions({ readOnly: true });
        if (editor.getValue().trim() !== '') {
            const newStats = recordActivity(true);
            setPromptsCompleted(newStats.promptsCompleted);
        }
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isChallengeActive, timeLeft]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (loungeDropdownRef.current && !loungeDropdownRef.current.contains(event.target as Node)) {
            setIsLoungeDropdownOpen(false);
        }
        if (zoneDropdownRef.current && !zoneDropdownRef.current.contains(event.target as Node)) {
            setIsZoneDropdownOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const handleGetChallenge = async () => {
    if (isChallengeActive || isLoadingChallenge) return;

    playClick();
    setIsLoadingChallenge(true);
    
    try {
      // Use OpenRouter API to generate a challenge
      const challengePrompt = await generateZoneChallenge(difficulty, zoneLanguage);
      
      setCurrentChallenge({
        prompt: challengePrompt,
        language: zoneLanguage
      });
      setTimeLeft(60);
      setIsChallengeActive(true);

      const editor = editorInstanceRef.current;
      if (editor) {
          monaco.editor.setModelLanguage(editor.getModel(), zoneLanguage);
          editor.setValue('');
          editor.updateOptions({ readOnly: false });
          editor.focus();
      }
    } catch (error) {
      console.error('Error generating challenge:', error);
      // Fallback to predefined challenges if API fails
      const challengesForLevel = promptingChallenges[difficulty];
      const randomChallenge = challengesForLevel[Math.floor(Math.random() * challengesForLevel.length)];
      
      setCurrentChallenge(randomChallenge);
      setTimeLeft(60);
      setIsChallengeActive(true);

      const editor = editorInstanceRef.current;
      if (editor) {
          monaco.editor.setModelLanguage(editor.getModel(), zoneLanguage);
          editor.setValue('');
          editor.updateOptions({ readOnly: false });
          editor.focus();
      }
    } finally {
      setIsLoadingChallenge(false);
    }
  };

  const handleExport = () => {
    if (!editorInstanceRef.current) return;
    playClick();
    const content = editorInstanceRef.current.getValue();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt.${language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (!editorInstanceRef.current) return;
    playClick();
    const content = editorInstanceRef.current.getValue();
    navigator.clipboard.writeText(content).then(() => {
        setCopyButtonText('Copied!');
        setTimeout(() => setCopyButtonText('Copy Prompt'), 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy code to clipboard.');
    });
  };
  
  const handleAnalyze = async () => {
    if (!editorInstanceRef.current || isAnalyzing || !isValid) return;
    playClick();
    const promptContent = editorInstanceRef.current.getValue();
    if (!promptContent.trim()) {
        alert("Editor is empty. Please write a prompt to analyze.");
        return;
    }

    setAnalysisResult(null);
    setIsAnalyzing(true);

    const promptForAnalysis = `You are an expert prompt engineer and AI interaction specialist. Analyze the following prompt written in ${language.toUpperCase()} format and provide detailed, actionable feedback about its quality and effectiveness.

Evaluate the prompt across these dimensions:

**1. Prompt Quality & Effectiveness**
- Is the instruction clear and unambiguous?
- Does it provide sufficient context for an AI to understand the task?
- Are the expectations and desired outputs well-defined?
- Does it use effective prompt engineering techniques (examples, constraints, format specifications)?

**2. Structure & Format (${language.toUpperCase()})**
- Is the ${language.toUpperCase()} structure well-formed and properly formatted?
- Does it follow ${language.toUpperCase()} conventions and best practices?
- Is the organization logical and easy to parse?

**3. Clarity & Specificity**
- Are instructions specific enough to get consistent results?
- Is the language clear and professional?
- Are there any ambiguous terms or vague requirements?

**4. Completeness**
- Does it include all necessary information (role, task, format, constraints)?
- Are edge cases or special requirements addressed?
- Would an AI have enough context to produce quality output?

**5. Optimization Opportunities**
- What could make this prompt more effective?
- Are there prompt engineering techniques that could improve results?
- Could the structure or wording be optimized?

Here is the prompt to analyze:
\`\`\`${language}
${promptContent}
\`\`\`

Provide comprehensive feedback with markdown formatting. Include:
- **Overall Assessment**: Summary of prompt quality and effectiveness
- **Strengths**: What works well in this prompt
- **Areas for Improvement**: Specific issues and weaknesses
- **Recommendations**: Concrete suggestions with examples
- **Improved Version** (if applicable): Show how the prompt could be enhanced

Be constructive, detailed, and focus on making this prompt more effective for AI interactions. Use markdown formatting (headings, bold, code blocks, lists) to organize your feedback clearly.`;

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Xeltra Prompt Analyzer'
            },
            body: JSON.stringify({
                model: 'mistralai/mistral-small-3.2-24b-instruct:free',
                messages: [
                    {
                        role: 'user',
                        content: promptForAnalysis
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('OpenRouter API error:', errorData);
            throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const resultText = data.choices?.[0]?.message?.content?.trim();
        
        if (!resultText) {
            throw new Error('No response content from API');
        }

        setAnalysisResult({ feedback: resultText });

    } catch (error) {
        console.error("Error analyzing prompt:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        alert(`Analysis failed: ${errorMessage}\n\nPlease try again or check your API key.`);
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleBack = () => {
    setSelectedMode(null);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setCurrentChallenge(null);
    setTimeLeft(null);
    setIsChallengeActive(false);
  }

  const handleForkToDungeon = () => {
    if (!editorInstanceRef.current) return;
    playClick();
    const content = editorInstanceRef.current.getValue();
    navigate('/dungeon', { state: { forkedPrompt: content } });
  };

  const handleModeSelect = (mode: 'lounge' | 'zone') => {
    playClick();
    if (!user) {
      navigate('/auth', { state: { from: location }, replace: true });
    } else {
      setSelectedMode(mode);
    }
  };

  const baseButtonClasses = "px-4 py-2 border-2 border-black font-bold";
  const activeButtonClasses = "bg-black text-white";
  const inactiveButtonClasses = "bg-white text-black hover:bg-primary hover:text-white hover:shadow-brutal";
  
  const Card = ({ mode, title, description, icon, onSelect }: { mode: 'lounge' | 'zone', title: string, description: string, icon: React.ReactNode, onSelect: () => void }) => (
    <motion.div
      layoutId={mode}
      onClick={onSelect}
      className="w-full md:w-96 h-80 p-8 bg-white border-4 border-black shadow-brutal cursor-pointer flex flex-col justify-between"
      whileHover={{ scale: 1.03, boxShadow: '10px 10px 0px #000000' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div>
        <div className="text-primary mb-4">{icon}</div>
        <h2 className="text-3xl font-bold mb-2">{title}</h2>
        <p className="text-black/80">{description}</p>
      </div>
      <p className="font-bold text-right">Select Mode &rarr;</p>
    </motion.div>
  );

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <h1 className="text-4xl font-bold text-black mb-6 border-b-2 border-primary pb-2">Playground</h1>
      <div className="relative" style={{ minHeight: '600px' }}>
      <AnimatePresence>
        {!selectedMode ? (
            <motion.div
                key="selection"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex flex-col md:flex-row gap-8 justify-center items-center"
            >
                <Card mode="lounge" title="Lounge" description="A relaxed space to freely craft and test prompts without any time pressure." icon={<LoungeIcon />} onSelect={() => handleModeSelect('lounge')} />
                <Card mode="zone" title="Zone" description="Enter a high-stakes environment. Solve random, timed challenges to sharpen your skills." icon={<ZoneIcon />} onSelect={() => handleModeSelect('zone')} />
            </motion.div>
        ) : (
            <motion.div
              key="editor"
              layoutId={selectedMode}
              className="bg-white p-6 md:p-8 border-4 border-black shadow-brutal"
            >
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.4 }}>
                    <motion.button 
                        onClick={handleBack}
                        className={`${baseButtonClasses} ${inactiveButtonClasses} mb-6 flex items-center gap-2`}
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    >
                        <BackIcon /> Back to Modes
                    </motion.button>

                    {selectedMode === 'lounge' ? (
                        <motion.div key="lounge">
                            <p className="text-black/80 text-lg leading-relaxed mb-6">
                                Select a language to begin. Write your prompt, analyze its quality, and use the export button to save your work.
                            </p>
                            <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                                <div className="flex items-center space-x-2">
                                    {/* Desktop Buttons */}
                                    <div className="hidden md:flex items-center space-x-2">
                                        {(['json', 'yaml', 'xml'] as const).map((lang) => (
                                            <motion.button
                                                key={lang}
                                                onClick={() => { playClick(); setLanguage(lang); }}
                                                className={`${baseButtonClasses} ${language === lang ? activeButtonClasses : inactiveButtonClasses}`}
                                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                            >
                                                {lang.toUpperCase()}
                                            </motion.button>
                                        ))}
                                    </div>
                                    {/* Mobile Dropdown */}
                                    <div className="relative md:hidden" ref={loungeDropdownRef}>
                                        <motion.button
                                            onClick={() => { playClick(); setIsLoungeDropdownOpen(!isLoungeDropdownOpen); }}
                                            className={`${baseButtonClasses} ${inactiveButtonClasses} w-32 flex justify-between items-center`}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <span>{language.toUpperCase()}</span>
                                            <ChevronDownIcon />
                                        </motion.button>
                                        <AnimatePresence>
                                            {isLoungeDropdownOpen && (
                                                <motion.ul
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="absolute top-full mt-2 w-32 bg-white border-2 border-black shadow-brutal z-10"
                                                >
                                                    {(['json', 'yaml', 'xml'] as const).map((lang) => (
                                                        <li
                                                            key={lang}
                                                            onClick={() => {
                                                                playClick();
                                                                setLanguage(lang);
                                                                setIsLoungeDropdownOpen(false);
                                                            }}
                                                            className={`px-4 py-2 cursor-pointer font-bold hover:bg-primary hover:text-white ${language === lang ? 'bg-black text-white' : 'bg-white text-black'}`}
                                                        >
                                                            {lang.toUpperCase()}
                                                        </li>
                                                    ))}
                                                </motion.ul>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 flex-wrap gap-2">
                                    <motion.button
                                        onClick={handleAnalyze}
                                        disabled={isAnalyzing || !isValid}
                                        className={`${baseButtonClasses} ${inactiveButtonClasses} disabled:bg-gray-400 disabled:text-gray-600 disabled:shadow-none disabled:cursor-not-allowed`}
                                        whileHover={{ scale: (isAnalyzing || !isValid) ? 1 : 1.05 }} whileTap={{ scale: (isAnalyzing || !isValid) ? 1 : 0.95 }}
                                    >
                                        {isAnalyzing ? 'Analyzing...' : 'Analyze Prompt'}
                                    </motion.button>
                                    <motion.button
                                        onClick={handleForkToDungeon}
                                        className={`${baseButtonClasses} bg-purple-900 text-white hover:bg-purple-600 border-black`}
                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        title="Test this prompt in Dungeon AI Chat"
                                    >
                                        Throw to Dungeon 
                                    </motion.button>
                                    <motion.button
                                        onClick={handleCopy}
                                        className={`${baseButtonClasses} ${inactiveButtonClasses}`}
                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    >
                                        {copyButtonText}
                                    </motion.button>
                                    <motion.button
                                        onClick={handleExport}
                                        className={`${baseButtonClasses} ${inactiveButtonClasses}`}
                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    >
                                        Export Prompt
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="zone">
                            <div className="flex flex-col gap-4 mb-4">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <label className="font-bold text-lg">Difficulty:</label>
                                        <div className="flex items-center space-x-2">
                                            {(['easy', 'medium', 'hard'] as const).map((level) => (
                                                <motion.button
                                                    key={level}
                                                    onClick={() => { playClick(); setDifficulty(level); }}
                                                    className={`${baseButtonClasses} ${difficulty === level ? activeButtonClasses : inactiveButtonClasses} disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed`}
                                                    disabled={isChallengeActive}
                                                    whileHover={{ scale: !isChallengeActive ? 1.05 : 1 }} 
                                                    whileTap={{ scale: !isChallengeActive ? 0.95 : 1 }}
                                                >
                                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white p-2 border-2 border-black">
                                        <span className="font-bold text-lg">Prompted:</span>
                                        <span className="text-2xl font-bold text-primary">{promptsCompleted}</span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <label className="font-bold text-lg">Language:</label>
                                    {/* Desktop Buttons */}
                                    <div className="hidden md:flex items-center space-x-2">
                                        {(['plaintext', 'json', 'yaml', 'xml'] as const).map((lang) => (
                                            <motion.button
                                                key={lang}
                                                onClick={() => { playClick(); setZoneLanguage(lang); }}
                                                className={`${baseButtonClasses} ${zoneLanguage === lang ? activeButtonClasses : inactiveButtonClasses} disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed`}
                                                disabled={isChallengeActive}
                                                whileHover={{ scale: !isChallengeActive ? 1.05 : 1 }} 
                                                whileTap={{ scale: !isChallengeActive ? 0.95 : 1 }}
                                            >
                                                {lang.toUpperCase()}
                                            </motion.button>
                                        ))}
                                    </div>
                                    {/* Mobile Dropdown */}
                                    <div className="relative md:hidden" ref={zoneDropdownRef}>
                                        <motion.button
                                            onClick={() => { playClick(); setIsZoneDropdownOpen(!isZoneDropdownOpen); }}
                                            disabled={isChallengeActive}
                                            className={`${baseButtonClasses} ${inactiveButtonClasses} w-32 flex justify-between items-center disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed`}
                                            whileTap={{ scale: !isChallengeActive ? 0.95 : 1 }}
                                        >
                                            <span>{zoneLanguage.toUpperCase()}</span>
                                            <ChevronDownIcon />
                                        </motion.button>
                                        <AnimatePresence>
                                            {isZoneDropdownOpen && (
                                                <motion.ul
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="absolute top-full mt-2 w-32 bg-white border-2 border-black shadow-brutal z-10"
                                                >
                                                    {(['plaintext', 'json', 'yaml', 'xml'] as const).map((lang) => (
                                                        <li
                                                            key={lang}
                                                            onClick={() => {
                                                                playClick();
                                                                setZoneLanguage(lang);
                                                                setIsZoneDropdownOpen(false);
                                                            }}
                                                            className={`px-4 py-2 cursor-pointer font-bold hover:bg-primary hover:text-white ${zoneLanguage === lang ? 'bg-black text-white' : 'bg-white text-black'}`}
                                                        >
                                                            {lang.toUpperCase()}
                                                        </li>
                                                    ))}
                                                </motion.ul>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
                                {/* Challenge prompt */}
                                <div className="flex-grow bg-gray-100 p-4 border-2 border-black w-full">
                                    <h3 className="font-bold text-lg mb-1">Challenge:</h3>
                                    <p className="text-black/90 text-sm min-h-[40px] flex items-center">
                                        {currentChallenge ? currentChallenge.prompt : 'Select a difficulty and click "Get Challenge" to start.'}
                                    </p>
                                </div>

                                {/* Timer and button */}
                                <div className="flex items-stretch gap-4 w-full md:w-auto">
                                    {timeLeft !== null && (
                                        <div className={`text-center p-2 border-2 border-black flex-grow md:flex-grow-0 flex flex-col justify-center items-center ${timeLeft === 0 ? 'bg-red-200' : 'bg-white'}`}>
                                            <div className={`text-3xl font-bold ${timeLeft <= 10 && timeLeft > 0 ? 'text-red-500 animate-pulse' : 'text-black'}`}>
                                                {timeLeft > 0 ? `${timeLeft}s` : "End"}
                                            </div>
                                            <div className="text-xs font-bold uppercase tracking-wider">Time Left</div>
                                        </div>
                                    )}
                                    <motion.button
                                        onClick={handleGetChallenge}
                                        disabled={isChallengeActive || isLoadingChallenge}
                                        className={`${baseButtonClasses} ${inactiveButtonClasses} flex-grow md:flex-grow-0 disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed`}
                                        whileHover={{ scale: (isChallengeActive || isLoadingChallenge) ? 1 : 1.05 }} whileTap={{ scale: (isChallengeActive || isLoadingChallenge) ? 1 : 0.95 }}
                                    >
                                        {isLoadingChallenge ? 'Loading...' : isChallengeActive ? 'In Progress...' : 'Get Challenge'}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    <div ref={editorRef} className={`h-96 w-full mt-4 transition-all ${!isValid ? 'border-4 border-red-500' : 'border-2 border-black'}`} aria-label="Prompt editor"></div>
                    
                    {/* Fork to Dungeon Button (for Zone mode) */}
                    {selectedMode === 'zone' && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4"
                        >
                            <motion.button
                                onClick={handleForkToDungeon}
                                className={`${baseButtonClasses} bg-purple-900 text-white hover:bg-purple-600 border-black w-full md:w-auto`}
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                title="Test this prompt in Dungeon AI Chat"
                            >
                                Throw to Dungeon
                            </motion.button>
                        </motion.div>
                    )}
                    
                    <AnimatePresence>
                    {!isValid && validationError && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-2 text-red-600 font-bold bg-red-100 border-2 border-red-500 p-3"
                        >
                          {validationError}
                        </motion.div>
                    )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
      </div>
      <AnimatePresence>
        {isAnalyzing ? (
            <motion.div
                key="loader-backdrop"
                className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                aria-modal="true"
                role="dialog"
            >
                <motion.div
                    key="loader-modal"
                    initial={{ y: 20, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 20, opacity: 0, scale: 0.95 }}
                    className="bg-white p-8 border-4 border-black shadow-brutal"
                >
                    <Loader text="Analyzing Prompt..." />
                </motion.div>
            </motion.div>
        ) : analysisResult ? (
          <motion.div
            key="result-backdrop"
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAnalysisResult(null)}
            aria-modal="true"
            role="dialog"
          >
            <motion.div
              key="result-modal"
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl bg-white p-8 border-4 border-black shadow-brutal flex flex-col text-left max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-black">AI FEEDBACK</h2>
                <motion.button
                  onClick={() => setAnalysisResult(null)}
                  className="bg-white p-2 border-2 border-black rounded-full hover:bg-red-400 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Close analysis report"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
              
              <div className="prose prose-sm max-w-none text-black">
                {renderMessageContent(analysisResult.feedback)}
              </div>

              <motion.button
                onClick={() => setAnalysisResult(null)}
                className="mt-6 w-full px-6 py-3 bg-purple-500 text-white font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                CLOSE
              </motion.button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
};

export default PlaygroundPage;
