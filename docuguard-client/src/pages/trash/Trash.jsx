// src/pages/trash/Trash.jsx
import { useState } from 'react';
import { useDocuments } from '../../hooks/useDocuments';
import DocumentCard from '../../components/documents/DocumentCard';
import TrashDetailsModal from '../../components/documents/TrashDetailsModal';
import { Loader2, Trash2 } from 'lucide-react';

const Trash = () => {
  // We tell the hook to ONLY fetch documents where status is 'trash'
  const { documents, isLoading, error, refresh } = useDocuments({ status: 'trash' });
  const [selectedDoc, setSelectedDoc] = useState(null);

  if (isLoading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>;
  if (error) return <div className="flex h-[60vh] items-center justify-center text-red-500"><p>Error: {error}</p></div>;

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          Items in trash are automatically deleted after 30 days.
        </p>
      </div>

      {documents.length === 0 ? (
        <div className="flex h-[50vh] flex-col items-center justify-center text-zinc-400 space-y-4">
          <Trash2 className="h-16 w-16 opacity-30" />
          <p className="text-lg font-medium text-zinc-600">Your trash is empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {documents.map((doc) => (
            <div key={doc._id} className="opacity-75 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
              <DocumentCard 
                doc={doc} 
                onClick={() => setSelectedDoc(doc)} 
              />
            </div>
          ))}
        </div>
      )}

      {/* The Trash-Specific Modal */}
      <TrashDetailsModal 
        doc={selectedDoc} 
        isOpen={!!selectedDoc} 
        onClose={() => setSelectedDoc(null)} 
        onActionSuccess={() => refresh()} // Refresh the trash grid when an item is restored or destroyed
      />
    </>
  );
};

export default Trash;