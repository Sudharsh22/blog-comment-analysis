"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { blogs } from "@/lib/data";
import Image from "next/image";
import { 
  Send, 
  Sparkles, 
  AlertTriangle, 
  BarChart3, 
  Terminal, 
  Filter,
  ThumbsUp,
  ThumbsDown,
  Meh,
  ChevronDown,
  Check
} from "lucide-react";

// Mock Data for Moderator View
const MOCK_COMMENTS = [
    { id: 1, user: "Alice Dev", text: "This article completely changed my perspective on UI design! The section on micro-interactions was spot on.", sentiment: "positive", confidence: 0.98, time: "2m ago" },
    { id: 2, user: "TrollBot_99", text: "This is garbage. You don't know what you're talking about. Unsubbed.", sentiment: "negative", confidence: 0.95, time: "15m ago" },
    { id: 3, user: "John Doe", text: "Interesting points, but I think the conclusion was a bit rushed. meaningful though.", sentiment: "neutral", confidence: 0.65, time: "1h ago" },
    { id: 4, user: "Sarah Smith", text: "I've been using these techniques for years. Nothing new here, but a good refresher.", sentiment: "neutral", confidence: 0.82, time: "3h ago" },
    { id: 5, user: "Mike Ross", text: "Absolutely loved the examples! Can you share the source code?", sentiment: "positive", confidence: 0.99, time: "5h ago" },
];

function ReviewContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const blogId = searchParams.get("id");
    
    // Determine active blog from URL or default to first
    const initialBlog = blogs.find(b => b.id === blogId) || blogs[0];
    const [activeBlog, setActiveBlog] = useState(initialBlog);
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);

    // Sync state if URL changes (e.g. back button)
    useEffect(() => {
        if (blogId) {
            const found = blogs.find(b => b.id === blogId);
            if (found) setActiveBlog(found);
        }
    }, [blogId]);

    const handleBlogSelect = (blog: typeof blogs[0]) => {
        setActiveBlog(blog);
        setIsSelectorOpen(false);
        // Update URL without refreshing
        router.push(`/review-blog?id=${blog.id}`, { scroll: false });
    };

    // State for "Write Review" tab
    const [comment, setComment] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const [aiResult, setAiResult] = useState<{ sentiment: string; confidence: number } | null>(null);

    // State for "Moderator" tab
    const [activeTab, setActiveTab] = useState<"write" | "moderate">("write");
    const [filter, setFilter] = useState<"all" | "positive" | "neutral" | "negative">("all");
    const [expandedComment, setExpandedComment] = useState<number | null>(null);

    // Simulated AI Processing
    useEffect(() => {
        if (!comment) {
            setAiResult(null);
            return;
        }

        setIsThinking(true);
        const timer = setTimeout(() => {
            setIsThinking(false);
            // Simple keyword-based mock simulation
            const lowerText = comment.toLowerCase();
            let sentiment = "neutral";
            let confidence = 0.75;

            if (["great", "good", "love", "amazing", "useful", "excellent"].some(w => lowerText.includes(w))) {
                sentiment = "positive";
                confidence = 0.92;
            } else if (["bad", "terrible", "hate", "awful", "stupid", "worst"].some(w => lowerText.includes(w))) {
                sentiment = "negative";
                confidence = 0.88;
            }

            setAiResult({ sentiment, confidence });
        }, 600); // 600ms debounce simulation

        return () => clearTimeout(timer);
    }, [comment]);

    // Derived State for Styling
    const getSentimentColor = (s: string) => {
        if (s === "positive") return "text-green-500 bg-green-500/10 border-green-500/20";
        if (s === "negative") return "text-red-500 bg-red-500/10 border-red-500/20";
        return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    };

    const getSentimentIcon = (s: string) => {
        if (s === "positive") return <ThumbsUp className="w-4 h-4" />;
        if (s === "negative") return <ThumbsDown className="w-4 h-4" />;
        return <Meh className="w-4 h-4" />;
    };

    const filteredComments = MOCK_COMMENTS.filter(c => filter === "all" || c.sentiment === filter);

    return (
        <div className="min-h-screen pt-24 pb-12 px-6 flex items-center justify-center bg-background relative overflow-hidden">
            {/* Ambient Background - Reacts to accumulated sentiment of filters */}
            <div className={`fixed inset-0 pointer-events-none transition-colors duration-1000 opacity-20 ${
                activeTab === 'moderate' && filter === 'negative' ? 'bg-red-900/10' : 
                activeTab === 'moderate' && filter === 'positive' ? 'bg-green-900/10' : 'bg-primary/5'
            }`} />

            <div className="container max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10 w-full h-[85vh]">
                
                {/* Left Panel: Blog Preview */}
                <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="hidden lg:flex flex-col h-full bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl overflow-hidden shadow-2xl relative group/card"
                >
                    <div className="h-64 relative w-full shrink-0 group">
                        <Image 
                            src={activeBlog.image} 
                            alt={activeBlog.title} 
                            fill 
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                        
                        {/* Blog Selector Trigger */}
                        <div className="absolute top-6 left-6 right-6 z-20">
                            <div className="relative">
                                <button 
                                    onClick={() => setIsSelectorOpen(!isSelectorOpen)}
                                    className="flex items-center justify-between w-full p-3 pl-4 rounded-xl bg-background/80 backdrop-blur-md border border-white/20 shadow-xl hover:bg-background/95 transition-all text-left group/btn"
                                >
                                    <div>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Analyzing</p>
                                        <p className="font-bold text-sm truncate pr-4">{activeBlog.title}</p>
                                    </div>
                                    <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isSelectorOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Menu */}
                                <AnimatePresence>
                                    {isSelectorOpen && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute top-full left-0 right-0 mt-2 p-2 bg-popover/90 backdrop-blur-xl border border-border rounded-xl shadow-2xl max-h-[300px] overflow-y-auto custom-scrollbar z-50"
                                        >
                                            {blogs.map(blog => (
                                                <button
                                                    key={blog.id}
                                                    onClick={() => handleBlogSelect(blog)}
                                                    className={`w-full text-left p-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-between mb-1 ${
                                                        activeBlog.id === blog.id 
                                                        ? 'bg-primary/20 text-primary' 
                                                        : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                                                    }`}
                                                >
                                                    <span className="truncate">{blog.title}</span>
                                                    {activeBlog.id === blog.id && <Check className="w-4 h-4 ml-2 shrink-0" />}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
                             <span className="px-3 py-1 rounded-full bg-primary/20 backdrop-blur border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-3 inline-block">
                                Current Context
                            </span>
                            <h2 className="text-3xl font-bold leading-tight shadow-black drop-shadow-lg">{activeBlog.title}</h2>
                        </div>
                    </div>
                    
                    <div className="p-8 flex-grow overflow-y-auto custom-scrollbar">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                            <span>{activeBlog.date}</span>
                            <span>•</span>
                            <span>{activeBlog.readTime}</span>
                        </div>
                        <div className="prose prose-invert max-w-none">
                            <p className="lead text-lg text-muted-foreground">{activeBlog.excerpt}</p>
                            <hr className="border-border/50 my-6" />
                            <div dangerouslySetInnerHTML={{ __html: activeBlog.content.slice(0, 500) + "..." }} />
                        </div>
                    </div>
                </motion.div>

                {/* Right Panel: Analysis Hub */}
                <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col h-full bg-card rounded-3xl border border-border shadow-2xl overflow-hidden"
                >
                    {/* Header Tabs */}
                    <div className="flex border-b border-border shrink-0">
                        <button 
                            onClick={() => setActiveTab("write")}
                            className={`flex-1 py-6 font-medium text-sm tracking-wide transition-colors relative ${activeTab === 'write' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Write & Analyze
                            {activeTab === 'write' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />}
                        </button>
                        <button 
                            onClick={() => setActiveTab("moderate")}
                            className={`flex-1 py-6 font-medium text-sm tracking-wide transition-colors relative ${activeTab === 'moderate' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Moderator View
                            {activeTab === 'moderate' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />}
                        </button>
                    </div>

                    <div className="flex-grow overflow-hidden relative">
                        <AnimatePresence mode="wait">
                            {activeTab === "write" ? (
                                <motion.div 
                                    key="write"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="absolute inset-0 p-8 flex flex-col"
                                >
                                    <div className="text-center mb-8">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                                            <Sparkles className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-2">AI Sentiment Pre-Check</h3>
                                        <p className="text-muted-foreground text-sm">
                                            See how our AI interprets your tone in real-time before you post.
                                        </p>
                                    </div>

                                    {/* Real-time Indicator Pillas */}
                                    <div className="flex justify-center mb-6 h-8">
                                        {isThinking ? (
                                            <motion.div 
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="flex items-center gap-2 px-4 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium border border-border"
                                            >
                                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                                Analyzing tone...
                                            </motion.div>
                                        ) : aiResult ? (
                                            <motion.div 
                                                initial={{ scale: 0.9 }}
                                                animate={{ scale: 1 }}
                                                className={`flex items-center gap-2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getSentimentColor(aiResult.sentiment)}`}
                                            >
                                                {getSentimentIcon(aiResult.sentiment)}
                                                {aiResult.sentiment} ({Math.round(aiResult.confidence * 100)}%)
                                            </motion.div>
                                        ) : (
                                            <div className="opacity-0">Placeholder</div>
                                        )}
                                    </div>

                                    <div className="relative flex-grow">
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder={`Share your thoughts on "${activeBlog.title}"...`}
                                            className="w-full h-full p-6 text-lg bg-muted/30 rounded-2xl border-2 border-transparent focus:border-primary/50 focus:bg-background outline-none resize-none transition-all placeholder:text-muted-foreground/50"
                                        />
                                        <div className="absolute bottom-6 right-6">
                                            <button 
                                                disabled={!comment || (aiResult?.sentiment === 'negative')}
                                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${
                                                    aiResult?.sentiment === 'negative' 
                                                    ? 'bg-destructive/10 text-destructive cursor-not-allowed border border-destructive/20' 
                                                    : 'bg-primary text-primary-foreground hover:scale-105 active:scale-95'
                                                }`}
                                            >
                                                {aiResult?.sentiment === 'negative' ? (
                                                    <>
                                                        <AlertTriangle className="w-4 h-4" /> Too Negative
                                                    </>
                                                ) : (
                                                    <>
                                                        Post Comment <Send className="w-4 h-4" />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Debug Data Peek */}
                                    {aiResult && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-6 p-4 rounded-xl bg-black/20 border border-border font-mono text-xs text-muted-foreground"
                                        >
                                            <div className="flex items-center gap-2 mb-2 text-primary">
                                                <Terminal className="w-3 h-3" /> DEBUG_STREAM
                                            </div>
                                            <pre>{JSON.stringify({
                                                model:"Sentiment_v2.4",
                                                context: activeBlog.id,
                                                prediction: aiResult.sentiment,
                                                confidence_score: aiResult.confidence,
                                                tokens: comment.split(" ").length
                                            }, null, 2)}</pre>
                                        </motion.div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="moderate"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="absolute inset-0 flex flex-col"
                                >
                                    {/* Filters */}
                                    <div className="p-6 border-b border-border bg-muted/10 shrink-0">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-bold flex items-center gap-2">
                                                <BarChart3 className="w-5 h-5 text-primary" /> 
                                                Sentiment Dashboard
                                            </h3>
                                            <span className="text-xs font-mono bg-muted px-2 py-1 rounded text-muted-foreground">
                                                {MOCK_COMMENTS.length} Total Processed
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            {(["all", "positive", "neutral", "negative"] as const).map(f => (
                                                <button
                                                    key={f}
                                                    onClick={() => setFilter(f)}
                                                    className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all border ${
                                                        filter === f 
                                                        ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20' 
                                                        : 'bg-card hover:bg-muted border-border text-muted-foreground'
                                                    }`}
                                                >
                                                    {f}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* List */}
                                    <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                        {filteredComments.map(c => (
                                            <motion.div 
                                                key={c.id}
                                                layout
                                                onClick={() => setExpandedComment(expandedComment === c.id ? null : c.id)}
                                                className={`p-4 rounded-xl border cursor-pointer hover:shadow-md transition-all ${
                                                    expandedComment === c.id ? 'bg-muted/30 border-primary/50' : 'bg-card border-border'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-primary-foreground font-bold text-xs">
                                                            {c.user[0]}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-sm">{c.user}</div>
                                                            <div className="text-[10px] text-muted-foreground">{c.time}</div>
                                                        </div>
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getSentimentColor(c.sentiment)}`}>
                                                        {c.sentiment}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground leading-relaxed">
                                                    {c.text}
                                                </p>

                                                {/* Expanded Inspection */}
                                                <AnimatePresence>
                                                    {expandedComment === c.id && (
                                                        <motion.div 
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
                                                                <div className="p-3 bg-background rounded-lg border border-border">
                                                                    <div className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Confidence Score</div>
                                                                    <div className="text-xl font-mono font-bold text-primary">{(c.confidence * 100).toFixed(1)}%</div>
                                                                    <div className="h-1.5 w-full bg-muted rounded-full mt-2 overflow-hidden">
                                                                        <div className="h-full bg-primary" style={{ width: `${c.confidence * 100}%` }} />
                                                                    </div>
                                                                </div>
                                                                <div className="p-3 bg-black/20 rounded-lg border border-border font-mono text-[10px] text-muted-foreground overflow-x-auto">
                                                                    <div>{`{`}</div>
                                                                    <div className="pl-2">{`"id": "cmt_${c.id}",`}</div>
                                                                    <div className="pl-2">{`"flagged": ${c.sentiment === 'negative'},`}</div>
                                                                    <div className="pl-2 text-green-400">{`"processed": true`}</div>
                                                                    <div>{`}`}</div>
                                                                    <div className="mt-2 text-xs text-primary cursor-pointer hover:underline flex items-center gap-1">
                                                                        <Filter className="w-3 h-3" /> View Full Log
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default function ReviewBlogPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground font-medium animate-pulse">Loading AI Context...</p>
                </div>
            </div>
        }>
            <ReviewContent />
        </Suspense>
    );
}

// Add these to globals.css if not present for the scrollbar styling
// .custom-scrollbar::-webkit-scrollbar { width: 6px; }
// .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
// .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.2); border-radius: 10px; }

