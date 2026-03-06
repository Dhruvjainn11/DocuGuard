// src/pages/dashboard/Dashboard.jsx
import { useState } from 'react';
import { useDocuments } from '../../hooks/useDocuments';
import DocumentCard from '../../components/documents/DocumentCard';
import DocumentDetailsModal from '../../components/documents/DocumentDetailsModal';
import { Loader2, FileX2 } from 'lucide-react';

const Dashboard = () => {
  // 1. Call our custom hook to grab the brain!
  const { documents, isLoading, error, refresh } = useDocuments();

  // New State to track which document the user clicked on!
  const [selectedDoc, setSelectedDoc] = useState(null);

  // 2. The Loading State
  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  // 3. The Error State
  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  // 4. The Empty Vault State
  if (documents.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-zinc-400 space-y-4">
        <FileX2 className="h-16 w-16 opacity-50" />
        <p className="text-lg font-medium text-zinc-600">Your vault is completely empty.</p>
        <p className="text-sm">Upload a document to get started.</p>
      </div>
    );
  }

  // 5. The Grid View (This maps over your actual data!)
  return (
    <>
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {documents.map((doc) => (
          <DocumentCard key={doc._id} doc={doc} 
          onClick={()=> setSelectedDoc(doc)}
          />
        ))}
    </div>
    {/* The Details Modal */}
      <DocumentDetailsModal 
        doc={selectedDoc} 
        isOpen={!!selectedDoc} // Open if selectedDoc is not null
        onClose={() => setSelectedDoc(null)} // Close by clearing the state
        onDeleteSuccess={() => refresh()} // Refresh the grid so the deleted item vanishes instantly!
      />
        </>
  );
};

export default Dashboard;