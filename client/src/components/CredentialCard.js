import React, { useState } from 'react';

const CredentialCard = ({ 
  credential, 
  onCopyUsername, 
  onCopyPassword, 
  onEdit, 
  onDelete 
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleCopyPassword = () => {
    // In a real implementation, this would decrypt the password first
    // For now, we'll just copy the encrypted version as a placeholder
    onCopyPassword('•••••••••'); // Placeholder - actual decryption would happen here
  };

  const getWebsiteIcon = (website) => {
    try {
      const domain = new URL(website.startsWith('http') ? website : `https://${website}`).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  const formatWebsite = (website) => {
    if (website.startsWith('http')) {
      try {
        return new URL(website).hostname;
      } catch {
        return website;
      }
    }
    return website;
  };

  return (
    <div className="card p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 min-w-0">
        <div className="flex items-center space-x-3 min-w-0 flex-1 mr-2">
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden flex-shrink-0">
            {getWebsiteIcon(credential.website) ? (
              <img 
                src={getWebsiteIcon(credential.website)} 
                alt="" 
                className="h-6 w-6"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="h-6 w-6 bg-primary-500 rounded text-white text-xs flex items-center justify-center" style={{display: getWebsiteIcon(credential.website) ? 'none' : 'flex'}}>
              {credential.website.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate max-w-full" title={formatWebsite(credential.website)}>
              {formatWebsite(credential.website)}
            </h3>
            <p className="text-sm text-gray-500 truncate max-w-full" title={credential.username}>
              {credential.username}
            </p>
          </div>
        </div>
        
        {/* Actions Menu */}
        <div className="flex space-x-1 flex-shrink-0">
          <button
            onClick={() => onEdit(credential)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
            title="Edit"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(credential._id)}
            className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Copy Buttons */}
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
        <button
          onClick={() => onCopyUsername(credential.username)}
          className="flex-1 btn btn-secondary text-sm py-2 flex items-center justify-center"
        >
          <svg className="h-4 w-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="truncate">Copy Username</span>
        </button>
        <button
          onClick={handleCopyPassword}
          className="flex-1 btn btn-primary text-sm py-2 flex items-center justify-center"
        >
          <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z" />
          </svg>
          <span className="truncate">Copy Password</span>
        </button>
      </div>

      {/* Tags */}
      {credential.tags && credential.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {credential.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Last Updated */}
      <div className="pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Updated {new Date(credential.updatedAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default CredentialCard;
