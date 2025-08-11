'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Camera, Upload, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PhotoAnalysisResult } from '@/lib/types/database'

interface PhotoUploadProps {
  onPhotoAnalyzed: (result: PhotoAnalysisResult) => void
  onUpload: (file: File) => Promise<PhotoAnalysisResult>
  isProcessing: boolean
  className?: string
}

export function PhotoUpload({ 
  onPhotoAnalyzed, 
  onUpload, 
  isProcessing, 
  className 
}: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Show preview
    const previewUrl = URL.createObjectURL(file)
    setPreview(previewUrl)

    try {
      const result = await onUpload(file)
      onPhotoAnalyzed(result)
    } catch (error) {
      console.error('Upload failed:', error)
      setPreview(null)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const clearPreview = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {!preview ? (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${dragActive ? 'border-purple-400 bg-purple-50' : 'border-gray-300'}
            ${isProcessing ? 'opacity-50 pointer-events-none' : 'hover:border-gray-400'}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              {isProcessing ? (
                <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
              ) : (
                <Camera className="h-8 w-8 text-gray-400" />
              )}
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Upload a photo of your marble run pieces
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Our AI will automatically identify and count the pieces in your photo
              </p>
            </div>

            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Choose File</span>
              </Button>

              <Button
                onClick={() => {
                  // In a real app, this would trigger camera access
                  fileInputRef.current?.click()
                }}
                disabled={isProcessing}
                className="flex items-center space-x-2"
              >
                <Camera className="h-4 w-4" />
                <span>Take Photo</span>
              </Button>
            </div>

            <p className="text-xs text-gray-400">
              Drag and drop an image or click to browse
            </p>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="relative rounded-lg overflow-hidden">
            <Image
              src={preview}
              alt="Preview"
              width={400}
              height={256}
              className="w-full h-64 object-cover"
            />
            
            {isProcessing && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-4 flex items-center space-x-3">
                  <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                  <span className="text-sm font-medium">
                    Analyzing pieces...
                  </span>
                </div>
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={clearPreview}
            className="absolute top-2 right-2 h-8 w-8 p-0"
            disabled={isProcessing}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Upload tips */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          📸 Tips for better recognition:
        </h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Spread pieces out so they don&apos;t overlap</li>
          <li>• Use good lighting and avoid shadows</li>
          <li>• Include a reference object for scale (coin, ruler)</li>
          <li>• Take photos from directly above when possible</li>
          <li>• Clean pieces for better color recognition</li>
        </ul>
      </div>
    </div>
  )
}