'use client';

import React, { useActionState, startTransition, useState, useEffect } from 'react';
import { sendGAEvent } from '@next/third-parties/google';
import { editFeedItem, FormState } from './actions';
import { Plus, CheckCircle, AlertCircle, FileText, Loader2, Wand2, RefreshCw, UploadCloud, Check, ArrowLeft, Image as ImageIcon, Video, Code, Eye, X, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import imageCompression from 'browser-image-compression';
import MediaUploader, { MediaUploaderRef } from '@/components/admin/MediaUploader';
import { useRef } from 'react';

// Shadcn UI Imports
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CategoryCombobox from '@/components/admin/CategoryCombobox';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { Checkbox } from '@/components/ui/checkbox';

const initialState: FormState = {
  success: false,
  message: '',
};

const generateVideoThumbnails = async (f: File) => [new Blob()];

export default function EditClient({ article }: { article: any }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(editFeedItem, initialState);
  const [isGeneratingThumb, setIsGeneratingThumb] = useState(false);
  
  const [isClient, setIsClient] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  // Existing Media State
  const initialImages = [];
  if (article.imageUrl && article.imageUrl !== 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&q=80') initialImages.push(article.imageUrl);
  if (Array.isArray(article.gallery)) initialImages.push(...article.gallery);
  
  const initialVideos = [];
  if (article.featuredVideo) initialVideos.push(article.featuredVideo);
  if (Array.isArray(article.videoGallery)) initialVideos.push(...article.videoGallery);

  const [existingImages, setExistingImages] = useState<string[]>(initialImages);
  const [existingVideos, setExistingVideos] = useState<string[]>(initialVideos);

  // New Media State
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [featuredIndex, setFeaturedIndex] = useState(0); // Applies to COMBINED array (existing + new)
  
  const [selectedVideoFiles, setSelectedVideoFiles] = useState<File[]>([]);
  const [videoPreviewUrls, setVideoPreviewUrls] = useState<string[]>([]);
  const [featuredVideoIndex, setFeaturedVideoIndex] = useState(0);

  // Computed Combined Media for UI
  const combinedImageUrls = [...existingImages, ...previewUrls];
  const combinedVideoUrls = [...existingVideos, ...videoPreviewUrls];

  // AI & Formatting State
  const [aiProcessing, setAiProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeAdCount, setActiveAdCount] = useState(0);
  useEffect(() => {
    fetch('/api/admin/ads/active-count').then(res => res.json()).then(data => setActiveAdCount(data.count || 0)).catch(console.error);
  }, []);
  const [rawText, setRawText] = useState('');
  
  const [title, setTitle] = useState(article.title || '');
  const [slug, setSlug] = useState(article.slug || '');
  const [excerpt, setExcerpt] = useState(article.excerpt || '');
  const [contentBlocks, setContentBlocks] = useState<string[]>(article.content ? [article.content] : ['']);
  const [categories, setCategories] = useState(Array.isArray(article.categories) ? article.categories.join(', ') : (article.category || ''));
  const [tags, setTags] = useState(Array.isArray(article.tags) ? article.tags.join(', ') : '');
  
  // Handle datetime-local format (YYYY-MM-DDTHH:mm)
  let initialDate: Date | undefined = undefined;
  if (article.publishedAt) {
    initialDate = new Date(article.publishedAt);
  }
  const [publishedDate, setPublishedDate] = React.useState<Date | undefined>(initialDate);
  const [hasCanonical, setHasCanonical] = useState(!!article.canonicalUrl);
  const [canonicalUrl, setCanonicalUrl] = useState(article.canonicalUrl || '');
  const [htmlViewMode, setHtmlViewMode] = useState<'preview' | 'code'>('code');
  const [isBreaking, setIsBreaking] = useState(article.isBreaking || false);
  
  const [syncing, setSyncing] = useState(false);

  const [youtubeUploading, setYoutubeUploading] = useState(false);
  const [youtubeUploadProgress, setYoutubeUploadProgress] = useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleBreakingChange = (checked: boolean) => {
    setIsBreaking(checked);
    if (checked) {
      if (!categories.toLowerCase().includes('breaking news')) {
        setCategories((prev: string) => prev ? prev + ', Breaking News' : 'Breaking News');
      }
    } else {
      setCategories((prev: string) => prev.replace(/,?\s*breaking news/gi, '').replace(/^,\s*/, '').trim());
    }
  };

  const handleCategoriesChange = (newCats: string) => {
    setCategories(newCats);
    setIsBreaking(newCats.toLowerCase().includes('breaking news'));
  };

  useEffect(() => {
    if (state.success) {
      toast.success(state.message || 'Article successfully updated!');
      state.message = '';
      router.push('/admin/articles');
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => {
        setFeaturedIndex(existingImages.length + prev.length); // Auto select the newly uploaded image
        return [...prev, ...files];
      });
      const urls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...urls]);
    }
  };

  const removeExistingImage = (idx: number) => {
    const newArr = [...existingImages];
    newArr.splice(idx, 1);
    setExistingImages(newArr);
    if (featuredIndex >= newArr.length + previewUrls.length) setFeaturedIndex(0);
  };

  const removeNewImage = (idx: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(idx, 1);
    setSelectedFiles(newFiles);
    
    const newUrls = [...previewUrls];
    newUrls.splice(idx, 1);
    setPreviewUrls(newUrls);
    
    if (featuredIndex >= existingImages.length + newUrls.length) setFeaturedIndex(0);
  };

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedVideoFiles(prev => [...prev, ...files]);
      const urls = files.map(file => URL.createObjectURL(file));
      setVideoPreviewUrls(prev => [...prev, ...urls]);

      if (files.length > 0) {
        try {
          const thumbs = await generateVideoThumbnails(files[0]);
          const thumbFiles = thumbs.map((blob, i) => new File([blob], `video-thumb-${i}.jpg`, { type: 'image/jpeg' }));
          
          setSelectedFiles(prev => {
            if (existingImages.length === 0 && prev.length === 0) setFeaturedIndex(0);
            return [...prev, ...thumbFiles];
          });
          const newUrls = thumbFiles.map(file => URL.createObjectURL(file));
          setPreviewUrls(prev => [...prev, ...newUrls]);
        } catch (err) {
          console.error("Thumbnail generation failed on video drop:", err);
        }
      }
    }
  };

  const removeExistingVideo = (idx: number) => {
    const newArr = [...existingVideos];
    newArr.splice(idx, 1);
    setExistingVideos(newArr);
    if (featuredVideoIndex >= newArr.length + videoPreviewUrls.length) setFeaturedVideoIndex(0);
  };

  const removeNewVideo = (idx: number) => {
    const newFiles = [...selectedVideoFiles];
    newFiles.splice(idx, 1);
    setSelectedVideoFiles(newFiles);
    
    const newUrls = [...videoPreviewUrls];
    newUrls.splice(idx, 1);
    setVideoPreviewUrls(newUrls);
    
    if (featuredVideoIndex >= existingVideos.length + newUrls.length) setFeaturedVideoIndex(0);
  };

  const processWithAI = async () => {
    if (!rawText) {
      alert("Please enter raw news content to process.");
      return;
    }
    setAiProcessing(true);
    try {
      const extraImages = Math.max(0, combinedImageUrls.length - 1);
      const extraVideos = combinedVideoUrls.length > 0 ? Math.max(0, combinedVideoUrls.length - 1) : 0;
      const mediaCount = extraImages + extraVideos;
      const targetParagraphCount = mediaCount > 0 ? mediaCount + 1 : 4; 

      const res = await fetch('/api/process-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawText, targetParagraphCount })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (data.title) setTitle(data.title);
      if (data.slug) setSlug(data.slug);
      if (data.excerpt) setExcerpt(data.excerpt);
      
      if (data.content_blocks && Array.isArray(data.content_blocks)) {
        const result = [];
        const aiBlocks = [...data.content_blocks];
        const insertsToWeave: string[] = [];
        for (let i = 0; i < mediaCount; i++) {
          insertsToWeave.push(`<!-- wp:truth/media-placeholder id="${i}" /-->\n<div class="truth-ad-placeholder my-4 p-4 bg-blue-500/10 border border-dashed border-blue-500/50 text-center text-blue-500 font-bold text-xs uppercase tracking-widest rounded-lg">[ MEDIA_PLACEHOLDER_${i} ]</div>`);
        }
          // Add Ad placeholders
          for (let i = 0; i < activeAdCount; i++) {
            const adType = 'leaderboard';
            insertsToWeave.push(`<!-- wp:truth/ad-slot type="${adType}" /-->\n<div class="truth-ad-placeholder my-4 p-4 bg-yellow-500/10 border border-dashed border-yellow-500/50 text-center text-yellow-500 font-bold text-xs uppercase tracking-widest rounded-lg">[ AD_${adType.toUpperCase()} ]</div>`);
          }
        while (aiBlocks.length > 0 || insertsToWeave.length > 0) {
          if (aiBlocks.length > 0) result.push(aiBlocks.shift());
          if (insertsToWeave.length > 0 && aiBlocks.length > 0) { 
            result.push(insertsToWeave.shift());
          } else if (insertsToWeave.length > 0 && aiBlocks.length === 0) {
            result.push(insertsToWeave.shift());
          }
        }
        setContentBlocks(result as string[]);
      } else if (data.content_html) {
        setContentBlocks([data.content_html]);
      }
      
      if (data.categories) setCategories(Array.isArray(data.categories) ? data.categories.join(', ') : data.categories);
      if (data.tags) setTags(Array.isArray(data.tags) ? data.tags.join(', ') : data.tags);
      
      setHtmlViewMode('preview'); 
      
    } catch (err: any) {
      console.error(err);
      alert('AI Processing failed: ' + err.message);
    } finally {
      setAiProcessing(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsGeneratingThumb(true);
    
    const formData = new FormData();
    formData.append('id', article.id);
    formData.append('title', title);
    if (slug) formData.append('slug', slug);
    formData.append('description', excerpt);
    formData.append('content_html', contentBlocks.join('\n\n'));
    formData.append('categories', categories);
    formData.append('tags', tags);
    if (hasCanonical && canonicalUrl) formData.append('link', canonicalUrl);
    if (publishedDate) {
      formData.append('published_at', publishedDate.toISOString());
    }
    formData.append('is_breaking', isBreaking.toString());
    
    formData.append('existing_images', JSON.stringify(existingImages));
    let finalImageFiles = [...selectedFiles];
    let finalFeaturedIndex = featuredIndex;

    // No need to extract thumbnails here, it's done during video upload


    const compressionOptions = {
      maxSizeMB: 0.3,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: 'image/webp',
      initialQuality: 0.8
    };

    const compressedImageFiles = [];
    for (const file of finalImageFiles) {
      try {
        const compressedBlob = await imageCompression(file, compressionOptions);
        const compressedFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, ".webp"), { type: 'image/webp' });
        compressedImageFiles.push(compressedFile);
      } catch (err) {
        console.error('Image compression error:', err);
        compressedImageFiles.push(file);
      }
    }

    setIsUploading(true);
    const newUploadedImageUrls: string[] = [];

    for (let i = 0; i < compressedImageFiles.length; i++) {
      const file = compressedImageFiles[i];
      const fd = new FormData();
      fd.append('file', file);
      try {
        const res = await fetch('/api/media/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.url) {
          newUploadedImageUrls.push(data.url);
        }
      } catch (e) {
        console.error('Image upload failed', e);
      }
    }

    const allGalleryUrls = [...existingImages, ...newUploadedImageUrls];
    const finalFeaturedImage = allGalleryUrls[finalFeaturedIndex] || allGalleryUrls[0] || '';

    formData.append('featured_image', finalFeaturedImage);
    formData.append('gallery', JSON.stringify(allGalleryUrls));
    
    formData.append('existing_videos', JSON.stringify(existingVideos));
    
    let finalYoutubeIds = [...existingVideos];
    let finalFeaturedVideoId = existingVideos[featuredVideoIndex] || null;

    // No videos are uploaded to R2.
    // We mandatorily upload the new featured video to YouTube if one is selected.
    if (selectedVideoFiles.length > 0 && selectedVideoFiles[featuredVideoIndex - existingVideos.length]) {
      setYoutubeUploading(true);
      setYoutubeUploadProgress(0);
      try {
        const videoFile = selectedVideoFiles[featuredVideoIndex - existingVideos.length];
        const resUrl = await fetch('/api/youtube/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description: excerpt, tags: tags.split(',').map((t: string) => t.trim()) })
        });
        const urlData = await resUrl.json();
        if (urlData.uploadUrl) {
          const uploadRes: any = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', urlData.uploadUrl, true);
            xhr.setRequestHeader('Content-Type', videoFile.type);
            
            xhr.upload.onprogress = (e) => {
              if (e.lengthComputable) {
                const percentComplete = Math.round((e.loaded / e.total) * 100);
                setYoutubeUploadProgress(percentComplete);
              }
            };
            
            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                let data = {};
                try {
                  data = xhr.responseText ? JSON.parse(xhr.responseText) : {};
                } catch(e) {}
                resolve({ ok: true, data });
              } else {
                reject(new Error(`Upload failed with status ${xhr.status}`));
              }
            };
            
            xhr.onerror = () => reject(new Error('Network error during upload'));
            xhr.send(videoFile);
          });

          if (uploadRes.ok && uploadRes.data && uploadRes.data.id) {
            const ytId = uploadRes.data.id;
            finalYoutubeIds.push(ytId);
            finalFeaturedVideoId = ytId;
          }
        }
      } catch (err) {
        console.error("YouTube upload failed", err);
      }
      setYoutubeUploading(false);
      setYoutubeUploadProgress(0);
    }
    
    if (finalFeaturedVideoId) {
      formData.append('featured_video_id', finalFeaturedVideoId);
    }
    formData.append('youtube_video_ids', JSON.stringify(finalYoutubeIds));
    
    setIsUploading(false);
    setIsGeneratingThumb(false);
    startTransition(() => {
      formAction(formData);
    });
  };

  if (!isClient) return null;

  const unifiedHtmlPreview = contentBlocks.join('\n\n');

  return (
    <div className="relative min-h-screen bg-transparent pb-24 overflow-x-hidden">
      <div className="fixed top-0 left-1/4 w-150 h-100 bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-0 right-1/4 w-125 h-75 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>



      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-8 md:mt-12 relative">
        <form onSubmit={handleSubmit}>
          {isPreviewMode ? (
            <div className="bg-background rounded-2xl shadow-xl overflow-hidden border border-border min-h-150 pb-32 animate-in fade-in duration-500">
              {(combinedImageUrls.length > 0 || combinedVideoUrls.length > 0) && (
                <div className="w-full aspect-video md:aspect-21/9 bg-muted relative">
                  {combinedVideoUrls.length > 0 ? (
                    <video src={combinedVideoUrls[featuredVideoIndex || 0]} className="w-full h-full object-cover" />
                  ) : (
                    <img src={combinedImageUrls[featuredIndex || 0]} className="w-full h-full object-cover" />
                  )}
                </div>
              )}
              
              <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-20 py-12 md:py-16">
                <div className="flex items-center justify-center gap-4 mb-8">
                  <span className="px-3 py-1 bg-black dark:bg-white/20 text-white text-[10px] tracking-[0.2em] uppercase rounded-sm">
                    {categories.split(',')[0]?.trim() || 'Category'}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-serif font-semibold lg:font-medium tracking-tight mb-5 lg:mb-8 leading-[1.15] text-foreground text-center lg:text-justify">
                  {title || 'Untitled Article Headline'}
                </h1>
                <p className="text-base sm:text-lg lg:text-2xl text-muted-foreground font-serif font-medium leading-snug max-w-4xl mx-auto mb-8 lg:mb-10 italic text-center lg:text-justify">
                  {excerpt || 'This is the article excerpt or summary which appears right beneath the headline...'}
                </p>
                <div className="text-center mb-12">
                  <span className="block text-[10px] font-mono font-bold opacity-40 tracking-widest uppercase text-foreground">
                    Published on {publishedDate ? publishedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div 
                  className="prose prose-base lg:prose-xl dark:prose-invert max-w-none overflow-hidden leading-[1.7] font-medium space-y-8 text-left dark:prose-p:text-zinc-300 dark:prose-headings:text-zinc-100" 
                  dangerouslySetInnerHTML={{ __html: unifiedHtmlPreview || '<p class="text-muted-foreground italic text-center">Article content will render here...</p>' }} 
                />
              </div>
              
              <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-xl border border-border shadow-2xl rounded-full px-2 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 z-50 animate-in slide-in-from-bottom-10 w-max max-w-[95vw] justify-center">
                <Button type="button" variant="ghost" onClick={() => { setIsPreviewMode(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="rounded-full px-4 sm:px-6">
                  <ArrowLeft className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Back to Edit</span><span className="sm:hidden ml-1">Back</span>
                </Button>
                <Button type="submit" disabled={isPending || isUploading} className="rounded-full px-5 sm:px-8 shadow-lg shadow-primary/20">
                  {isPending || isUploading ? (
                    <><Loader2 className="w-4 h-4 sm:mr-2 animate-spin" /> <span className="hidden sm:inline">UPDATING...</span><span className="sm:hidden ml-1">WAIT...</span></>
                  ) : (
                    <><CheckCircle className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">UPDATE ARTICLE</span><span className="sm:hidden ml-1">UPDATE</span></>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 animate-in fade-in duration-500">
              <div className="lg:col-span-5 space-y-8">
                <Card className="relative overflow-hidden group shadow-lg">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/10 transition-all duration-700"></div>
                  <CardHeader className="border-b border-border pb-4">
                    <CardTitle className="flex items-center gap-3 text-sm font-bold tracking-widest uppercase">
                      <div className="p-2 bg-blue-500/10 rounded-lg"><ImageIcon className="w-5 h-5 text-blue-500" /></div>
                      01. Media Assets
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="relative border border-dashed border-border hover:border-blue-500/50 hover:bg-blue-500/5 rounded-xl p-8 text-center cursor-pointer transition-all group">
                      <input type="file" multiple accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <UploadCloud className="w-8 h-8 text-muted-foreground group-hover:text-blue-500 mx-auto mb-3 transition-colors" />
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest group-hover:text-foreground">Drop More Images</p>
                    </div>

                    {combinedImageUrls.length > 0 && (
                      <div className="bg-muted/30 p-4 rounded-xl border border-border">
                        <Label className="text-[10px] text-primary font-bold mb-3 uppercase tracking-widest block">Select Featured Cover</Label>
                        <div className="grid grid-cols-3 gap-3">
                          {combinedImageUrls.map((url, idx) => {
                            const isExisting = idx < existingImages.length;
                            return (
                              <div key={idx} className="relative group/img">
                                <div 
                                  onClick={() => setFeaturedIndex(idx)}
                                  className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden transition-all duration-300 ${featuredIndex === idx ? 'ring-2 ring-primary ring-offset-2 ring-offset-background grayscale-0 scale-105' : 'grayscale opacity-60 hover:opacity-100 hover:grayscale-0'}`}
                                >
                                  <img src={url} alt="Preview" className="object-cover w-full h-full" />
                                  {featuredIndex === idx && (
                                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground p-1 rounded-full shadow-lg">
                                      <Check className="w-3 h-3 font-black" />
                                    </div>
                                  )}
                                </div>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity z-20"
                                  onClick={(e) => { e.stopPropagation(); isExisting ? removeExistingImage(idx) : removeNewImage(idx - existingImages.length); }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="relative border border-dashed border-border hover:border-purple-500/50 hover:bg-purple-500/5 rounded-xl p-8 text-center cursor-pointer transition-all group mt-4">
                      <input type="file" multiple accept="video/*" onChange={handleVideoChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <Video className="w-8 h-8 text-muted-foreground group-hover:text-purple-500 mx-auto mb-3 transition-colors" />
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest group-hover:text-foreground">Drop More Videos</p>
                    </div>
                    
                    {combinedVideoUrls.length > 0 && (
                      <div className="bg-muted/30 p-4 rounded-xl border border-border">
                        <Label className="text-[10px] text-primary font-bold mb-3 uppercase tracking-widest block">Select Featured Video</Label>
                        <div className="grid grid-cols-2 gap-3">
                          {combinedVideoUrls.map((url, idx) => {
                            const isExisting = idx < existingVideos.length;
                            return (
                              <div key={idx} className="relative group/vid">
                                <div 
                                  onClick={() => setFeaturedVideoIndex(idx)}
                                  className={`relative cursor-pointer rounded-lg overflow-hidden transition-all duration-300 ${featuredVideoIndex === idx ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-105' : 'opacity-60 hover:opacity-100'}`}
                                >
                                  <video src={url} className="w-full aspect-video bg-muted object-cover" />
                                  {featuredVideoIndex === idx && (
                                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground p-1 rounded-full shadow-lg">
                                      <Check className="w-3 h-3 font-black" />
                                    </div>
                                  )}
                                </div>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full opacity-0 group-hover/vid:opacity-100 transition-opacity z-20"
                                  onClick={(e) => { e.stopPropagation(); isExisting ? removeExistingVideo(idx) : removeNewVideo(idx - existingVideos.length); }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                        

                      </div>
                    )}
                  </CardContent>
                </Card>



                <Card className="shadow-lg mb-6 border-red-500/20 bg-red-500/5">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${isBreaking ? 'bg-red-500 animate-pulse' : 'bg-muted-foreground'}`} />
                      <Label htmlFor="breaking-toggle" className="font-bold text-sm tracking-widest uppercase cursor-pointer">
                        Mark as Breaking News
                      </Label>
                    </div>
                    <Checkbox 
                      id="breaking-toggle" 
                      checked={isBreaking} 
                      onCheckedChange={handleBreakingChange} 
                      className={`w-6 h-6 rounded-full border-2 ${isBreaking ? 'data-[state=checked]:bg-red-500 data-[state=checked]:text-white border-red-500' : ''}`}
                    />
                  </CardContent>
                </Card>

                <Card className="shadow-lg">
                  <CardHeader><CardTitle className="text-[10px] text-muted-foreground uppercase tracking-widest">Optional Parameters</CardTitle></CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] text-muted-foreground uppercase tracking-widest">Publishing Time</Label>
                      <DateTimePicker value={publishedDate} onChange={setPublishedDate} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="canonical" checked={hasCanonical} onCheckedChange={(checked) => setHasCanonical(!!checked)} />
                        <label
                          htmlFor="canonical"
                          className="text-[10px] font-bold leading-none text-muted-foreground uppercase tracking-widest cursor-pointer"
                        >
                          Add Canonical Link?
                        </label>
                      </div>
                      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${hasCanonical ? 'max-h-24 opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'}`}>
                        <div className="space-y-2">
                          <Label className="text-[10px] text-muted-foreground uppercase tracking-widest">Canonical URL</Label>
                          <Input type="url" value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)} placeholder="https://..." />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-7">
                <Card className="shadow-2xl lg:sticky lg:top-24 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
                  <CardHeader className="border-b border-border pb-4">
                    <CardTitle className="flex items-center gap-3 text-sm font-bold tracking-widest uppercase">
                      <div className="p-2 bg-emerald-500/10 rounded-lg"><CheckCircle className="w-5 h-5 text-emerald-500" /></div>
                      02. Final Review
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-8 space-y-8 relative z-10">
                    <div>
                      <Textarea required value={title} onChange={(e) => setTitle(e.target.value)} rows={2} placeholder="ENTER HEADLINE..." className="w-full bg-transparent border-b-2 border-border focus:border-primary px-0 py-3 text-2xl md:text-3xl font-bold text-foreground outline-none transition-all placeholder:text-muted-foreground resize-none overflow-hidden leading-relaxed" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] text-primary uppercase tracking-widest block mb-1">Permalink / Slug (English)</Label>
                      <div className="flex items-center h-8 w-full rounded-lg border border-input bg-muted/30 px-2.5 text-sm transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 overflow-hidden">
                        <span className="text-muted-foreground font-mono text-xs sm:text-sm select-none whitespace-nowrap pointer-events-none hidden sm:inline">jharkhandexpress.com/article/</span>
                        <span className="text-muted-foreground font-mono text-xs select-none whitespace-nowrap pointer-events-none sm:hidden">.../</span>
                        <input type="text" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'))} placeholder="english-article-slug" className="w-full bg-transparent border-none outline-none font-mono text-sm placeholder:text-muted-foreground min-w-0" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] text-primary uppercase tracking-widest block mb-1">Categories</Label>
                        <CategoryCombobox value={categories} onChange={handleCategoriesChange} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] text-primary uppercase tracking-widest">Tags</Label>
                        <Textarea value={tags} onChange={(e) => setTags(e.target.value)} rows={2} className="bg-muted/30 resize-none overflow-hidden leading-relaxed" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] text-primary uppercase tracking-widest">Excerpt</Label>
                      <Textarea required rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="bg-muted/30 resize-none" />
                    </div>

                    <div className="space-y-3">
                      <Tabs value={htmlViewMode} onValueChange={(v) => setHtmlViewMode(v as any)} className="w-full">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-[10px] text-muted-foreground uppercase tracking-widest">Article Body</Label>
                          <TabsList>
                            <TabsTrigger value="preview" className="text-[10px] font-bold uppercase tracking-widest flex gap-1.5"><Eye className="w-3 h-3" /> Preview</TabsTrigger>
                            <TabsTrigger value="code" className="text-[10px] font-bold uppercase tracking-widest flex gap-1.5"><Code className="w-3 h-3" /> Code</TabsTrigger>
                          </TabsList>
                        </div>
                        <TabsContent value="code" className="space-y-2">
                          {contentBlocks.map((block, idx) => (
                            <div key={idx} className="relative group animate-in fade-in">
                              <Label className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1 block">Block {idx + 1}</Label>
                              <Textarea required value={block} onChange={(e) => { const newBlocks = [...contentBlocks]; newBlocks[idx] = e.target.value; setContentBlocks(newBlocks); }} className="font-mono text-xs leading-relaxed bg-muted/30 resize-y min-h-75 shadow-inner" />
                            </div>
                          ))}
                        </TabsContent>
                        <TabsContent value="preview">
                          <div className="w-full bg-background text-foreground rounded-md p-6 text-sm min-h-75 overflow-y-auto prose prose-sm max-w-none shadow-inner border border-border">
                            {unifiedHtmlPreview ? <div dangerouslySetInnerHTML={{ __html: unifiedHtmlPreview }} /> : <div className="h-full flex flex-col items-center justify-center text-muted-foreground italic mt-20"><Eye className="w-8 h-8 mb-2 opacity-50" /><p>Output preview will render here.</p></div>}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-6">
                      <Button type="submit" size="lg" disabled={isPending || isUploading} className="flex-1 py-6 relative overflow-hidden">
                        {youtubeUploading && (
                           <div className="absolute left-0 top-0 bottom-0 bg-primary/20 transition-all duration-300" style={{ width: `${youtubeUploadProgress}%` }} />
                        )}
                        <div className="relative z-10 flex items-center justify-center">
                          {isPending || isGeneratingThumb || youtubeUploading ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> {isGeneratingThumb ? 'PROCESSING...' : youtubeUploading ? `UPLOADING TO YOUTUBE ${youtubeUploadProgress}%` : 'UPDATING...'}</> : <><CheckCircle className="w-5 h-5 mr-2" /> UPDATE</>}
                        </div>
                      </Button>
                      <Button type="button" size="lg" variant="outline" className="flex-1 py-6 border-border" onClick={() => { setIsPreviewMode(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                        <Eye className="w-5 h-5 mr-2" /> PREVIEW
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
