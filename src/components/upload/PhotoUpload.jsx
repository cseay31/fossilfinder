import React, { useRef, useState } from 'react';
import { Camera, Upload, Image, X, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from 'framer-motion';

export default function PhotoUpload({ onPhotosChange, photos = [] }) {
  const cameraInputRef = useRef(null);
  const uploadInputRef = useRef(null);
  const [fileError, setFileError] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);

  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setFileError('Invalid file type. Only JPEG and PNG images are supported.');
      return false;
    }
    if (file.size > 10485760) {
      setFileError('File is too large. Maximum size is 10MB.');
      return false;
    }
    return true;
  };

  const handleFilesSelected = (files) => {
    setFileError("");
    const valid = Array.from(files).filter(validateFile);
    if (valid.length > 0) {
      onPhotosChange([...photos, ...valid].slice(0, 5));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    handleFilesSelected(e.dataTransfer.files);
  };

  const removePhoto = (index) => {
    const updated = photos.filter((_, i) => i !== index);
    onPhotosChange(updated);
  };

  const MAX_PHOTOS = 5;
  const canAddMore = photos.length < MAX_PHOTOS;

  return (
    <div className="space-y-4">
      <input
        ref={cameraInputRef}
        type="file"
        accept=".jpg,.jpeg,.png"
        capture="environment"
        onChange={(e) => e.target.files && handleFilesSelected(e.target.files)}
        className="hidden"
      />
      <input
        ref={uploadInputRef}
        type="file"
        accept=".jpg,.jpeg,.png"
        multiple
        onChange={(e) => e.target.files && handleFilesSelected(e.target.files)}
        className="hidden"
      />

      <AnimatePresence>
        {fileError && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{fileError}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photo thumbnails */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <AnimatePresence>
            {photos.map((photo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative rounded-xl overflow-hidden aspect-square shadow-sm"
              >
                <img
                  src={URL.createObjectURL(photo)}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {index === 0 && (
                  <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                    Primary
                  </span>
                )}
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full w-6 h-6 flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            ))}

            {/* Add more button */}
            {canAddMore && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => uploadInputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-stone-300 hover:border-stone-400 bg-stone-50 hover:bg-stone-100 flex flex-col items-center justify-center gap-1 transition-colors"
              >
                <Plus className="w-5 h-5 text-stone-400" />
                <span className="text-[11px] text-stone-400">{photos.length}/{MAX_PHOTOS}</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Drop zone — only show when no photos yet */}
      {photos.length === 0 && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragActive(false); }}
          onClick={() => uploadInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
            isDragActive
              ? 'border-amber-400 bg-amber-50/50 scale-102'
              : 'border-stone-300 hover:border-stone-400 bg-white hover:bg-stone-50/50'
          }`}
        >
          <div className="space-y-4">
            <motion.div
              animate={isDragActive ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
              transition={{ duration: 0.2 }}
              className="w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-stone-100"
            >
              <Image className="w-8 h-8 text-amber-600" />
            </motion.div>

            <div>
              <h3 className="text-lg font-semibold text-stone-800 mb-2">Upload Photos</h3>
              <p className="text-stone-600 mb-6">
                {isDragActive ? 'Drop your images here...' : 'Add up to 5 photos of the same fossil'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                type="button"
                onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
                className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-lg"
              >
                <Camera className="w-5 h-5 mr-2" />
                Take Photo
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={(e) => { e.stopPropagation(); uploadInputRef.current?.click(); }}
                className="border-stone-300 hover:bg-stone-50"
              >
                <Upload className="w-5 h-5 mr-2" />
                Browse Files
              </Button>
            </div>

            <p className="text-xs text-stone-500 mt-4">
              Supported: JPEG, PNG • Max 10MB per photo • Up to 5 photos
              <br />
              <span className="text-amber-600">WebP files are not supported for AI analysis</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}