// src/components/documents/DocumentCard.jsx
import { useState, useEffect } from 'react';
import { Building2, CalendarDays, Loader2, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Badge } from '../ui/badge';
import api from '../../utils/axios';

const DocumentCard = ({ doc, onClick }) => {
  // We extract _id so we can fetch the image securely
  const { _id, title, extractedData, createdAt } = doc;
  const { merchantName, category, expiryDate } = extractedData || {};

  // --- SECURE IMAGE STATE ---
  const [secureImageUrl, setSecureImageUrl] = useState(null);
  const [isImageLoading, setIsImageLoading] = useState(true);

  // --- FETCH SECURE THUMBNAIL ON MOUNT ---
  useEffect(() => {
    let isMounted = true; // Prevents memory leaks if the card is destroyed before the image loads
    
    const fetchSecureImage = async () => {
      setIsImageLoading(true);
      try {
        const response = await api.get(`/document/${_id}/view`);
        if (isMounted) setSecureImageUrl(response.data.data.url);
      } catch (err) {
        console.error("Failed to load secure thumbnail", err);
      } finally {
        if (isMounted) setIsImageLoading(false);
      }
    };

    if (_id) fetchSecureImage();

    return () => { isMounted = false; };
  }, [_id]);

  // Format the dates
  const formattedExpiry = expiryDate ? new Date(expiryDate).toLocaleDateString() : null;
  const formattedCreated = new Date(createdAt).toLocaleDateString();

  return (
    <Card
      onClick={onClick}
      className="overflow-hidden flex flex-col transition-all hover:shadow-md border-zinc-200 cursor-pointer hover:border-indigo-300"
    >
      
      {/* Top Image Section (Upgraded with Loading States) */}
      <div className="h-40 bg-zinc-100 relative border-b border-zinc-100 flex items-center justify-center">
        {isImageLoading ? (
          <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
        ) : secureImageUrl ? (
          <img 
            src={secureImageUrl} 
            alt={title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-zinc-400 flex flex-col items-center">
            <ImageIcon className="h-8 w-8 mb-1 opacity-50" />
            <span className="text-xs font-medium">No Preview</span>
          </div>
        )}
        
        {/* Floating Category Badge */}
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-white/90 shadow-sm backdrop-blur-sm font-semibold">
            {category || 'UNCATEGORIZED'}
          </Badge>
        </div>
      </div>

      {/* Main Content (Title & AI Data) */}
      <CardContent className="p-4 flex-1 space-y-3">
        <h3 className="font-semibold text-lg leading-tight line-clamp-1 text-zinc-900" title={title}>
          {title}
        </h3>
        
        <div className="space-y-1.5">
          {merchantName && (
            <div className="flex items-center text-sm text-zinc-500">
              <Building2 className="w-4 h-4 mr-2 shrink-0" />
              <span className="line-clamp-1">{merchantName}</span>
            </div>
          )}
          
          {formattedExpiry && (
            <div className="flex items-center text-sm font-medium text-amber-600">
              <CalendarDays className="w-4 h-4 mr-2 shrink-0" />
              <span>Expires: {formattedExpiry}</span>
            </div>
          )}
        </div>
      </CardContent>

      {/* Footer (Added Date) */}
      <CardFooter className="p-4 bg-zinc-50/50 border-t flex justify-between items-center">
        <span className="text-xs font-medium text-zinc-400">Added {formattedCreated}</span>
      </CardFooter>
      
    </Card>
  );
};

export default DocumentCard;