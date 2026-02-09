import React, { useRef, useState } from 'react';
import { Camera, Upload, Image, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from 'framer-motion';

export default function PhotoUpload({ onPhotoCapture, photo }) {
  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const [fileError, setFileError] = useState("");
  const [fileSuccess, setFileSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const validateAndUploadFile = (file) => {
    setFileError("");
    setFileSuccess(false);

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|png)$/)) {
      setFileError('Invalid file type. Only JPEG and PNG images are supported.');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10485760) {
      setFileError('File is too large. Maximum size is 10MB.');
      return;
    }

    setFileSuccess(true);
    setTimeout(() => setFileSuccess(false), 2000);
    onPhotoCapture(file);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndUploadFile(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndUploadFile(files[0]);
    }
  };

  const clearPhoto = () => {
    setFileError("");
    setFileSuccess(false);
    onPhotoCapture(null);
  };

  if (photo) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative"
      >
        <div className="relative rounded-xl overflow-hidden shadow-lg">
          <img
            src={URL.createObjectURL(photo)}
            alt="Captured archaeological finding"
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <Button
            variant="secondary"
            size="icon"
            onClick={clearPhoto}
            className="absolute top-3 right-3 bg-white/90 hover:bg-white shadow-lg"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-sm text-stone-600 text-center mt-3">
          Photo captured: {photo.name}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <input
        ref={cameraInputRef}
        type="file"
        accept=".jpg,.jpeg,.png"
        capture="environment"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            setFileSuccess(true);
            setTimeout(() => setFileSuccess(false), 2000);
            onPhotoCapture(e.target.files[0]);
          }
        }}
        className="hidden"
      />

      <AnimatePresence>
        {fileError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{fileError}</AlertDescription>
            </Alert>
          </motion.div>
        )}
        {fileSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">File uploaded successfully!</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
          isDragAccept 
            ? 'border-green-500 bg-green-50/50 scale-105' 
            : isDragReject
            ? 'border-red-500 bg-red-50/50 scale-95'
            : isDragActive 
            ? 'border-amber-400 bg-amber-50/50 scale-102' 
            : 'border-stone-300 hover:border-stone-400 bg-white hover:bg-stone-50/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <motion.div
            animate={isDragActive ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
            transition={{ duration: 0.2 }}
            className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
              isDragAccept
                ? 'bg-gradient-to-br from-green-100 to-green-200'
                : isDragReject
                ? 'bg-gradient-to-br from-red-100 to-red-200'
                : 'bg-gradient-to-br from-amber-100 to-stone-100'
            }`}
          >
            {isDragAccept ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : isDragReject ? (
              <AlertCircle className="w-8 h-8 text-red-600" />
            ) : (
              <Image className="w-8 h-8 text-amber-600" />
            )}
          </motion.div>
          
          <div>
            <h3 className="text-lg font-semibold text-stone-800 mb-2">
              {isDragAccept ? 'Drop to upload!' : isDragReject ? 'Invalid file type' : 'Upload Archaeological Photo'}
            </h3>
            <p className="text-stone-600 mb-6">
              {isDragActive ? 'Drop your image here...' : 'Drag & drop an image or click to browse'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                cameraInputRef.current?.click();
              }}
              className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-lg"
            >
              <Camera className="w-5 h-5 mr-2" />
              Take Photo
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="border-stone-300 hover:bg-stone-50"
            >
              <Upload className="w-5 h-5 mr-2" />
              Browse Files
            </Button>
          </div>

          <p className="text-xs text-stone-500 mt-4">
            Supported: JPEG, PNG • Max size: 10MB
            <br />
            <span className="text-amber-600">WebP files are not supported for AI analysis</span>
          </p>
        </div>
      </div>
    </div>
  );
}