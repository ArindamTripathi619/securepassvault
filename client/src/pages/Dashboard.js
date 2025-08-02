import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useClipboard } from '../hooks/useClipboard';
import CredentialCard from '../components/CredentialCard';
import CredentialModal from '../components/CredentialModal';
import Navbar from '../components/Navbar';
import axios from 'axios';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [credentials, setCredentials] = useState([]);
  const [filteredCredentials, setFilteredCredentials] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCredential, setEditingCredential] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { logout } = useAuth();
  const { copyToClipboard } = useClipboard();

  useEffect(() => {
    fetchCredentials();
  }, []);

  useEffect(() => {
    filterCredentials();
  }, [credentials, search, selectedTag]);

  const fetchCredentials = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/credentials');
      setCredentials(response.data);
    } catch (error) {
      console.error('Failed to fetch credentials:', error);
      toast.error('Failed to load credentials');
    } finally {
      setLoading(false);
    }
  };

  const filterCredentials = () => {
    let filtered = credentials;
    
    if (search) {
      filtered = filtered.filter(cred =>
        cred.website.toLowerCase().includes(search.toLowerCase()) ||
        cred.username.toLowerCase().includes(search.toLowerCase()) ||
        cred.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    if (selectedTag) {
      filtered = filtered.filter(cred => cred.tags.includes(selectedTag));
    }
    
    setFilteredCredentials(filtered);
  };

  const getAllTags = () => {
    const tags = new Set();
    credentials.forEach(cred => {
      cred.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  };

  const handleAddCredential = () => {
    setEditingCredential(null);
    setShowModal(true);
  };

  const handleEditCredential = (credential) => {
    setEditingCredential(credential);
    setShowModal(true);
  };

  const handleDeleteCredential = async (id) => {
    if (!window.confirm('Are you sure you want to delete this credential?')) {
      return;
    }
    
    try {
      await axios.delete(`/api/credentials/${id}`);
      toast.success('Credential deleted successfully');
      fetchCredentials();
    } catch (error) {
      console.error('Failed to delete credential:', error);
      toast.error('Failed to delete credential');
    }
  };

  const handleSaveCredential = async (credentialData) => {
    try {
      if (editingCredential) {
        await axios.put(`/api/credentials/${editingCredential._id}`, credentialData);
        toast.success('Credential updated successfully');
      } else {
        await axios.post('/api/credentials', credentialData);
        toast.success('Credential added successfully');
      }
      
      setShowModal(false);
      setEditingCredential(null);
      fetchCredentials();
    } catch (error) {
      console.error('Failed to save credential:', error);
      toast.error('Failed to save credential');
    }
  };

  const handleCopyUsername = (username) => {
    copyToClipboard(username, 'Username copied!');
  };

  const handleCopyPassword = (password) => {
    copyToClipboard(password, 'Password copied!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onLogout={logout} />
      
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Credentials</h1>
          
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by website, username, or tags..."
                className="input"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="input min-w-0 sm:w-48"
              >
                <option value="">All Tags</option>
                {getAllTags().map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
              
              <button
                onClick={handleAddCredential}
                className="btn btn-primary whitespace-nowrap"
              >
                Add New
              </button>
            </div>
          </div>
        </div>

        {/* Credentials Grid */}
        {filteredCredentials.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {search || selectedTag ? 'No matching credentials found' : 'No credentials yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {search || selectedTag 
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by adding your first credential'
              }
            </p>
            {!search && !selectedTag && (
              <button
                onClick={handleAddCredential}
                className="btn btn-primary"
              >
                Add Your First Credential
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCredentials.map((credential) => (
              <CredentialCard
                key={credential._id}
                credential={credential}
                onCopyUsername={handleCopyUsername}
                onCopyPassword={handleCopyPassword}
                onEdit={handleEditCredential}
                onDelete={handleDeleteCredential}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <CredentialModal
          credential={editingCredential}
          onSave={handleSaveCredential}
          onClose={() => {
            setShowModal(false);
            setEditingCredential(null);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;

