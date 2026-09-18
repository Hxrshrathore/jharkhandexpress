'use client';

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { UploadCloud, CheckCircle, Image as ImageIcon, Video, X, Check } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import imageCompression from 'browser-image-compression';

export interface MediaUploadResult {
  images: string[];
  youtubeVideoIds: string[];
  featuredImage: string;
  featuredVideoId: string;
  featuredVideoTimestamp: string;
}

export interface MediaUploaderRef {
  uploadAll: () => Promise<MediaUploadResult>;
  getTotalMediaCount: () => number;
}

interface Frame {
  blob: Blob;
  timestamp: string;
  url: string;
}

const MediaUploader = forwardRef<MediaUploaderRef, {}>((props, ref) => {
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [featuredImageIndex, setFeaturedImageIndex] = useState<number | null>(null);

  const [videos, setVideos] = useState<{ file: File; preview: string }[]>([]);
  const [featuredVideoIndex, setFeaturedVideoIndex] = useState<number | null>(null);
  
  // Mapping video index to its extracted frames
  const [videoFrames, setVideoFrames] = useState<{ [videoIndex: number]: Frame[] }>({});
  
  // Mapping video index to an array of selected frame indices (for non-featured videos to upload to R2)
  const [selectedFrames, setSelectedFrames] = useState<{ [videoIndex: number]: number[] }>({});
  
  // Selected timestamp for the featured video
  const [featuredVideoTimestamp, setFeaturedVideoTimestamp] = useState<string | null>(null);
  const [featuredVideoFrameIndex, setFeaturedVideoFrameIndex] = useState<number | null>(null);

  const [progressMap, setProgressMap] = useState<{ [key: string]: number }>({});
  const [isUploading, setIsUploading] = useState(false);

  useImperativeHandle(ref, () => ({
    uploadAll: async () => {
      setIsUploading(true);
      try {
        const imagesToUpload: { file: File, isFeatured: boolean }[] = [];
        
        // 1. Add explicitly selected images
        images.forEach((img, idx) => {
           imagesToUpload.push({ file: img.file, isFeatured: idx === featuredImageIndex });
        });

        // 2. Add ticked video frames (only for NON-featured videos)
        Object.keys(selectedFrames).forEach((vIdxStr) => {
           const vIdx = parseInt(vIdxStr);
           if (vIdx === featuredVideoIndex) return; // Featured video frame is just for the hover-to-play, not R2 gallery (unless we want it? We don't)
           const frames = videoFrames[vIdx] || [];
           const tickedIndices = selectedFrames[vIdx] || [];
           
           tickedIndices.forEach(fIdx => {
             const frame = frames[fIdx];
             const safeName = videos[vIdx].file.name.replace(/[^a-zA-Z0-9.-]/g, '');
             const fileName = `thumb-${frame.timestamp}-${safeName}.jpg`;
             imagesToUpload.push({ file: new File([frame.blob], fileName, { type: 'image/jpeg' }), isFeatured: false });
           });
        });

        const uploadedImageUrls: string[] = [];
        let finalFeaturedImage = '';

        // Upload images to R2
        for (let i = 0; i < imagesToUpload.length; i++) {
          const item = imagesToUpload[i];
          const key = `img-${i}`;
          setProgressMap(p => ({ ...p, [key]: 10 }));
          
          let compressedFile = item.file;
          if (item.file.size > 1024 * 1024) {
            try {
              compressedFile = await imageCompression(item.file, { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true });
            } catch (e) { console.error('Compression failed', e); }
          }

          const fd = new FormData();
          fd.append('file', compressedFile);

          const res = await fetch('/api/media/upload', { method: 'POST', body: fd });
          const data = await res.json();
          if (data.url) {
            uploadedImageUrls.push(data.url);
            if (item.isFeatured) finalFeaturedImage = data.url;
          }
          setProgressMap(p => ({ ...p, [key]: 100 }));
        }

        const youtubeVideoIds: string[] = [];
        let finalFeaturedVideoId = '';

        // Upload videos to YouTube via XHR
        for (let i = 0; i < videos.length; i++) {
          const file = videos[i].file;
          const key = `vid-${i}`;
          
          const fd = new FormData();
          fd.append('video_file', file);
          fd.append('title', file.name);

          const videoId = await new Promise<string>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/api/youtube/upload', true);
            xhr.upload.onprogress = (e) => {
              if (e.lengthComputable) {
                setProgressMap(p => ({ ...p, [key]: Math.round((e.loaded / e.total) * 100) }));
              }
            };
            xhr.onload = () => {
              if (xhr.status === 200) {
                try {
                  const data = JSON.parse(xhr.responseText);
                  if (data.videoId) resolve(data.videoId);
                  else reject(new Error('No video ID'));
                } catch(err) { reject(err); }
              } else reject(new Error('Upload failed'));
            };
            xhr.onerror = () => reject(new Error('Network error'));
            xhr.send(fd);
          });

          youtubeVideoIds.push(videoId);
          if (i === featuredVideoIndex) {
            finalFeaturedVideoId = videoId;
          }
        }

        return {
          images: uploadedImageUrls,
          youtubeVideoIds,
          featuredImage: finalFeaturedImage,
          featuredVideoId: finalFeaturedVideoId,
          featuredVideoTimestamp: featuredVideoTimestamp || ''
        };
      } finally {
        setIsUploading(false);
      }
    },
    getTotalMediaCount: () => {
       let count = images.length + videos.length;
       Object.keys(selectedFrames).forEach(vIdx => {
         if (parseInt(vIdx) !== featuredVideoIndex) {
            count += (selectedFrames[parseInt(vIdx)] || []).length;
         }
       });
       // Subtract featured items since they usually occupy their own top spots, but we just want total insertions
       // We'll just return the exact count to insert
       return count;
    }
  }));

  const extractFrames = async (file: File): Promise<Frame[]> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.style.display = 'none';
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';
      document.body.appendChild(video);

      const frames: Frame[] = [];
      const fractions = [0.25, 0.5, 0.75];
      let idx = 0;

      const cleanup = () => {
        URL.revokeObjectURL(video.src);
        video.remove();
      };

      video.onloadeddata = () => {
        if (video.duration > 0) {
          video.currentTime = Math.max(0.1, video.duration * fractions[idx]);
        } else {
          video.currentTime = 0.1;
        }
      };

      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 1280;
          canvas.height = video.videoHeight || 720;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
              if (blob) {
                const m = Math.floor(video.currentTime / 60);
                const s = Math.floor(video.currentTime % 60);
                frames.push({ blob, timestamp: `${m}m${s}s`, url: URL.createObjectURL(blob) });
              }
              idx++;
              if (idx < fractions.length && video.duration > 0) {
                video.currentTime = Math.max(0.1, video.duration * fractions[idx]);
              } else {
                cleanup();
                resolve(frames);
              }
            }, 'image/jpeg', 0.85);
          }
        } catch (e) { cleanup(); resolve(frames); }
      };

      video.onerror = () => { cleanup(); resolve(frames); };
      video.src = URL.createObjectURL(file);
      video.load();
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 6 - images.length);
      const newImages = files.map(f => ({ file: f, preview: URL.createObjectURL(f) }));
      setImages(prev => {
        if (prev.length === 0 && featuredImageIndex === null) setFeaturedImageIndex(0);
        return [...prev, ...newImages];
      });
    }
  };

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 6 - videos.length);
      const newVideos = files.map(f => ({ file: f, preview: URL.createObjectURL(f) }));
      
      const currentVideosLength = videos.length;
      
      setVideos(prev => {
        if (prev.length === 0 && featuredVideoIndex === null) setFeaturedVideoIndex(0);
        return [...prev, ...newVideos];
      });

      // Extract frames
      for (let i = 0; i < files.length; i++) {
        const vIdx = currentVideosLength + i;
        const frames = await extractFrames(files[i]);
        setVideoFrames(prev => ({ ...prev, [vIdx]: frames }));
        // Default check all frames
        setSelectedFrames(prev => ({ ...prev, [vIdx]: frames.map((_, idx) => idx) }));
      }
    }
  };

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    if (featuredImageIndex === idx) setFeaturedImageIndex(null);
  };

  const removeVideo = (idx: number) => {
    setVideos(prev => prev.filter((_, i) => i !== idx));
    if (featuredVideoIndex === idx) setFeaturedVideoIndex(null);
  };

  const toggleFrameSelection = (vIdx: number, fIdx: number) => {
    setSelectedFrames(prev => {
      const current = prev[vIdx] || [];
      if (current.includes(fIdx)) {
        return { ...prev, [vIdx]: current.filter(i => i !== fIdx) };
      }
      return { ...prev, [vIdx]: [...current, fIdx] };
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {/* IMAGE UPLOAD */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 relative flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
          <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" disabled={isUploading || images.length >= 6} />
          <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm font-medium text-gray-700">Drop Images</p>
          <p className="text-xs text-gray-500">Supported formats: JPG, PNG, WEBP, GIF (Max 6)</p>
        </div>
        
        {/* VIDEO UPLOAD */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 relative flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
          <input type="file" multiple accept="video/mp4,video/webm" onChange={handleVideoChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" disabled={isUploading || videos.length >= 6} />
          <Video className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm font-medium text-gray-700">Drop Videos</p>
          <p className="text-xs text-gray-500">Supported formats: MP4, WEBM (Max 6)</p>
        </div>
      </div>

      {/* RENDER IMAGES */}
      {images.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Images ({images.length}/6)</h4>
          <div className="grid grid-cols-3 gap-4">
            {images.map((img, i) => (
              <div key={i} className="relative group rounded border overflow-hidden">
                <img src={img.preview} className="w-full h-32 object-cover" />
                <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <X className="h-4 w-4" />
                </button>
                <div 
                  onClick={() => setFeaturedImageIndex(i)} 
                  className={`absolute top-1 left-1 rounded-full p-1 cursor-pointer z-20 transition-colors ${featuredImageIndex === i ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600 opacity-0 group-hover:opacity-100'}`}
                >
                  <CheckCircle className="h-5 w-5" />
                </div>
                {isUploading && progressMap[`img-${i}`] !== undefined && (
                  <Progress value={progressMap[`img-${i}`]} className="h-2 w-full absolute bottom-0 left-0 rounded-none" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RENDER VIDEOS */}
      {videos.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold">Videos ({videos.length}/6)</h4>
          {videos.map((vid, vIdx) => (
            <div key={vIdx} className={`border p-4 rounded-lg space-y-3 ${featuredVideoIndex === vIdx ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    onClick={() => setFeaturedVideoIndex(vIdx)} 
                    className={`rounded-full p-1 cursor-pointer transition-colors ${featuredVideoIndex === vIdx ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-blue-200'}`}
                    title="Set as Featured Video"
                  >
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{vid.file.name}</p>
                    <p className="text-xs text-gray-500">{(vid.file.size / (1024*1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <button type="button" onClick={() => removeVideo(vIdx)} className="text-red-500 hover:text-red-700"><X className="h-5 w-5" /></button>
              </div>

              {/* Progress Bar */}
              {isUploading && progressMap[`vid-${vIdx}`] !== undefined && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>YouTube Upload</span>
                    <span>{progressMap[`vid-${vIdx}`]}%</span>
                  </div>
                  <Progress value={progressMap[`vid-${vIdx}`]} className="h-2" />
                </div>
              )}

              {/* Frames Selection */}
              {videoFrames[vIdx] && (
                <div className="mt-4">
                  <p className="text-xs font-semibold mb-2">
                    {featuredVideoIndex === vIdx ? 'Select exactly ONE frame for Hover-to-Play Thumbnail:' : 'Select generated frames to keep in article gallery:'}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {videoFrames[vIdx].map((frame, fIdx) => {
                      const isFeaturedVideo = featuredVideoIndex === vIdx;
                      const isSelected = isFeaturedVideo 
                          ? featuredVideoFrameIndex === fIdx 
                          : (selectedFrames[vIdx] || []).includes(fIdx);

                      return (
                        <div key={fIdx} className="relative group cursor-pointer border rounded overflow-hidden"
                          onClick={() => {
                            if (isFeaturedVideo) {
                              setFeaturedVideoFrameIndex(fIdx);
                              setFeaturedVideoTimestamp(frame.timestamp);
                            } else {
                              toggleFrameSelection(vIdx, fIdx);
                            }
                          }}
                        >
                          <img src={frame.url} className={`w-full h-24 object-cover ${isSelected ? 'opacity-100' : 'opacity-60 grayscale'}`} />
                          <div className={`absolute top-1 right-1 rounded-full p-0.5 ${isSelected ? (isFeaturedVideo ? 'bg-blue-500' : 'bg-green-500') : 'bg-gray-300'}`}>
                            <Check className="h-4 w-4 text-white" />
                          </div>
                          <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1 rounded">
                            {frame.timestamp}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

MediaUploader.displayName = 'MediaUploader';
export default MediaUploader;
