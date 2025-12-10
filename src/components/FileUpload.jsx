// ============================================
// FILE UPLOAD COMPONENT
// ============================================
//
// Handles both PDF file uploads and direct text input.
// Extracts text from PDFs using PDF.js
//
// ============================================

import { useState, useRef } from 'react';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { extractTextFromPDF, truncateText } from '../lib/pdfParser';

const FileUpload = ({ onContentReady }) => {
  const [mode, setMode] = useState('upload'); // 'upload' or 'text'
  const [fileName, setFileName] = useState('');
  const [textContent, setTextContent] = useState('');
  const [title, setTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Handle PDF file selection
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    setError('');
    setFileName(file.name);
    setIsProcessing(true);

    try {
      // Extract text from PDF
      const text = await extractTextFromPDF(file);
      const truncatedText = truncateText(text);
      setTextContent(truncatedText);
      setTitle(file.name.replace('.pdf', ''));
    } catch (err) {
      setError(err.message);
      setFileName('');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!textContent.trim()) {
      setError('Please provide some study material');
      return;
    }

    if (!title.trim()) {
      setError('Please provide a title for your material');
      return;
    }

    // Pass content to parent component
    onContentReady({
      title: title.trim(),
      content: textContent.trim()
    });
  };

  // Clear uploaded content
  const handleClear = () => {
    setFileName('');
    setTextContent('');
    setTitle('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-slate rounded-2xl p-6 border border-gray-800">
      <h2 className="font-display text-xl font-semibold mb-4 text-white">
        📚 Upload Study Material
      </h2>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode('upload')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            mode === 'upload'
              ? 'bg-accent text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <Upload className="inline w-4 h-4 mr-2" />
          Upload PDF
        </button>
        <button
          onClick={() => setMode('text')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            mode === 'text'
              ? 'bg-accent text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <FileText className="inline w-4 h-4 mr-2" />
          Paste Text
        </button>
      </div>

      {/* Title Input */}
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">Material Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Chapter 5 - Machine Learning Basics"
          className="w-full px-4 py-3 bg-midnight border border-gray-700 rounded-lg 
                     text-white placeholder-gray-500 focus:border-accent focus:outline-none"
        />
      </div>

      {/* Upload Mode */}
      {mode === 'upload' && (
        <div className="mb-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
            id="pdf-upload"
          />
          
          {!fileName ? (
            <label
              htmlFor="pdf-upload"
              className="flex flex-col items-center justify-center w-full h-40 
                         border-2 border-dashed border-gray-700 rounded-xl 
                         hover:border-accent cursor-pointer transition-colors"
            >
              {isProcessing ? (
                <Loader2 className="w-10 h-10 text-accent animate-spin" />
              ) : (
                <>
                  <Upload className="w-10 h-10 text-gray-500 mb-2" />
                  <span className="text-gray-400">Click to upload PDF</span>
                  <span className="text-sm text-gray-600 mt-1">Max 50 pages recommended</span>
                </>
              )}
            </label>
          ) : (
            <div className="flex items-center justify-between p-4 bg-midnight rounded-lg border border-gray-700">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-accent" />
                <span className="text-white">{fileName}</span>
              </div>
              <button
                onClick={handleClear}
                className="p-1 hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Text Mode */}
      {mode === 'text' && (
        <div className="mb-4">
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Paste your study material here... (notes, textbook content, lecture transcripts, etc.)"
            className="w-full h-40 px-4 py-3 bg-midnight border border-gray-700 rounded-lg 
                       text-white placeholder-gray-500 focus:border-accent focus:outline-none
                       resize-none"
          />
          <p className="text-sm text-gray-500 mt-1">
            {textContent.length.toLocaleString()} characters
          </p>
        </div>
      )}

      {/* Preview (if content exists) */}
      {textContent && (
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">Content Preview</label>
          <div className="p-4 bg-midnight rounded-lg border border-gray-700 max-h-32 overflow-y-auto">
            <p className="text-gray-300 text-sm whitespace-pre-wrap">
              {textContent.substring(0, 500)}
              {textContent.length > 500 && '...'}
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!textContent || !title || isProcessing}
        className="w-full py-3 bg-accent hover:bg-accent-light disabled:bg-gray-700 
                   disabled:cursor-not-allowed text-white font-semibold rounded-lg 
                   transition-colors"
      >
        {isProcessing ? 'Processing...' : 'Continue with this Material'}
      </button>
    </div>
  );
};

export default FileUpload;
