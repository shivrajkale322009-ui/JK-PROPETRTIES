"use client";

import { useState, useEffect } from "react";
import { Brain, TrendingUp, AlertTriangle, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { aiAssistant, AIInsight, LeadData } from "@/lib/ai-service";

interface AIInsightsProps {
  leads: LeadData[];
  className?: string;
}

export default function AIInsights({ leads, className = "" }: AIInsightsProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    generateInsights();
  }, [leads]);

  const generateInsights = async () => {
    setLoading(true);
    const allInsights: AIInsight[] = [];

    // Analyze recent leads
    const recentLeads = leads.slice(0, 5);
    
    for (const lead of recentLeads) {
      try {
        const leadInsights = await aiAssistant.analyzeLead(lead);
        allInsights.push(...leadInsights);
      } catch (error) {
        console.error(`Failed to analyze lead ${lead.id}:`, error);
      }
    }

    // Add summary insights
    const summaryInsights = generateSummaryInsights(leads);
    allInsights.push(...summaryInsights);

    // Sort by confidence and actionable items first
    allInsights.sort((a, b) => {
      if (a.actionable && !b.actionable) return -1;
      if (!a.actionable && b.actionable) return 1;
      return b.confidence - a.confidence;
    });

    setInsights(allInsights.slice(0, 6)); // Show top 6 insights
    setLoading(false);
  };

  const generateSummaryInsights = (allLeads: LeadData[]): AIInsight[] => {
    const totalLeads = allLeads.length;
    const hotLeads = allLeads.filter(l => l.status?.toLowerCase() === 'hot').length;
    const conversionRate = totalLeads > 0 ? (hotLeads / totalLeads) * 100 : 0;

    const insights: AIInsight[] = [];

    // Conversion rate insight
    if (conversionRate > 30) {
      insights.push({
        type: 'trend',
        title: 'Excellent Conversion Rate',
        description: `Your conversion rate is ${conversionRate.toFixed(1)}%, which is above industry average.`,
        confidence: 0.9,
        actionable: false
      });
    } else if (conversionRate < 10) {
      insights.push({
        type: 'recommendation',
        title: 'Low Conversion Rate',
        description: `Consider reviewing your lead qualification process. Current rate: ${conversionRate.toFixed(1)}%`,
        confidence: 0.8,
        actionable: true
      });
    }

    // Lead volume insight
    if (totalLeads > 50) {
      insights.push({
        type: 'trend',
        title: 'High Lead Volume',
        description: `You have ${totalLeads} leads. Consider automating follow-up processes.`,
        confidence: 0.7,
        actionable: true
      });
    } else if (totalLeads < 10) {
      insights.push({
        type: 'recommendation',
        title: 'Increase Lead Generation',
        description: `Consider expanding marketing efforts. Currently have ${totalLeads} leads.`,
        confidence: 0.8,
        actionable: true
      });
    }

    // Best lead source
    const sourceCounts = allLeads.reduce((acc, lead) => {
      const source = lead.source || 'Unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const bestSource = Object.entries(sourceCounts)
      .sort(([,a], [,b]) => b - a)[0];

    if (bestSource && bestSource[0] !== 'Unknown') {
      insights.push({
        type: 'trend',
        title: 'Top Lead Source',
        description: `${bestSource[0]} is your best source with ${bestSource[1]} leads.`,
        confidence: 0.8,
        actionable: true
      });
    }

    return insights;
  };

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'lead_score':
        return <TrendingUp size={16} className="text-green-500" />;
      case 'sentiment':
        return <Brain size={16} className="text-blue-500" />;
      case 'recommendation':
        return <Lightbulb size={16} className="text-yellow-500" />;
      case 'trend':
        return <TrendingUp size={16} className="text-purple-500" />;
      default:
        return <AlertTriangle size={16} className="text-gray-500" />;
    }
  };

  const getInsightColor = (type: AIInsight['type']) => {
    switch (type) {
      case 'lead_score':
        return 'bg-green-50 border-green-200';
      case 'sentiment':
        return 'bg-blue-50 border-blue-200';
      case 'recommendation':
        return 'bg-yellow-50 border-yellow-200';
      case 'trend':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className={`ai-insights-loading ${className}`}>
        <div className="flex items-center gap-2">
          <Brain size={16} className="animate-pulse" />
          <span className="text-sm text-gray-600">Analyzing leads...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`ai-insights ${className}`}>
      <div className="ai-insights-header">
        <div className="flex items-center gap-2">
          <Brain size={18} className="text-purple-600" />
          <h3 className="font-semibold text-gray-900">AI Insights</h3>
          <span className="text-xs text-gray-500">({insights.length} insights)</span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="ai-insights-list"
          >
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`ai-insight-item ${getInsightColor(insight.type)}`}
              >
                <div className="ai-insight-header">
                  <div className="flex items-center gap-2">
                    {getInsightIcon(insight.type)}
                    <span className="font-medium text-sm">{insight.title}</span>
                  </div>
                  {insight.actionable && (
                    <span className="ai-insight-badge">Actionable</span>
                  )}
                </div>
                <p className="ai-insight-description">{insight.description}</p>
                <div className="ai-insight-footer">
                  <span className="ai-insight-confidence">
                    {Math.round(insight.confidence * 100)}% confidence
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {!expanded && insights.length > 0 && (
        <div className="ai-insights-preview">
          {insights.slice(0, 2).map((insight, index) => (
            <div
              key={index}
              className={`ai-insight-preview-item ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-center gap-2">
                {getInsightIcon(insight.type)}
                <span className="text-sm font-medium truncate">{insight.title}</span>
              </div>
            </div>
          ))}
          {insights.length > 2 && (
            <div className="ai-insights-more">
              <span className="text-xs text-gray-500">+{insights.length - 2} more</span>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .ai-insights {
          background: white;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          overflow: hidden;
        }

        .ai-insights-loading {
          padding: 16px;
          text-align: center;
          background: white;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }

        .ai-insights-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid #f3f4f6;
          background: #fafafa;
        }

        .ai-insights-list {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 400px;
          overflow-y: auto;
        }

        .ai-insight-item {
          padding: 12px;
          border-radius: 8px;
          border: 1px solid;
          transition: all 0.2s ease;
        }

        .ai-insight-item:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .ai-insight-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .ai-insight-badge {
          background: #667eea;
          color: white;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 10px;
          font-weight: 500;
        }

        .ai-insight-description {
          font-size: 13px;
          color: #4b5563;
          line-height: 1.4;
          margin: 0;
        }

        .ai-insight-footer {
          margin-top: 8px;
          display: flex;
          justify-content: flex-end;
        }

        .ai-insight-confidence {
          font-size: 11px;
          color: #6b7280;
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .ai-insights-preview {
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ai-insight-preview-item {
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid;
        }

        .ai-insights-more {
          text-align: center;
          padding: 8px;
          background: #f9fafb;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .ai-insights-more:hover {
          background: #f3f4f6;
        }
      `}</style>
    </div>
  );
}
