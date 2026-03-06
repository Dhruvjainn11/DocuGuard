// src/components/upload/UploadModal.jsx
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader2, CheckCircle2, FileText, Sparkles, PenTool } from 'lucide-react';
import api from '../../utils/axios';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

const UploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
  // --- STATE MACHINE ---
  // Added 'file_selected' as the crossroads!
  const [step, setStep] = useState('idle'); 
  const [file, setFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [error, setError] = useState('');

  // --- STEP 1: DROP THE FILE ---
  const onDrop = useCallback((acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    // Instead of jumping straight to AI, we go to the Crossroads!
    setStep('file_selected');
    setError('');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [], 'application/pdf': [] },
    maxFiles: 1,
  });

  // --- STEP 2A: THE AI PATH ---
  const handleStartAI = async () => {
    setStep('analyzing');
    setError('');

    const formData = new FormData();
    formData.append('document', file);

    try {
      const response = await api.post('/document/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setExtractedData(response.data.data.extractedData);
      setStep('review');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze document');
      setStep('file_selected'); // Send them back to the crossroads on error
    }
  };

  // --- STEP 2B: THE MANUAL PATH ---
  const handleStartManual = () => {
    // Generate a blank slate for the user to type into
    setExtractedData({
      title: '',
      merchantName: '',
      category: '',
      expiryDate: ''
    });
    setStep('review');
  };

  // --- STEP 3: HANDLE EDITS ---
  const handleInputChange = (field, value) => {
    setExtractedData(prev => ({ ...prev, [field]: value }));
  };

  // --- STEP 4: FINAL SAVE ---
  const handleFinalSave = async () => {
    setStep('saving');
    setError('');

    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentData', JSON.stringify(extractedData)); 

    try {
      await api.post('/document/save', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      resetModal();
      onUploadSuccess(); 
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save document');
      setStep('review');
    }
  };

  const resetModal = () => {
    setStep('idle');
    setFile(null);
    setExtractedData(null);
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && resetModal()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Upload Document</DialogTitle>
          <DialogDescription className="text-base text-zinc-600">
            {step === 'idle' && 'Drag and drop your file to get started.'}
            {step === 'file_selected' && 'Choose how you want to process this document.'}
            {step === 'analyzing' && 'Gemini is reading your document...'}
            {(step === 'review' || step === 'saving') && 'Review and complete the document details.'}
          </DialogDescription>
        </DialogHeader>

        {error && <div className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>}

        {/* UI STATE 1: DROPZONE */}
        {step === 'idle' && (
          <div 
            {...getRootProps()} 
            className={`mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-16 transition-all cursor-pointer
              ${isDragActive 
                ? 'border-zinc-800 bg-gradient-to-br from-zinc-100 to-zinc-50 scale-[1.01]' 
                : 'border-zinc-300 hover:border-zinc-400 hover:bg-gradient-to-br hover:from-zinc-50 hover:to-white'}`}
          >
            <input {...getInputProps()} />
            <div className="bg-zinc-100 p-4 rounded-full mb-4">
              <UploadCloud className="h-10 w-10 text-zinc-600" />
            </div>
            <p className="text-base font-semibold text-zinc-800 mb-1">
              {isDragActive ? 'Drop your file here' : 'Drag & drop or click to browse'}
            </p>
            <p className="text-sm text-zinc-500">Supports JPG, PNG, WEBP, PDF (Max 10MB)</p>
          </div>
        )}

        {/* UI STATE 2: THE CROSSROADS (NEW!) */}
        {step === 'file_selected' && file && (
          <div className="py-8 flex flex-col items-center justify-center space-y-6">
            <div className="flex items-center space-x-4 bg-gradient-to-r from-zinc-50 to-zinc-100 p-5 rounded-xl w-full max-w-md border border-zinc-200 shadow-sm">
              <div className="bg-white p-3 rounded-lg">
                <FileText className="h-7 w-7 text-zinc-700" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold text-zinc-900 truncate">{file.name}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full max-w-md">
              <Button 
                className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-md h-11" 
                onClick={handleStartAI}
              >
                <Sparkles className="mr-2 h-4 w-4" /> Auto-Fill with AI
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 border-zinc-300 hover:bg-zinc-50 h-11" 
                onClick={handleStartManual}
              >
                <PenTool className="mr-2 h-4 w-4" /> Enter Manually
              </Button>
            </div>
          </div>
        )}

        {/* UI STATE 3: ANALYZING (LOADING) */}
        {step === 'analyzing' && (
          <div className="py-16 flex flex-col items-center justify-center space-y-4">
            <div className="bg-indigo-50 p-4 rounded-full">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            </div>
            <p className="text-base font-medium text-zinc-700 animate-pulse">Extracting details securely...</p>
          </div>
        )}

        {/* UI STATE 4: REVIEW/MANUAL FORM (SIDE-BY-SIDE) */}
        {(step === 'review' || step === 'saving') && extractedData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            {/* LEFT SIDE: Image Preview */}
            <div className="bg-gradient-to-br from-zinc-50 to-zinc-100 rounded-xl overflow-hidden flex items-center justify-center h-[400px] border border-zinc-200 shadow-sm">
              {file && file.type.includes('pdf') ? (
                <div className="text-zinc-500 flex flex-col items-center">
                  <div className="bg-white p-4 rounded-full mb-3">
                    <FileText className="h-12 w-12 text-zinc-600" />
                  </div>
                  <p className="font-semibold text-zinc-700">PDF Document</p>
                  <p className="text-sm text-zinc-500 mt-1">Preview not available</p>
                </div>
              ) : file ? (
                <img 
                  src={URL.createObjectURL(file)} 
                  alt="Document Preview" 
                  className="max-h-full max-w-full object-contain p-4"
                />
              ) : (
                <div className="text-zinc-400 flex flex-col items-center">
                  <UploadCloud className="h-16 w-16 mb-2" />
                  <p className="text-sm">No preview available</p>
                </div>
              )}
            </div>

            {/* RIGHT SIDE: The Form */}
            <div className="space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-zinc-700">Document Title *</Label>
                  <Input 
                    value={extractedData.title || ''} 
                    onChange={(e) => handleInputChange('title', e.target.value)} 
                    placeholder="e.g., iPhone Receipt"
                    className="h-11 border-zinc-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-zinc-700">Merchant Name</Label>
                  <Input 
                    value={extractedData.merchantName || ''} 
                    onChange={(e) => handleInputChange('merchantName', e.target.value)} 
                    placeholder="e.g., Apple Store"
                    className="h-11 border-zinc-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-zinc-700">Category</Label>
                  <Input 
                    value={extractedData.category || ''} 
                    onChange={(e) => handleInputChange('category', e.target.value)} 
                    placeholder="e.g., RECEIPT, ID, MEDICAL"
                    className="h-11 border-zinc-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-zinc-700">Expiry Date (Optional)</Label>
                  <Input 
                    type="date"
                    value={extractedData.expiryDate ? extractedData.expiryDate.split('T')[0] : ''} 
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)} 
                    className="h-11 border-zinc-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <Button 
                className="w-full mt-auto h-12 bg-gradient-to-r from-zinc-900 to-zinc-800 hover:from-zinc-800 hover:to-zinc-700 text-white font-semibold shadow-md" 
                onClick={handleFinalSave} 
                disabled={step === 'saving' || !extractedData.title}
              >
                {step === 'saving' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
                {step === 'saving' ? 'Encrypting & Saving...' : 'Confirm & Save to Vault'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UploadModal;