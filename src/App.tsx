import { useState, useRef, useEffect } from 'react';
import type { ChangeEvent, DragEvent, KeyboardEvent } from 'react';
import { Button } from "./components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./components/ui/card"
import { Copy, Loader2, Check, Moon, Sun, UploadCloud, X, ScanText, AlertCircle } from 'lucide-react';
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from 'framer-motion';

// Animation variants for Framer Motion
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  },
  exit: { opacity: 0, y: -20 }
};

// Helper component for loading state
const LoadingBar = ({ progress }: { progress: number }) => (
  <div className="w-full space-y-2">
    <div className="flex justify-between text-sm text-muted-foreground">
      <span>Processing image...</span>
      <span className="font-medium">{progress}%</span>
    </div>
    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
      <motion.div 
        className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
    </div>
  </div>
);

export default function App() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useTheme();

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB');
        return;
      }
      handleImageFile(file);
    } else {
      setError('Please upload a valid image file (JPG, PNG, WEBP)');
    }
  };

  const handleImageFile = (file: File) => {
    setImage(file);
    setExtractedText('');
    
    // Create image preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB');
        return;
      }
      handleImageFile(file);
    }
  };

  // Handle keyboard navigation for the drop zone
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  const handleUpload = async () => {
    if (!image) return;

    setIsLoading(true);
    setProgress(30);
    
    const formData = new FormData();
    formData.append('image', image);

    setError(null);
    try {
      console.log('Sending request to server...');
      const response = await fetch('/api/extract-text', {
        method: 'POST',
        body: formData,
      });
      
      setProgress(70);
      
      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('API Error:', response.status, response.statusText, responseData);
        throw new Error(
          responseData.error || 
          responseData.details || 
          `Server error: ${response.status} ${response.statusText}`
        );
      }
      
      setExtractedText(responseData.text || 'No text could be extracted');
      setError(null);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(`Error: ${errorMessage}`);
      setExtractedText('');
    } finally {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 500);
    }
  };

  const handleCopy = async () => {
    if (!extractedText) return;
    
    try {
      await navigator.clipboard.writeText(extractedText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            <div className="flex items-center">
              <div className="rounded-full overflow-hidden border-2 border-primary/20">
                <img 
                  src="/logo.jpg" 
                  alt="SnapText Logo" 
                  className="h-8 w-8 object-cover"
                  width={32}
                  height={32}
                  loading="eager"
                />
              </div>
              <motion.span 
                className="ml-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                SnapText
              </motion.span>
            </div>
          </h1>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="rounded-full hover:bg-muted/50 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 transition-transform hover:rotate-12" />
            ) : (
              <Moon className="h-5 w-5 transition-transform hover:rotate-12" />
            )}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col">
        <motion.div 
          className="max-w-3xl mx-auto w-full flex-1 flex flex-col"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <Card className="flex-1 flex flex-col border-border/50 shadow-sm">
            <CardHeader className="border-b">
              <motion.div 
                className="space-y-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <CardTitle className="text-2xl font-bold tracking-tight">
                  Extract Text from Image
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Upload an image and extract text using OCR technology
                </CardDescription>
              </motion.div>
            </CardHeader>
            
            <CardContent className="flex-1 p-6 flex flex-col">
              <AnimatePresence mode="wait">
                {!imagePreview ? (
                  <motion.div
                    key="upload-area"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="w-full"
                  >
                    <div 
                      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                        isDragging 
                          ? 'border-primary bg-primary/5 scale-[1.01] shadow-sm' 
                          : 'border-border hover:border-primary/50 bg-muted/30 hover:shadow-sm'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      onKeyDown={handleKeyDown}
                      role="button"
                      tabIndex={0}
                      aria-label="Upload area. Drag and drop an image or click to browse."
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageChange}
                        aria-label="Select image file"
                      />
                      <div className="space-y-4">
                        <motion.div 
                          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <UploadCloud className="w-8 h-8 text-primary" />
                        </motion.div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            {isDragging ? 'Drop the image here' : 'Drag & drop an image here'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            or click to browse files (JPG, PNG, WEBP up to 5MB)
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="preview-area"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6 w-full"
                  >
                    {/* Image Preview */}
                    <motion.div 
                      className="relative group rounded-lg overflow-hidden border border-border/50 bg-background/50"
                      whileHover={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                      transition={{ duration: 0.3 }}
                    >
                      <img 
                        src={imagePreview} 
                        alt="Preview of uploaded image" 
                        className="w-full max-h-[400px] object-contain p-2"
                        loading="lazy"
                      />
                      <motion.div 
                        className="absolute top-3 right-3"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImage(null);
                            setImagePreview(null);
                            setExtractedText('');
                          }}
                          className="rounded-full w-9 h-9 shadow-md"
                          aria-label="Remove image"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </motion.div>
                    
                    {/* Action Buttons */}
                    {!extractedText ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <Button 
                          onClick={handleUpload} 
                          disabled={isLoading}
                          className="w-full h-11 text-base font-medium transition-all"
                          size="lg"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Extracting...
                            </>
                          ) : (
                            <>
                              <ScanText className="mr-2 h-4 w-4" />
                              Extract Text
                            </>
                          )}
                        </Button>
                      </motion.div>
                    ) : null}

                    {/* Loading State */}
                    {isLoading && (
                      <motion.div 
                        className="space-y-4"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <LoadingBar progress={progress} />
                        <p className="text-sm text-muted-foreground text-center">
                          Extracting text from your image. This may take a moment...
                        </p>
                      </motion.div>
                    )}

                    {/* Error Message */}
                    <AnimatePresence>
                      {error && (
                        <motion.div 
                          className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <div className="flex items-start">
                            <AlertCircle className="h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                            <div>
                              <p className="font-medium">Something went wrong</p>
                              <p className="text-sm mt-1">{error}</p>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="mt-2 text-destructive hover:bg-destructive/10"
                                onClick={() => setError(null)}
                              >
                                Dismiss
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Extracted Text */}
                    {extractedText && (
                      <motion.div 
                        className="space-y-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <h3 className="font-medium text-lg">Extracted Text</h3>
                          <div className="flex space-x-2 w-full sm:w-auto">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCopy}
                              disabled={isLoading || !extractedText}
                              className="gap-1.5 flex-1 sm:flex-initial"
                              aria-label={isCopied ? 'Text copied' : 'Copy text to clipboard'}
                            >
                              {isCopied ? (
                                <>
                                  <Check className="h-4 w-4" />
                                  <span>Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-4 w-4" />
                                  <span>Copy</span>
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setImage(null);
                                setImagePreview(null);
                                setExtractedText('');
                              }}
                              className="gap-1.5"
                              aria-label="Clear all and start over"
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only sm:not-sr-only">Clear</span>
                            </Button>
                          </div>
                        </div>
                        <div className="p-4 bg-muted/20 rounded-lg border border-border/50 whitespace-pre-wrap font-mono text-sm leading-relaxed overflow-auto max-h-96">
                          {extractedText}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <footer className="border-t py-6 mt-12 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="mb-2">SnapText - Extract text from images with ease</p>
          <p className="text-xs">
            Made with <span className="text-destructive" aria-label="love">♥</span> by Raven
          </p>
        </div>
      </footer>
    </div>
  );
}
