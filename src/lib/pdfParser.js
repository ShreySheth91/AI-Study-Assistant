// ============================================
// PDF TEXT EXTRACTION
// ============================================
//
// Uses PDF.js to extract text from uploaded PDF files.
// This runs entirely in the browser - no server needed!
//
// ============================================

import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker using the correct import for Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

/**
 * Extract text content from a PDF file
 * @param {File} file - The PDF file to extract text from
 * @returns {Promise<string>} - The extracted text content
 */
export const extractTextFromPDF = async (file) => {
  try {
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true
    });

    const pdf = await loadingTask.promise;

    let fullText = '';

    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      // Combine all text items
      const pageText = textContent.items
        .map(item => item.str)
        .join(' ');

      fullText += pageText + '\n\n';
    }

    console.log(`✅ Extracted ${fullText.length} characters from ${pdf.numPages} pages`);
    return fullText.trim();
  } catch (error) {
    console.error('❌ PDF extraction failed:', error);
    throw new Error('Failed to extract text from PDF. Please try again or paste text directly.');
  }
};

/**
 * Truncate text to fit within token limits
 * @param {string} text - The text to truncate
 * @param {number} maxChars - Maximum characters
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxChars = 30000) => {
  if (text.length <= maxChars) return text;

  console.log(`⚠️ Text truncated from ${text.length} to ${maxChars} characters`);
  return text.substring(0, maxChars) + '\n\n[Content truncated for processing...]';
};