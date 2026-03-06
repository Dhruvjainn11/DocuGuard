// src/components/documents/TrashDetailsModal.jsx
import { useState, useEffect } from 'react';
import { Trash2, ExternalLink, RefreshCw, Loader2, Image as ImageIcon } from 'lucide-react';
import api from '../../utils/axios';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';

const TrashDetailsModal = ({ doc, isOpen, onClose, onActionSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  
  const [secureImageUrl, setSecureImageUrl] = useState(null);
  const [isImageLoading, setIsImageLoading] = useState(true);

  useEffect(() => {
    if (isOpen && doc?._id) {
      const fetchSecureImage = async () => {
        setIsImageLoading(true);
        try {
          const response = await api.get(`/document/${doc._id}/view`);
          setSecureImageUrl(response.data.data.url);
        } catch (err) {
          setError("Could not load the secure image preview.");
        } finally {
          setIsImageLoading(false);
        }
      };
      fetchSecureImage();
    } else {
      setSecureImageUrl(null);
    }
  }, [isOpen, doc]);

  if (!doc) return null;

  const { _id, title, createdAt, updatedAt } = doc;

  // --- ACTION: RESTORE ---
  const handleRestore = async () => {
    setIsProcessing(true);
    setError('');
    try {
      // Assuming your backend has an update route that accepts status changes
      await api.put(`/document/${_id}`, { status: 'active' });
      setIsProcessing(false);
      onClose();
      onActionSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to restore document');
      setIsProcessing(false);
    }
  };

  // --- ACTION: PERMANENT DELETE ---
  const handlePermanentDelete = async () => {
    if (!window.confirm("WARNING: This will permanently destroy the file. This cannot be undone. Continue?")) return;
    setIsProcessing(true);
    setError('');
    try {
      // You may need to ensure your backend has a DELETE /documents/:id/force route, 
      // or if your standard DELETE route actually deletes it when status is already 'trash'
      await api.delete(`/documents/${_id}/force`); 
      setIsProcessing(false);
      onClose();
      onActionSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to permanently delete document');
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden">
        <div className="flex flex-col md:flex-row h-[80vh] md:h-[600px]">
          
          {/* LEFT SIDE: Secure Image Viewer */}
          <div className="w-full md:w-3/5 bg-zinc-900 relative flex items-center justify-center border-r border-zinc-200">
            {isImageLoading ? (
              <div className="flex flex-col items-center text-zinc-500">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <p className="text-sm">Decrypting image...</p>
              </div>
            ) : secureImageUrl ? (
               <img src={secureImageUrl} alt={title} className="max-h-full max-w-full object-contain" />
            ) : (
              <div className="text-zinc-500 flex flex-col items-center">
                <ImageIcon className="h-10 w-10 mb-2 opacity-50" />
                <p className="text-sm">Preview unavailable</p>
              </div>
            )}
          </div>

          {/* RIGHT SIDE: Details & Actions */}
          <div className="w-full md:w-2/5 flex flex-col bg-white h-full">
            <DialogHeader className="p-6 border-b border-zinc-100 pb-6 shrink-0 bg-red-50/50">
              <DialogTitle className="text-2xl font-bold text-zinc-900 pr-8">{title}</DialogTitle>
              <DialogDescription className="mt-2 text-red-600 font-medium">
                This item is in the Trash.
              </DialogDescription>
            </DialogHeader>

            {error && <div className="mx-6 mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-md font-medium shrink-0">{error}</div>}

            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-zinc-500">Original Upload Date</p>
                  <p className="font-medium text-zinc-900">{new Date(createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Deleted On</p>
                  <p className="font-medium text-zinc-900">{new Date(updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* BOTTOM ACTION BAR (RESTORE OR DESTROY) */}
            <div className="p-6 border-t border-zinc-100 bg-zinc-50 shrink-0 space-y-3">
              <Button 
                variant="default" 
                className="w-full bg-green-600 hover:bg-green-700 text-white" 
                onClick={handleRestore}
                disabled={isProcessing}
              >
                {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Restore to Vault
              </Button>
              <Button 
                variant="outline" 
                className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200" 
                onClick={handlePermanentDelete}
                disabled={isProcessing}
              >
                {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                Delete Forever
              </Button>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrashDetailsModal;