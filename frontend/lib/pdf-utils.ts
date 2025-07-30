import jsPDF from 'jspdf';

export const downloadTextPDF = async (filename: string = 'listing-analysis.pdf') => {
  try {
    console.log('Starting PDF generation...');
    
    // Get the main content
    const mainContent = document.querySelector('main');
    if (!mainContent) {
      throw new Error('Main content not found');
    }

    // Extract content
    const title = mainContent.querySelector('h1, h2, h3')?.textContent || 'Property Analysis';
    const summary = mainContent.querySelector('p')?.textContent || '';
    
    // Extract analysis sections
    const allCards = mainContent.querySelectorAll('[class*="card"]');
    let strengths: string[] = [];
    let weaknesses: string[] = [];
    let hiddenIssues: string[] = [];
    let questions: string[] = [];
    
    allCards.forEach((card) => {
      const cardTitle = card.querySelector('[class*="text-xl"], [class*="card-title"], h3, h4')?.textContent?.toLowerCase();
      const items = Array.from(card.querySelectorAll('p'))
        .map(p => p.textContent)
        .filter((text): text is string => text !== null && text !== undefined && text.trim().length > 0);
      
      if (cardTitle?.includes('strength')) {
        strengths = items;
      } else if (cardTitle?.includes('weakness')) {
        weaknesses = items;
      } else if (cardTitle?.includes('hidden') || cardTitle?.includes('issue')) {
        hiddenIssues = items;
      } else if (cardTitle?.includes('question')) {
        questions = items;
      }
    });
    
    // Get score if available
    const scoreElement = mainContent.querySelector('.inline-flex.items-center.px-6.py-3');
    const score = scoreElement?.textContent || '';
    
    // Try localStorage if no content found
    if (strengths.length === 0 && weaknesses.length === 0 && hiddenIssues.length === 0 && questions.length === 0) {
      try {
        const savedAnalyses = JSON.parse(localStorage.getItem('savedAnalyses') || '[]');
        const latestAnalysis = savedAnalyses[savedAnalyses.length - 1];
        if (latestAnalysis?.analysis) {
          strengths = latestAnalysis.analysis.strengths || [];
          weaknesses = latestAnalysis.analysis.weaknesses || [];
          hiddenIssues = latestAnalysis.analysis.hiddenIssues || [];
          questions = latestAnalysis.analysis.questions || [];
        }
      } catch (error) {
        console.warn('Failed to get analysis from localStorage:', error);
      }
    }
    
    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    let yPosition = 30;
    
    // Title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, 20, yPosition);
    yPosition += 20;
    
    // Score
    if (score) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Score: ${score}`, 20, yPosition);
      yPosition += 15;
    }
    
    // Summary
    if (summary) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      const splitSummary = pdf.splitTextToSize(summary, 170);
      pdf.text(splitSummary, 20, yPosition);
      yPosition += splitSummary.length * 6 + 15;
    }
    
    // Analysis sections
    const addSection = (title: string, items: string[]) => {
      if (items.length === 0) return yPosition;
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      items.forEach((item) => {
        const splitText = pdf.splitTextToSize(`• ${item}`, 160);
        pdf.text(splitText, 25, yPosition);
        yPosition += splitText.length * 5 + 5;
      });
      
      yPosition += 10;
      return yPosition;
    };
    
    addSection('Strengths', strengths);
    addSection('Weaknesses', weaknesses);
    addSection('Hidden Issues', hiddenIssues);
    addSection('Questions', questions);
    
    // Footer
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, 20, 280);
    
    pdf.save(filename);
    console.log('PDF generation completed successfully');
    
  } catch (error) {
    console.error('Error in PDF generation:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
}; 