import { useState } from 'react';
import toast from 'react-hot-toast';

export const useClipboard = () => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text, message = 'Copied to clipboard!') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(message);
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
      
      // Optional: Clear clipboard after 30 seconds for security
      setTimeout(() => {
        navigator.clipboard.writeText('');
      }, 30000);
      
      return true;
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast.error('Failed to copy to clipboard');
      return false;
    }
  };

  return { copyToClipboard, copied };
};
