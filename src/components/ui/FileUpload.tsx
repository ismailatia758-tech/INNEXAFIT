'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onUploadSuccess: (url: string) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  label?: string;
}

export default function FileUpload({ 
  onUploadSuccess, 
  accept = { 'image/*': ['.png', '.jpg', '.jpeg'], 'application/pdf': ['.pdf'] },
  maxSize = 5242880, // 5MB
  label = 'Upload file'
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      const url = response.data.data.url;
      setPreview(url);
      onUploadSuccess(url);
      toast.success('File uploaded successfully');
    } catch (error) {
      toast.error('Upload failed. Check file size and type.');
    } finally {
      setUploading(false);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept, 
    maxSize,
    multiple: false 
  });

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="relative group rounded-[2rem] overflow-hidden border border-border aspect-square w-full max-w-[200px]">
           {preview.endsWith('.pdf') ? (
             <div className="flex flex-col items-center justify-center h-full bg-secondary">
                <File size={40} className="text-muted-foreground" />
                <span className="text-[10px] font-bold mt-2 uppercase tracking-widest">PDF Document</span>
             </div>
           ) : (
             <img src={preview} alt="Preview" className="w-full h-full object-cover" />
           )}
           <button 
            onClick={() => setPreview(null)}
            className="absolute top-2 right-2 p-1.5 bg-background/80 backdrop-blur-sm rounded-full text-muted-foreground hover:text-destructive transition-all opacity-0 group-hover:opacity-100"
           >
              <X size={14} />
           </button>
        </div>
      ) : (
        <div 
          {...getRootProps()} 
          className={`relative border-2 border-dashed rounded-[2.5rem] p-12 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-4 ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 bg-secondary/20'
          }`}
        >
          <input {...getInputProps()} />
          <div className="p-4 rounded-full bg-background border border-border text-muted-foreground">
             {uploading ? <Loader2 className="animate-spin" size={32} /> : <Upload size={32} />}
          </div>
          <div>
             <p className="font-bold">{uploading ? 'Uploading...' : label}</p>
             <p className="text-xs text-muted-foreground mt-1">PNG, JPG or PDF up to 5MB</p>
          </div>
          {isDragActive && (
            <div className="absolute inset-0 bg-primary/10 backdrop-blur-[2px] rounded-[2.5rem] flex items-center justify-center">
               <p className="font-black text-primary">Drop it here!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
