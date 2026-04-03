import jsPDF from 'jspdf';
import { LegacyRecipe } from '../types/recipe';

export const exportRecipeToPDF = (recipe: LegacyRecipe) => {
  // Create new PDF document
  const doc = new jsPDF();
  
  // Set up styling
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPosition = margin;
  
  // Helper function to add text with word wrap
  const addWrappedText = (text: string, fontSize: number, isBold = false) => {
    doc.setFontSize(fontSize);
    if (isBold) {
      doc.setFont("helvetica", "bold");
    } else {
      doc.setFont("helvetica", "normal");
    }
    
    const lines = doc.splitTextToSize(text, contentWidth);
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += fontSize * 0.5;
    });
    yPosition += 5; // Add spacing after text block
  };
  
  // Add title
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  const titleLines = doc.splitTextToSize(recipe.title, contentWidth);
  titleLines.forEach((line: string) => {
    doc.text(line, margin, yPosition);
    yPosition += 10;
  });
  yPosition += 5;
  
  // Add recipe metadata
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  
  const metadata = [];
  if (recipe.cuisine) metadata.push(`Cuisine: ${recipe.cuisine}`);
  if (recipe.prepTime) metadata.push(`Prep: ${recipe.prepTime}m`);
  if (recipe.cookTime) metadata.push(`Cook: ${recipe.cookTime}m`);
  if (recipe.servings) metadata.push(`Servings: ${recipe.servings}`);
  if (recipe.difficulty) metadata.push(`Difficulty: ${recipe.difficulty}`);
  
  doc.text(metadata.join(' • '), margin, yPosition);
  doc.setTextColor(0);
  yPosition += 10;
  
  // Add description if exists
  if (recipe.description) {
    addWrappedText(recipe.description, 11);
    yPosition += 5;
  }
  
  // Add horizontal line
  doc.setDrawColor(200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;
  
  // Add Ingredients section
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text('Ingredients', margin, yPosition);
  yPosition += 10;
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  recipe.ingredients.forEach((ingredient, index) => {
    if (yPosition > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
    
    // Add bullet point
    doc.text(`• ${ingredient}`, margin + 5, yPosition);
    yPosition += 7;
  });
  
  yPosition += 10;
  
  // Add Instructions section
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text('Instructions', margin, yPosition);
  yPosition += 10;
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  recipe.instructions.forEach((instruction, index) => {
    if (yPosition > pageHeight - margin * 2) {
      doc.addPage();
      yPosition = margin;
    }
    
    // Add step number
    doc.setFont("helvetica", "bold");
    doc.text(`Step ${index + 1}:`, margin, yPosition);
    yPosition += 7;
    
    // Add instruction text with wrap
    doc.setFont("helvetica", "normal");
    const instructionLines = doc.splitTextToSize(instruction, contentWidth - 10);
    instructionLines.forEach((line: string) => {
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin + 5, yPosition);
      yPosition += 6;
    });
    yPosition += 5;
  });
  
  // Add nutrition info if available
  if (recipe.nutrition && Object.keys(recipe.nutrition).length > 0) {
    if (yPosition > pageHeight - margin * 3) {
      doc.addPage();
      yPosition = margin;
    }
    
    yPosition += 10;
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text('Nutrition Information (per serving)', margin, yPosition);
    yPosition += 10;
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    
    const nutritionInfo = [];
    if (recipe.nutrition.calories) nutritionInfo.push(`Calories: ${recipe.nutrition.calories}`);
    if (recipe.nutrition.protein) nutritionInfo.push(`Protein: ${recipe.nutrition.protein}g`);
    if (recipe.nutrition.carbs) nutritionInfo.push(`Carbs: ${recipe.nutrition.carbs}g`);
    if (recipe.nutrition.fat) nutritionInfo.push(`Fat: ${recipe.nutrition.fat}g`);
    if ((recipe.nutrition as any).fiber) nutritionInfo.push(`Fiber: ${(recipe.nutrition as any).fiber}g`);
    if ((recipe.nutrition as any).sugar) nutritionInfo.push(`Sugar: ${(recipe.nutrition as any).sugar}g`);
    
    nutritionInfo.forEach(info => {
      doc.text(`• ${info}`, margin + 5, yPosition);
      yPosition += 7;
    });
  }
  
  // Add tags if available
  if (recipe.tags && recipe.tags.length > 0) {
    if (yPosition > pageHeight - margin * 2) {
      doc.addPage();
      yPosition = margin;
    }
    
    yPosition += 10;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Tags: ${recipe.tags.join(', ')}`, margin, yPosition);
  }
  
  // Add footer with date
  doc.setFontSize(8);
  doc.setTextColor(150);
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  doc.text(`Generated on ${currentDate}`, margin, pageHeight - 10);
  
  // Save the PDF
  const fileName = `${recipe.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_recipe.pdf`;
  doc.save(fileName);
};