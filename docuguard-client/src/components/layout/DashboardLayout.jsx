// src/components/layout/DashboardLayout.jsx
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import UploadModal from '../uploads/UploadModal';
import { Plus } from 'lucide-react'; // Add the Plus icon to your lucide imports
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../ui/button';
import { LayoutDashboard, Trash2, LogOut, ShieldCheck } from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout, notifyUpload } = useAuthStore(); // Get the new notify function
  const navigate = useNavigate();
  const location = useLocation(); // Tells us what URL we are currently on

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const handleLogout = async () => {
    await logout(); // 1. Destroy cookie & clear memory
    navigate('/login'); // 2. Teleport to login
  };

  // Helper function to highlight the active menu item
  const isActive = (path) => location.pathname === path;
  
  const handleUploadSuccess = () => {
    setIsUploadModalOpen(false); // Close the modal
    notifyUpload(); // Tell the whole app a new file exists!
  };

  return (
    <div className="flex h-screen bg-zinc-50">
      
      {/* 1. THE SIDEBAR */}
      <aside className="w-64 border-r border-zinc-200 bg-white flex flex-col">
        {/* App Logo/Branding */}
        <div className="h-16 flex items-center px-6 border-b border-zinc-200">
          <ShieldCheck className="h-6 w-6 text-zinc-900 mr-2" />
          <span className="text-lg font-bold tracking-tight text-zinc-900">DocuGuard</span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2">
            <Button 
            className="w-full justify-start mb-6 bg-zinc-900 text-white hover:bg-zinc-800"
            onClick={() => setIsUploadModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
          <Link to="/dashboard">
            <Button 
              variant={isActive('/dashboard') ? 'secondary' : 'ghost'} 
              className="w-full justify-start"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Vault
            </Button>
          </Link>
          
          <Link to="/trash">
            <Button 
              variant={isActive('/trash') ? 'secondary' : 'ghost'} 
              className="w-full justify-start text-zinc-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Trash
            </Button>
          </Link>
        </nav>
      </aside>

      {/* 2. THE MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* The Topbar */}
        <header className="h-16 border-b border-zinc-200 bg-white flex items-center justify-between px-8 shrink-0">
          <h1 className="text-xl font-semibold text-zinc-800">
            {isActive('/dashboard') ? 'My Vault' : 'Trash'}
          </h1>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-zinc-600">
              {user?.username}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>

        {/* The Dynamic Page Content (The "Picture" inside the frame) */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet /> 
        </main>

      </div>

      {/* THE MODAL */}
      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
};

export default DashboardLayout;