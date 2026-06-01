import React, { useState, useEffect } from 'react';
import { Upload, FileText, Download, Loader, AlertCircle } from 'lucide-react';
import mammoth from 'mammoth';
import jsPDF from 'jspdf';
import JSZip from 'jszip';


const API_OPTIONS = {
  gemini: { name: 'Google Gemini', model: 'gemini-2.5-flash' },
  openai: { name: 'OpenAI GPT-4', model: 'gpt-4-turbo' },
  perplexity: { name: 'Perplexity', model: 'sonar-pro' },
};

// Load PDF.js library dynamically
let pdfjsLib = null;
const loadPdfJs = async () => {
  if (pdfjsLib) return pdfjsLib;
  
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  document.head.appendChild(script);
  
  return new Promise((resolve) => {
    script.onload = () => {
      pdfjsLib = window.pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(pdfjsLib);
    };
  });
};

// Professional PDF text extraction using PDF.js
const extractPdfText = async (arrayBuffer) => {
  try {
    const pdfjsLib = await loadPdfJs();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map(item => item.str || '')
        .join(' ');
      fullText += pageText + '\n';
    }

    // Clean up extracted text
    fullText = fullText
      .replace(/\s+/g, ' ') // Multiple spaces to single
      .replace(/\n\s*\n/g, '\n') // Multiple newlines
      .trim();

    if (fullText.length > 50) {
      return fullText.substring(0, 15000);
    }
  } catch (pdfErr) {
    console.warn('PDF.js extraction failed, trying fallback:', pdfErr);
  }

  // Fallback 1: UTF-8 decoding with intelligent cleaning
  try {
    const decoded = new TextDecoder('utf-8').decode(arrayBuffer);
    const cleaned = cleanExtractedText(decoded);
    if (cleaned.length > 50) {
      return cleaned.substring(0, 15000);
    }
  } catch (err) {
    console.warn('UTF-8 fallback failed:', err);
  }

  // Fallback 2: Binary extraction
  try {
    const view = new Uint8Array(arrayBuffer);
    let text = '';
    for (let i = 0; i < view.length; i++) {
      const byte = view[i];
      if ((byte >= 32 && byte <= 126) || byte === 10 || byte === 13 || byte === 9) {
        text += String.fromCharCode(byte);
      }
    }
    const cleaned = cleanExtractedText(text);
    if (cleaned.length > 50) {
      return cleaned.substring(0, 15000);
    }
  } catch (err) {
    console.warn('Binary fallback failed:', err);
  }

  throw new Error('Could not extract readable text from PDF');
};

// Clean extracted text intelligently
const cleanExtractedText = (text) => {
  let cleaned = text;
  
  // Remove PDF operators and metadata
  cleaned = cleaned.replace(/stream|endstream|obj|endobj|xref|trailer|startxref/gi, '');
  cleaned = cleaned.replace(/<<.*?>>/gs, '');
  cleaned = cleaned.replace(/\/\w+\s+\d+\s+R/g, '');
  
  // Remove hex strings
  cleaned = cleaned.replace(/<[0-9A-Fa-f]+>/g, '');
  
  // Remove special PDF characters
  cleaned = cleaned.replace(/[^\x20-\x7E\n\r\t]/g, ' ');
  
  // Clean up whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // Remove common junk patterns
  cleaned = cleaned.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
  
  return cleaned;
};

