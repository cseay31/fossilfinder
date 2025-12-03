import React, { useRef, useState } from 'react';
import { Camera, Upload, Image, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from 'framer-motion';

export default function PhotoUpload({ onPhotoCapture, photo }) {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState("");

  // Supported formats for AI analysis
  const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png'];
  const supportedExtensions = ['.jpeg', '.jpg', '.png'];

  const validateFileType = (file) => {
    if (!supportedFormats.includes(file.type)) {
      setFileError(`Unsupported file format. Please use JPEG or PNG files only.`);
      return false;
    }
    setFileError("");
    return true;
  };

  const handleFileSelect = (files) => {
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        if (validateFileType(file)) {
          onPhotoCapture(file);
        }
      } else {
        setFileError("Please select an image file.");
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const clearPhoto = () => {
    setFileError("");
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
        ref={fileInputRef}
        type="file"
        accept={supportedExtensions.join(',')}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept={supportedExtensions.join(',')}
        capture="environment"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {fileError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{fileError}</AlertDescription>
        </Alert>
      )}

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 bg-white ${
          dragActive 
            ? 'border-amber-400 bg-amber-50/50' 
            : 'border-stone-300 hover:border-stone-400'
        }`}
      >
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-amber-100 to-stone-100 rounded-full flex items-center justify-center">
            <Image className="w-8 h-8 text-amber-600" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-stone-800 mb-2">
              Upload Archaeological Photo
            </h3>
            <p className="text-stone-600 mb-6">
              Take a photo or select from your device
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              onClick={() => cameraInputRef.current?.click()}
              className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-lg"
            >
              <Camera className="w-5 h-5 mr-2" />
              Take Photo
            </Button>
            
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="border-stone-300 hover:bg-stone-50"
            >
              <Upload className="w-5 h-5 mr-2" />
              Browse Files
            </Button>
          </div>

          <p className="text-xs text-stone-500 mt-4">
            Supported formats: JPEG, PNG only
            <br />
            <span className="text-amber-600">Note: WebP files are not supported for AI analysis</span>
          </p>
        </div>
      </div>
    </div>
  );
}