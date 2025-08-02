import React, { useState, useEffect } from 'react';

const CredentialModal = ({
  credential,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState({
    website: '',
    username: '',
    password: '',
    tags: []
  });
  
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (credential) {
      setFormData({
        website: credential.website || '',
        username: credential.username || '',
        password: '', // Never populate password for security reasons
        tags: credential.tags || []
      });
    } else {
      setFormData({
        website: '',
        username: '',
        password: '',
        tags: []
      });
    }
    setTagInput('');
  }, [credential]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleTagInputChange = (e) => {
    const value = e.target.value;
    
    // Check if the last character is a comma
    if (value.endsWith(',')) {
      // Remove the comma and get the tag
      const tagToAdd = value.slice(0, -1).trim();
      
      if (tagToAdd && !formData.tags.includes(tagToAdd)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagToAdd]
        }));
      }
      
      // Clear the input
      setTagInput('');
    } else if (value.includes(',')) {
      // Handle multiple commas (e.g., when pasting "tag1,tag2,tag3")
      const parts = value.split(',');
      const tagsToAdd = parts.slice(0, -1) // All complete tags (before the last comma)
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0 && !formData.tags.includes(tag));
      
      const remainingInput = parts[parts.length - 1].trim(); // What's after the last comma
      
      if (tagsToAdd.length > 0) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, ...tagsToAdd]
        }));
      }
      
      setTagInput(remainingInput);
    } else {
      // Normal typing, no comma involved
      setTagInput(value);
    }
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === ',' && tagInput.trim()) {
      // This handles the case where comma is pressed via keyboard
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && tagInput === '' && formData.tags.length > 0) {
      // Remove last tag if backspace is pressed on empty input
      setFormData(prev => ({
        ...prev,
        tags: prev.tags.slice(0, -1)
      }));
    }
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Add any remaining tag in input
    if (tagInput.trim()) {
      const finalTags = [...formData.tags];
      if (!finalTags.includes(tagInput.trim())) {
        finalTags.push(tagInput.trim());
      }
      onSave({ ...formData, tags: finalTags });
    } else {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4">{credential ? 'Edit Credential' : 'Add Credential'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="website" className="block text-sm font-medium text-gray-700">
              Website
            </label>
            <input
              type="text"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="input"
              placeholder="https://example.com"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="input"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input"
              required={!credential} // Don't require password when editing
            />
          </div>
          <div className="mb-4">
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
              Tags
            </label>
            
            {/* Display existing tags */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            {/* Tag input */}
            <input
              type="text"
              id="tags"
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyDown={handleTagInputKeyDown}
              className="input"
              placeholder="Type tags and press Enter or comma to add"
            />
            <p className="text-xs text-gray-500 mt-1">
              Press Enter or comma to add tags. Click × to remove tags.
            </p>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CredentialModal;
