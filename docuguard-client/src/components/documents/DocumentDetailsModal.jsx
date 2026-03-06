// src/components/documents/DocumentDetailsModal.jsx
import { useState, useEffect } from 'react';
import { Trash2, ExternalLink, CalendarDays, Building2, Tag, Loader2, Image as ImageIcon } from 'lucide-react';
import api from '../../utils/axios';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

const DocumentDetailsModal = ({ doc, isOpen, onClose, onDeleteSuccess }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  
  const [secureImageUrl, setSecureImageUrl] = useState(null);
  const [isImageLoading, setIsImageLoading] = useState(true);

  useEffect(() => {
    if (isOpen && doc?._id) {
      const fetchSecureImage = async () => {
        setIsImageLoading(true);
        try {
          // FIXED: Changed /document/ to /documents/
          const response = await api.get(`/document/${doc._id}/view`);
          setSecureImageUrl(response.data.data.url);
        } catch (err) {
          console.error("Failed to load secure image link", err);
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

  const { _id, title, extractedData, createdAt } = doc;
  const { merchantName, category, expiryDate } = extractedData || {};

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to move this to the trash?")) return;
    setIsDeleting(true);
    setError('');
    try {
      await api.delete(`/document/${_id}`);
      setIsDeleting(false);
      onClose();
      onDeleteSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete document');
      setIsDeleting(false);
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
              <>
                <img 
                  src={secureImageUrl} 
                  alt={title} 
                  className="max-h-full max-w-full object-contain"
                />
                <a 
                  href={secureImageUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-md backdrop-blur-sm transition-colors"
                  title="Open original image"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
              </>
            ) : (
              <div className="text-zinc-500 flex flex-col items-center">
                <ImageIcon className="h-10 w-10 mb-2 opacity-50" />
                <p className="text-sm">Preview unavailable</p>
              </div>
            )}
          </div>

          {/* RIGHT SIDE: Details & Actions */}
          {/* FIXED: Added h-full here to stop the bottom bar from getting pushed off-screen */}
          <div className="w-full md:w-2/5 flex flex-col bg-white h-full">
            <DialogHeader className="p-6 border-b border-zinc-100 pb-6 shrink-0">
              <DialogTitle className="text-2xl font-bold text-zinc-900 pr-8">{title}</DialogTitle>
              <DialogDescription className="mt-2">
                Added on {new Date(createdAt).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>

            {error && <div className="mx-6 mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-md font-medium shrink-0">{error}</div>}

            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Document Details</h4>
                
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center mr-4">
                    <Tag className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Category</p>
                    <Badge variant="secondary" className="mt-0.5">{category || 'UNCATEGORIZED'}</Badge>
                  </div>
                </div>

                {merchantName && (
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-4">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Merchant / Issuer</p>
                      <p className="font-medium text-zinc-900">{merchantName}</p>
                    </div>
                  </div>
                )}

                {expiryDate && (
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mr-4">
                      <CalendarDays className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Expiry Date</p>
                      <p className="font-medium text-amber-700">
                        {new Date(expiryDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* BOTTOM ACTION BAR */}
            <div className="p-6 border-t border-zinc-100 bg-zinc-50 shrink-0">
              <Button 
                variant="destructive" 
                className="w-full bg-red-400 cursor-pointer hover:bg-red-500" 
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                {isDeleting ? 'Moving to Trash...' : 'Move to Trash'}
              </Button>
              <p className="text-center text-xs text-zinc-500 mt-3">
                Items in trash are permanently deleted after 30 days.
              </p>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentDetailsModal;