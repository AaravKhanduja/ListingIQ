import jsPDF from 'jspdf';

interface ScoreBreakdown {
  location: number;
  condition: number;
  market_potential: number;
  investment_value: number;
}

interface MarketAnalysis {
  trends: string;
  comparables: string;
  appreciation_potential: string;
}

interface InvestmentPotential {
  rental_income: string;
  cash_flow: string;
  roi_projections: string;
  appreciation_timeline: string;
}

interface RiskAssessment {
  market_risks: string[];
  property_risks: string[];
  mitigation_strategies: string[];
}

interface RenovationAnalysis {
  estimated_costs: string;
  priority_improvements: string[];
  renovation_roi: string;
}

interface InvestmentRecommendation {
  recommendation: string;
  ideal_buyer: string;
  timeline: string;
}

interface AnalysisData {
  overallScore?: number;
  scoreBreakdown?: ScoreBreakdown;
  executiveSummary?: string;
  marketAnalysis?: MarketAnalysis;
  investmentPotential?: InvestmentPotential;
  riskAssessment?: RiskAssessment;
  renovationAnalysis?: RenovationAnalysis;
  investmentRecommendation?: InvestmentRecommendation;
  strengths: string[];
  weaknesses: string[];
  hiddenIssues: string[];
  questions: string[];
  generatedAt?: string;
}

export const downloadTextPDF = async (filename: string = 'listing-analysis.pdf') => {
  try {
    // Starting PDF generation...
    
    // Get the main content
    const mainContent = document.querySelector('main');
    if (!mainContent) {
      throw new Error('Main content not found');
    }

    // Extract content
    const title = mainContent.querySelector('h1, h2, h3')?.textContent || 'Property Analysis';
    
    // Extract comprehensive analysis data
    const analysisData = extractAnalysisData(mainContent);
    
    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    let yPosition = 30;
    
    // Title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, 20, yPosition);
    yPosition += 20;
    
    // Overall Score
    if (analysisData.overallScore) {
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Overall Investment Score: ${analysisData.overallScore}/100`, 20, yPosition);
      yPosition += 15;
    }
    
    // Score Breakdown
    if (analysisData.scoreBreakdown) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Score Breakdown:', 20, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const breakdown = analysisData.scoreBreakdown;
      pdf.text(`Location: ${breakdown.location}/25`, 25, yPosition);
      yPosition += 5;
      pdf.text(`Condition: ${breakdown.condition}/25`, 25, yPosition);
      yPosition += 5;
      pdf.text(`Market Potential: ${breakdown.market_potential}/25`, 25, yPosition);
      yPosition += 5;
      pdf.text(`Investment Value: ${breakdown.investment_value}/25`, 25, yPosition);
      yPosition += 10;
    }
    
    // Executive Summary
    if (analysisData.executiveSummary) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Executive Summary', 20, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const splitSummary = pdf.splitTextToSize(analysisData.executiveSummary, 170);
      pdf.text(splitSummary, 20, yPosition);
      yPosition += splitSummary.length * 5 + 10;
    }
    
    // Market Analysis
    if (analysisData.marketAnalysis) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Market Analysis', 20, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Market Trends:', 20, yPosition);
      yPosition += 5;
      pdf.setFont('helvetica', 'normal');
      const trends = pdf.splitTextToSize(analysisData.marketAnalysis.trends, 160);
      pdf.text(trends, 20, yPosition);
      yPosition += trends.length * 5 + 5;
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Comparable Properties:', 20, yPosition);
      yPosition += 5;
      pdf.setFont('helvetica', 'normal');
      const comparables = pdf.splitTextToSize(analysisData.marketAnalysis.comparables, 160);
      pdf.text(comparables, 20, yPosition);
      yPosition += comparables.length * 5 + 5;
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Appreciation Potential:', 20, yPosition);
      yPosition += 5;
      pdf.setFont('helvetica', 'normal');
      const appreciation = pdf.splitTextToSize(analysisData.marketAnalysis.appreciation_potential, 160);
      pdf.text(appreciation, 20, yPosition);
      yPosition += appreciation.length * 5 + 10;
    }
    
    // Investment Potential
    if (analysisData.investmentPotential) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Investment Potential', 20, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Rental Income:', 20, yPosition);
      yPosition += 5;
      pdf.setFont('helvetica', 'normal');
      const rental = pdf.splitTextToSize(analysisData.investmentPotential.rental_income, 160);
      pdf.text(rental, 20, yPosition);
      yPosition += rental.length * 5 + 5;
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Cash Flow:', 20, yPosition);
      yPosition += 5;
      pdf.setFont('helvetica', 'normal');
      const cashFlow = pdf.splitTextToSize(analysisData.investmentPotential.cash_flow, 160);
      pdf.text(cashFlow, 20, yPosition);
      yPosition += cashFlow.length * 5 + 5;
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('ROI Projections:', 20, yPosition);
      yPosition += 5;
      pdf.setFont('helvetica', 'normal');
      const roi = pdf.splitTextToSize(analysisData.investmentPotential.roi_projections, 160);
      pdf.text(roi, 20, yPosition);
      yPosition += roi.length * 5 + 5;
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Appreciation Timeline:', 20, yPosition);
      yPosition += 5;
      pdf.setFont('helvetica', 'normal');
      const timeline = pdf.splitTextToSize(analysisData.investmentPotential.appreciation_timeline, 160);
      pdf.text(timeline, 20, yPosition);
      yPosition += timeline.length * 5 + 10;
    }
    
    // Risk Assessment
    if (analysisData.riskAssessment) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Risk Assessment', 20, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Market Risks:', 20, yPosition);
      yPosition += 5;
      pdf.setFont('helvetica', 'normal');
             analysisData.riskAssessment.market_risks.forEach((risk: string) => {
         const riskText = pdf.splitTextToSize(`• ${risk}`, 160);
         pdf.text(riskText, 20, yPosition);
         yPosition += riskText.length * 5 + 2;
       });
      yPosition += 5;
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Property Risks:', 20, yPosition);
      yPosition += 5;
      pdf.setFont('helvetica', 'normal');
             analysisData.riskAssessment.property_risks.forEach((risk: string) => {
         const riskText = pdf.splitTextToSize(`• ${risk}`, 160);
         pdf.text(riskText, 20, yPosition);
         yPosition += riskText.length * 5 + 2;
       });
       yPosition += 5;
       
       pdf.setFont('helvetica', 'bold');
       pdf.text('Mitigation Strategies:', 20, yPosition);
       yPosition += 5;
       pdf.setFont('helvetica', 'normal');
       analysisData.riskAssessment.mitigation_strategies.forEach((strategy: string) => {
         const strategyText = pdf.splitTextToSize(`• ${strategy}`, 160);
         pdf.text(strategyText, 20, yPosition);
         yPosition += strategyText.length * 5 + 2;
       });
      yPosition += 10;
    }
    
    // Renovation Analysis
    if (analysisData.renovationAnalysis) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Renovation Analysis', 20, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Estimated Costs:', 20, yPosition);
      yPosition += 5;
      pdf.setFont('helvetica', 'normal');
      const costs = pdf.splitTextToSize(analysisData.renovationAnalysis.estimated_costs, 160);
      pdf.text(costs, 20, yPosition);
      yPosition += costs.length * 5 + 5;
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Priority Improvements:', 20, yPosition);
      yPosition += 5;
      pdf.setFont('helvetica', 'normal');
             analysisData.renovationAnalysis.priority_improvements.forEach((improvement: string) => {
         const improvementText = pdf.splitTextToSize(`• ${improvement}`, 160);
         pdf.text(improvementText, 20, yPosition);
         yPosition += improvementText.length * 5 + 2;
       });
       yPosition += 5;
       
       pdf.setFont('helvetica', 'bold');
       pdf.text('Renovation ROI:', 20, yPosition);
       yPosition += 5;
       pdf.setFont('helvetica', 'normal');
       const renovationRoi = pdf.splitTextToSize(analysisData.renovationAnalysis.renovation_roi, 160);
       pdf.text(renovationRoi, 20, yPosition);
       yPosition += renovationRoi.length * 5 + 10;
     }
     
     // Investment Recommendation
     if (analysisData.investmentRecommendation) {
       pdf.setFontSize(14);
       pdf.setFont('helvetica', 'bold');
       pdf.text('Investment Recommendation', 20, yPosition);
       yPosition += 8;
       
       pdf.setFontSize(10);
       pdf.setFont('helvetica', 'normal');
       
       pdf.setFont('helvetica', 'bold');
       pdf.text(`Recommendation: ${analysisData.investmentRecommendation.recommendation}`, 20, yPosition);
       yPosition += 8;
       
       pdf.setFont('helvetica', 'bold');
       pdf.text('Ideal Buyer:', 20, yPosition);
       yPosition += 5;
       pdf.setFont('helvetica', 'normal');
       const buyer = pdf.splitTextToSize(analysisData.investmentRecommendation.ideal_buyer, 160);
       pdf.text(buyer, 20, yPosition);
       yPosition += buyer.length * 5 + 5;
       
       pdf.setFont('helvetica', 'bold');
       pdf.text('Timeline:', 20, yPosition);
       yPosition += 5;
       pdf.setFont('helvetica', 'normal');
       const timeline = pdf.splitTextToSize(analysisData.investmentRecommendation.timeline, 160);
       pdf.text(timeline, 20, yPosition);
       yPosition += timeline.length * 5 + 10;
     }
     
     // Key Strengths
     if (analysisData.strengths && analysisData.strengths.length > 0) {
       pdf.setFontSize(14);
       pdf.setFont('helvetica', 'bold');
       pdf.text('Key Strengths', 20, yPosition);
       yPosition += 8;
       
       pdf.setFontSize(10);
       pdf.setFont('helvetica', 'normal');
       analysisData.strengths.forEach((strength: string) => {
         const strengthText = pdf.splitTextToSize(`• ${strength}`, 160);
         pdf.text(strengthText, 20, yPosition);
         yPosition += strengthText.length * 5 + 2;
       });
       yPosition += 10;
     }
     
     // Potential Risks
     if (analysisData.weaknesses && analysisData.weaknesses.length > 0) {
       pdf.setFontSize(14);
       pdf.setFont('helvetica', 'bold');
       pdf.text('Potential Risks', 20, yPosition);
       yPosition += 8;
       
       pdf.setFontSize(10);
       pdf.setFont('helvetica', 'normal');
       analysisData.weaknesses.forEach((weakness: string) => {
         const weaknessText = pdf.splitTextToSize(`• ${weakness}`, 160);
         pdf.text(weaknessText, 20, yPosition);
         yPosition += weaknessText.length * 5 + 2;
       });
       yPosition += 10;
     }
     
     // Hidden Issues
     if (analysisData.hiddenIssues && analysisData.hiddenIssues.length > 0) {
       pdf.setFontSize(14);
       pdf.setFont('helvetica', 'bold');
       pdf.text('Hidden Issues', 20, yPosition);
       yPosition += 8;
       
       pdf.setFontSize(10);
       pdf.setFont('helvetica', 'normal');
       analysisData.hiddenIssues.forEach((issue: string) => {
         const issueText = pdf.splitTextToSize(`• ${issue}`, 160);
         pdf.text(issueText, 20, yPosition);
         yPosition += issueText.length * 5 + 2;
       });
       yPosition += 10;
     }
     
     // Smart Questions
     if (analysisData.questions && analysisData.questions.length > 0) {
       pdf.setFontSize(14);
       pdf.setFont('helvetica', 'bold');
       pdf.text('Smart Questions', 20, yPosition);
       yPosition += 8;
       
       pdf.setFontSize(10);
       pdf.setFont('helvetica', 'normal');
       analysisData.questions.forEach((question: string) => {
         const questionText = pdf.splitTextToSize(`• ${question}`, 160);
         pdf.text(questionText, 20, yPosition);
         yPosition += questionText.length * 5 + 2;
       });
       yPosition += 10;
     }
    
    // Footer
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const generatedAt = analysisData.generatedAt || new Date().toLocaleString();
    pdf.text(`Generated on: ${generatedAt}`, 20, 280);
    
    pdf.save(filename);
    
  } catch (error) {
    throw new Error('Failed to generate PDF. Please try again.');
  }
};

function extractAnalysisData(mainContent: Element) {
  const data: AnalysisData = {
    strengths: [],
    weaknesses: [],
    hiddenIssues: [],
    questions: [],
  };
  
  // Extract score
  const scoreElement = mainContent.querySelector('.inline-flex.items-center.px-6.py-3');
  if (scoreElement) {
    const scoreText = scoreElement.textContent || '';
    const scoreMatch = scoreText.match(/(\d+)/);
    if (scoreMatch) {
      data.overallScore = parseInt(scoreMatch[1]);
    }
  }
  
  // Extract score breakdown
  const breakdownElements = mainContent.querySelectorAll('.text-2xl.font-bold');
  if (breakdownElements.length >= 4) {
    data.scoreBreakdown = {
      location: parseInt(breakdownElements[0]?.textContent || '0'),
      condition: parseInt(breakdownElements[1]?.textContent || '0'),
      market_potential: parseInt(breakdownElements[2]?.textContent || '0'),
      investment_value: parseInt(breakdownElements[3]?.textContent || '0'),
    };
  }
  
  // Extract sections from cards
  const cards = mainContent.querySelectorAll('[class*="card"]');
  cards.forEach(card => {
    const cardTitle = card.querySelector('[class*="card-title"], h3, h4')?.textContent?.toLowerCase();
    const content = card.querySelector('[class*="card-content"]') || card;
    
    if (cardTitle?.includes('executive summary')) {
      data.executiveSummary = content.textContent?.trim();
    } else if (cardTitle?.includes('market analysis')) {
      data.marketAnalysis = extractMarketAnalysis(content);
    } else if (cardTitle?.includes('investment potential')) {
      data.investmentPotential = extractInvestmentPotential(content);
    } else if (cardTitle?.includes('risk assessment')) {
      data.riskAssessment = extractRiskAssessment(content);
    } else if (cardTitle?.includes('renovation analysis')) {
      data.renovationAnalysis = extractRenovationAnalysis(content);
    } else if (cardTitle?.includes('investment recommendation')) {
      data.investmentRecommendation = extractInvestmentRecommendation(content);
    }
  });
  
  // Extract analysis sections
  const allCards = mainContent.querySelectorAll('[class*="card"]');
  allCards.forEach((card) => {
    const cardTitle = card.querySelector('[class*="text-xl"], [class*="card-title"], h3, h4')?.textContent?.toLowerCase();
    const items = Array.from(card.querySelectorAll('p'))
      .map(p => p.textContent)
      .filter((text): text is string => text !== null && text !== undefined && text.trim().length > 0);
    
    if (cardTitle?.includes('strength')) {
      data.strengths = items;
    } else if (cardTitle?.includes('risk') || cardTitle?.includes('weakness')) {
      data.weaknesses = items;
    } else if (cardTitle?.includes('hidden') || cardTitle?.includes('issue')) {
      data.hiddenIssues = items;
    } else if (cardTitle?.includes('question')) {
      data.questions = items;
    }
  });
  
  // Extract generated at
  const generatedAtElement = mainContent.querySelector('.text-center.text-sm.text-gray-500');
  if (generatedAtElement) {
    const generatedText = generatedAtElement.textContent || '';
    const match = generatedText.match(/Generated on: (.+)/);
    if (match) {
      data.generatedAt = match[1];
    }
  }
  
  // Try localStorage if no content found
  if (Object.keys(data).length === 0) {
    try {
      const savedAnalyses = JSON.parse(localStorage.getItem('savedAnalyses') || '[]');
      const latestAnalysis = savedAnalyses[savedAnalyses.length - 1];
      if (latestAnalysis?.analysis) {
        return {
          ...data,
          ...latestAnalysis.analysis,
        };
      }
    } catch (error) {
      // Silent fail
    }
  }
  
  return data;
}

function extractMarketAnalysis(content: Element) {
  const sections = content.querySelectorAll('div');
  const data: MarketAnalysis = {
    trends: '',
    comparables: '',
    appreciation_potential: '',
  };
  
  sections.forEach(section => {
    const title = section.querySelector('h4')?.textContent?.toLowerCase();
    const text = section.querySelector('p')?.textContent?.trim();
    
    if (title?.includes('trend')) {
      data.trends = text || '';
    } else if (title?.includes('comparable')) {
      data.comparables = text || '';
    } else if (title?.includes('appreciation')) {
      data.appreciation_potential = text || '';
    }
  });
  
  return data;
}

function extractInvestmentPotential(content: Element) {
  const sections = content.querySelectorAll('div');
  const data: InvestmentPotential = {
    rental_income: '',
    cash_flow: '',
    roi_projections: '',
    appreciation_timeline: '',
  };
  
  sections.forEach(section => {
    const title = section.querySelector('h4')?.textContent?.toLowerCase();
    const text = section.querySelector('p')?.textContent?.trim();
    
    if (title?.includes('rental')) {
      data.rental_income = text || '';
    } else if (title?.includes('cash flow')) {
      data.cash_flow = text || '';
    } else if (title?.includes('roi')) {
      data.roi_projections = text || '';
    } else if (title?.includes('timeline')) {
      data.appreciation_timeline = text || '';
    }
  });
  
  return data;
}

function extractRiskAssessment(content: Element) {
  const sections = content.querySelectorAll('div');
  const data: RiskAssessment = {
    market_risks: [],
    property_risks: [],
    mitigation_strategies: [],
  };
  
  sections.forEach(section => {
    const title = section.querySelector('h4')?.textContent?.toLowerCase();
    const items = Array.from(section.querySelectorAll('li'))
      .map(li => li.textContent?.trim())
      .filter((text): text is string => text !== null && text !== undefined);
    
    if (title?.includes('market risk')) {
      data.market_risks = items;
    } else if (title?.includes('property risk')) {
      data.property_risks = items;
    } else if (title?.includes('mitigation')) {
      data.mitigation_strategies = items;
    }
  });
  
  return data;
}

function extractRenovationAnalysis(content: Element) {
  const sections = content.querySelectorAll('div');
  const data: RenovationAnalysis = {
    estimated_costs: '',
    priority_improvements: [],
    renovation_roi: '',
  };
  
  sections.forEach(section => {
    const title = section.querySelector('h4')?.textContent?.toLowerCase();
    const text = section.querySelector('p')?.textContent?.trim();
    const items = Array.from(section.querySelectorAll('li'))
      .map(li => li.textContent?.trim())
      .filter((text): text is string => text !== null && text !== undefined);
    
    if (title?.includes('cost')) {
      data.estimated_costs = text || '';
    } else if (title?.includes('improvement')) {
      data.priority_improvements = items;
    } else if (title?.includes('roi')) {
      data.renovation_roi = text || '';
    }
  });
  
  return data;
}

function extractInvestmentRecommendation(content: Element) {
  const sections = content.querySelectorAll('div');
  const data: InvestmentRecommendation = {
    recommendation: '',
    ideal_buyer: '',
    timeline: '',
  };
  
  sections.forEach(section => {
    const title = section.querySelector('h4')?.textContent?.toLowerCase();
    const text = section.querySelector('p')?.textContent?.trim();
    
    if (title?.includes('recommendation')) {
      const badge = section.querySelector('[class*="badge"]');
      data.recommendation = badge?.textContent?.trim() || text || '';
    } else if (title?.includes('buyer')) {
      data.ideal_buyer = text || '';
    } else if (title?.includes('timeline')) {
      data.timeline = text || '';
    }
  });
  
  return data;
} 