export default function ResumeProcessor() {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState([]);
  const [apiProvider, setApiProvider] = useState('gemini');
  const [apiKey, setApiKey] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files || []);
    setFiles([...files, ...uploadedFiles]);
    setError('');
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const extractTextFromFile = async (file) => {
    const arrayBuffer = await file.arrayBuffer();

    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      return await extractPdfText(arrayBuffer);
    } else if (file.name.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value || '';
    } else if (file.name.endsWith('.doc')) {
      return await file.text();
    } else {
      return await file.text();
    }
  };

  const removeEmailPhone = (text) => {
    let cleaned = text;
    cleaned = cleaned.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REMOVED]');
    cleaned = cleaned.replace(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{2,4}[-.\s]?\d{3,4}[-.\s]?\d{2,4}/g, '[PHONE_REMOVED]');
    cleaned = cleaned.replace(/(\d{1,5}\s+\w+(\s+\w+){1,3},\s*\w+,\s*[A-Z]{2}\s*\d{5})|(\d+\s+((?:[A-Za-z]+\s*){1,4}(?:Street|St|Road|Rd|Avenue|Ave|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Place|Pl|Square|Sq)\.?))/g, '[ADDRESS_REMOVED]');
    cleaned = cleaned.replace(/\b(\d{1,4}[-/.]\d{1,4}[-/.]\d{1,4}|\d{4}|(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})\b/gi, '[DATE_REMOVED]');
    cleaned = cleaned.replace(/(social security|ssn|birthdate|date of birth|driving license|passport|citizen|nationality|linkedin|github|portfolio)/gi, '[SENSITIVE_REMOVED]');
    return cleaned;
  };

  const extractNameFromFile = (filename) => {
    const namePart = filename.split('.')[0].replace(/[-_]/g, ' ').trim();
    const words = namePart.split(/\s+/).filter(w => w.length > 0);

    if (words.length >= 2) {
      const firstName = words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
      const lastInitial = words[words.length - 1].charAt(0).toUpperCase();
      return `${firstName} ${lastInitial}.`;
    } else if (words.length === 1) {
      return words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
    }
    return 'Candidate';
  };

  const extractEducationAndCareer = async (resumeText, provider, key) => {
    const educationPrompt = `Extract from resume: 1) Highest education level (like Bachelor's, Master's, etc.), 2) Best career match (job title/role). Be specific. Return ONLY valid JSON: {"education": "...", "careerMatch": "..."}\n\nRESUME:\n${resumeText.substring(0, 10000)}`;

    try {
      if (provider === 'gemini') {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: educationPrompt }] }],
              generationConfig: { maxOutputTokens: 500, temperature: 0.3 },
            }),
          }
        );
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        const jsonMatch = text.match(/\{[^}]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : { education: 'N/A', careerMatch: 'N/A' };
      } else if (provider === 'openai') {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: 'gpt-4-turbo',
            messages: [{ role: 'user', content: educationPrompt }],
            max_tokens: 500,
            temperature: 0.3,
          }),
        });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content || '{}';
        const jsonMatch = text.match(/\{[^}]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : { education: 'N/A', careerMatch: 'N/A' };
      } else if (provider === 'perplexity') {
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: 'sonar-pro',
            messages: [{ role: 'user', content: educationPrompt }],
            max_tokens: 500,
            temperature: 0.3,
          }),
        });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content || '{}';
        const jsonMatch = text.match(/\{[^}]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : { education: 'N/A', careerMatch: 'N/A' };
      }
    } catch (err) {
      console.error('Education extraction error:', err);
    }
    return { education: 'N/A', careerMatch: 'N/A' };
  };

  const generateSummary = async (resumeText) => {
    if (!apiKey) throw new Error('Please enter your API key');
    if (!resumeText || resumeText.trim().length < 50) throw new Error('Resume text too short');
    if (!apiProvider) throw new Error('Please select an API provider');

    const prompt = `Create professional one-pager summary from resume. Use structured resume format with sections:

## Name(first name + last name first letter)
## Professional Summary
## Key Experience
## Technical Skills
## Achievements

Use * for bullets. Keep concise. NO email, phone, dates, addresses, credentials.

RESUME:
${resumeText.substring(0, 15000)}

Important: Do not write hypothetical information. Only extract what's actually in the resume. If you cannot extract information for a section, write "Not specified" for that section.`;

    try {
      if (apiProvider === 'gemini') {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { maxOutputTokens: 5000, temperature: 0.7 },
            }),
          }
        );
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      } else if (apiProvider === 'openai') {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 5000,
            temperature: 0.7,
          }),
        });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        return data.choices?.[0]?.message?.content || '';
      } else if (apiProvider === 'perplexity') {
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'sonar-pro',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 5000,
            temperature: 0.7,
          }),
        });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        return data.choices?.[0]?.message?.content || '';
      }
    } catch (error) {
      throw new Error(`${API_OPTIONS[apiProvider]?.name || 'API'} Error: ${error.message}`);
    }
  };

  const generateOnePagerContent = (name, summary, education, careerMatch, companyName) => {
    return {
      company: companyName,
      name: name,
      header: `${companyName} - One-Pager`,
      education: education,
      careerMatch: careerMatch,
      summary: summary,
      text: [companyName, name, `Education: ${education} | Career Match: ${careerMatch}`, '', summary.replace(/[#*]/g, '')].join('\n'),
    };
  };

  const downloadAsText = (content, name) => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content.text));
    element.setAttribute('download', `${name.replace(/\s+/g, '_')}_onepager.txt`);
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

 const downloadAsPDF = async (content, fileName) => {
  try {
    if (!window.html2pdf) {
      alert('PDF library not loaded');
      return;
    }

    // 1️⃣ Create DOM element
    const wrapper = document.createElement('div');
    wrapper.style.width = '210mm';
    wrapper.style.background = '#fff';

    wrapper.innerHTML = `
      <style>
        @page {
          size: A4;
          margin: 100px 40px 90px 40px;
        }

        body {
          font-family: Arial, sans-serif;
          font-size: 11px;
          line-height: 1.6;
          color: #333;
        }

        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 40px;
          text-align: center;
          border-bottom: 2px solid #5e5f60;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
        }

        .content {
          margin-top: 70px;
          margin-bottom: 80px;
          white-space: pre-wrap;
        }

        .footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          border-top: 1px solid #ddd;
          padding: 0 30px;
          background: white;
        }
      </style>

      <div class="header">
        <strong>Apprisa</strong>
      </div>

      <div class="content">
        ${content.summary
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')}
      </div>

      <div class="footer">
        <div>https://apprisa-inc.com</div>
        <div>© Apprisa</div>
      </div>
    `;

    // 2️⃣ IMPORTANT: attach to DOM
    document.body.appendChild(wrapper);

    // 3️⃣ Generate PDF
    await window.html2pdf()
      .set({
        margin: 0,
        filename: `${fileName}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
        },
      })
      .from(wrapper)
      .save();

    // 4️⃣ Cleanup
    document.body.removeChild(wrapper);

  } catch (err) {
    console.error('PDF error:', err);
    alert('PDF generation failed (check console)');
  }
};



  const processFiles = async () => {
    setError('');
    setProgress(0);

    if (!files.length) {
      setError('Please upload resume files');
      return;
    }
    if (!apiKey) {
      setError('Please enter your API key');
      return;
    }
    if (!companyName) {
      setError('Please enter your company name');
      return;
    }

    setProcessing(true);
    const newResults = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        if (file.size > 5 * 1024 * 1024) {
          setError(prev => prev + `\n${file.name} is too large`);
          continue;
        }

        const resumeText = await extractTextFromFile(file);
        if (!resumeText || resumeText.trim().length < 50) {
          setError(prev => prev + `\nCould not extract text from ${file.name}`);
          continue;
        }

        const cleanedText = removeEmailPhone(resumeText);
        const name = extractNameFromFile(file.name);
        const eduInfo = await extractEducationAndCareer(cleanedText, apiProvider, apiKey);
        const summary = await generateSummary(cleanedText);

        if (summary) {
          const content = generateOnePagerContent(name, summary, eduInfo.education || 'N/A', eduInfo.careerMatch || 'N/A', companyName);
          const fileName = `${name.replace(/\s+/g, '_')}_onepager`;

          newResults.push({
            name,
            file: file.name,
            summary,
            content,
            education: eduInfo.education || 'N/A',
            careerMatch: eduInfo.careerMatch || 'N/A',
            fileName,
          });
        }

        setProgress(Math.round(((i + 1) / files.length) * 100));
      } catch (err) {
        setError(prev => prev + `\nError: ${file.name}: ${err.message}`);
      }
    }

    setResults(newResults);
    setProcessing(false);

    if (newResults.length === 0) {
      setError(prev => prev || 'No resumes processed successfully.');
    }
  };


 const generatePDFBlob = async (content, fileName) => {
  const doc = new jsPDF('p', 'mm', 'a4');

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const marginX = 15;
  const headerHeight = 18;
  const footerHeight = 15;

  /* ---------- HEADER ---------- */
  doc.setDrawColor(94, 95, 96);
  doc.setLineWidth(0.8);
  doc.line(10, headerHeight + 5, pageWidth - 10, headerHeight + 5);

  // Optional logo
  const logo = await loadBase64Logo();
  doc.addImage(logo, 'PNG', pageWidth / 2 - 12, 5, 24, 10);

  // doc.setFontSize(14);
  // doc.setFont('helvetica', 'bold');
  // doc.text('Apprisa', pageWidth / 2, 12, { align: 'center' });

  /* ---------- FOOTER ---------- */
  const drawFooter = (pageNo) => {
    doc.setDrawColor(220);
    doc.line(10, pageHeight - footerHeight, pageWidth - 10, pageHeight - footerHeight);

    doc.setFontSize(9);
    doc.setTextColor(120);

    doc.text('https://apprisa-inc.com', 10, pageHeight - 6);
    doc.text(`Page ${pageNo}`, pageWidth / 2, pageHeight - 6, { align: 'center' });
    doc.text('© Apprisa', pageWidth - 10, pageHeight - 6, { align: 'right' });
  };

  /* ---------- CONTENT ---------- */
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40);

  const startY = headerHeight + 15;
  const maxWidth = pageWidth - marginX * 2;
  const lines = doc.splitTextToSize(
    content.summary,
    maxWidth
  );

  let y = startY;
  let pageNo = 1;

  lines.forEach(line => {
    if (y > pageHeight - footerHeight - 5) {
      drawFooter(pageNo);
      doc.addPage();
      pageNo++;
      y = startY;
    }
    doc.text(line, marginX, y);
    y += 6;
  });

  drawFooter(pageNo);

  return doc.output('blob');
};


  const downloadAllPDFsAsZip = async () => {
  try {
    const zip = new JSZip();

    for (const r of results) {
      const pdfBlob = await generatePDFBlob(r.content, r.fileName);
      zip.file(`${r.fileName}.pdf`, pdfBlob);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = `OnePager_PDFs.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch (err) {
    console.error(err);
    alert('Failed to download ZIP');
  }
};

const loadBase64Logo = async () => {
  const res = await fetch('/apprisa.png');
  const blob = await res.blob();

  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
};


 const downloadSinglePDF = async (content, fileName) => {
  const blob = await generatePDFBlob(content, fileName);

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${fileName}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Resume One-Pager Generator</h1>
          <p className="text-gray-600">Professional PDF parsing with AI-powered summaries</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-700 text-sm whitespace-pre-wrap">{error}</p>
              <button onClick={() => setError('')} className="mt-2 text-red-600 text-sm font-medium">Dismiss</button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">API Provider</label>
              <select value={apiProvider} onChange={(e) => setApiProvider(e.target.value)} className="w-full px-4 py-2 border rounded-lg">
                {Object.entries(API_OPTIONS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
              <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Enter API key" className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
              <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Company" className="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Resumes</h2>
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center bg-blue-50">
            <input type="file" multiple accept=".txt,.pdf,.docx,.doc" onChange={handleFileUpload} className="hidden" id="file-input" disabled={processing} />
            <label htmlFor="file-input" className="cursor-pointer block">
              <Upload className="mx-auto w-12 h-12 text-blue-500 mb-3" />
              <p className="text-gray-900 font-semibold">Click to upload</p>
              <p className="text-gray-600 text-sm">TXT, PDF, DOCX, DOC (max 5MB)</p>
            </label>
          </div>
          {files.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Files ({files.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {files.map((f, i) => (
                  <div key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                    <span className="text-sm text-gray-700 truncate">{f.name}</span>
                    <button onClick={() => removeFile(i)} className="text-red-500 text-sm" disabled={processing}>Remove</button>
                  </div>
                ))}
              </div>
              <button onClick={() => setFiles([])} className="mt-3 text-red-600 text-sm" disabled={processing}>Clear All</button>
            </div>
          )}
        </div>

        <button onClick={processFiles} disabled={processing || !files.length || !apiKey || !companyName} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2">
          {processing ? (<><Loader className="w-5 h-5 animate-spin" />Processing {progress}%</>) : 'Generate One-Pagers'}
        </button>

        {processing && (
          <div className="bg-white rounded-lg shadow-lg p-4 mt-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-8 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Results ({results.length})</h2>
            <div className="grid grid-cols-1 gap-6">

              <button
                onClick={downloadAllPDFsAsZip}
                className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download All PDFs (ZIP)
              </button>
              {results.map((r, i) => (
                <div key={i} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
                    <h3 className="text-lg font-semibold text-white">{r.name}</h3>
                    <p className="text-blue-100 text-xs">Education: {r.education} | Career: {r.careerMatch}</p>
                  </div>
                  <div className="p-4 md:p-6">
                    <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-80 overflow-y-auto text-xs">
                      <pre className="text-gray-700 whitespace-pre-wrap leading-relaxed font-sans">{r.summary}</pre>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => downloadAsText(r.content, r.name)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" />Text (.txt)
                      </button>
                      <button
                        onClick={() => downloadSinglePDF(r.content, r.fileName)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />PDF
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}