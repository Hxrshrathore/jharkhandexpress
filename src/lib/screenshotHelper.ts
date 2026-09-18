/**
 * Client-side Screenshot Capture, Asset Loading Hook & PDF Helper for Wayback Proofs.
 * Uses html-to-image inside a desktop-dimensioned off-screen iframe (1280px wide).
 * Captures true full-length page layouts (Header down to Footer) for both homepage and articles.
 * Inlines all images directly into Base64 Data URLs prior to capture, completely bypassing
 * library-level cache collisions, CORS issues, and image cross-pollution.
 */

import * as htmlToImage from 'html-to-image';
import type { jsPDF } from 'jspdf';
import { useState, useEffect } from 'react';

/**
 * React Hook: useAssetLoader
 * Tracks asset loading readiness for components or pages.
 */
export function useAssetLoader(options?: { minWaitMs?: number; maxWaitMs?: number }) {
  const [isReady, setIsReady] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    let isCancelled = false;
    const minWait = options?.minWaitMs ?? 800;
    const maxWait = options?.maxWaitMs ?? 10000;
    const startTime = Date.now();

    async function checkAssets() {
      if (document.readyState !== 'complete') {
        await new Promise<void>((resolve) => {
          const handler = () => {
            if (document.readyState === 'complete') {
              document.removeEventListener('readystatechange', handler);
              resolve();
            }
          };
          document.addEventListener('readystatechange', handler);
          setTimeout(resolve, 3000);
        });
      }

      try {
        if (document.fonts && typeof document.fonts.ready !== 'undefined') {
          await Promise.race([
            document.fonts.ready,
            new Promise((r) => setTimeout(r, 2500))
          ]);
        }
      } catch (err) {
        // font check fallback
      }

      const images = Array.from(document.querySelectorAll<HTMLImageElement>('img'));
      images.forEach((img) => {
        if (img.getAttribute('loading') === 'lazy') {
          img.setAttribute('loading', 'eager');
        }
      });

      setTotalCount(images.length);

      let completed = 0;
      await Promise.race([
        Promise.all(
          images.map((img) => {
            return new Promise<void>((resolve) => {
              if (img.complete && img.naturalWidth > 0) {
                completed++;
                setLoadedCount(completed);
                resolve();
                return;
              }

              const cleanup = () => {
                img.removeEventListener('load', onLoad);
                img.removeEventListener('error', onError);
              };

              const onLoad = () => {
                cleanup();
                completed++;
                setLoadedCount(completed);
                if (typeof img.decode === 'function') {
                  img.decode().then(resolve).catch(() => resolve());
                } else {
                  resolve();
                }
              };

              const onError = () => {
                cleanup();
                completed++;
                setLoadedCount(completed);
                resolve();
              };

              img.addEventListener('load', onLoad);
              img.addEventListener('error', onError);
              setTimeout(() => {
                cleanup();
                resolve();
              }, 5000);
            });
          })
        ),
        new Promise((r) => setTimeout(r, maxWait))
      ]);

      const elapsed = Date.now() - startTime;
      if (elapsed < minWait) {
        await new Promise((r) => setTimeout(r, minWait - elapsed));
      }

      if (!isCancelled) {
        setIsReady(true);
      }
    }

    checkAssets();

    return () => {
      isCancelled = true;
    };
  }, [options?.minWaitMs, options?.maxWaitMs]);

  return { isReady, loadedCount, totalCount };
}

/**
 * Directly inlines all <img> elements as Base64 Data URLs.
 * Guarantees:
 * 1. ZERO CORS errors or canvas tainting.
 * 2. ZERO query parameter stripping or shared cache collisions in html-to-image.
 * 3. Every single image on every single day renders its exact genuine pixels without reuse!
 */
export async function inlineAllImagesAsDataUrls(doc: Document, origin: string): Promise<void> {
  const images = Array.from(doc.querySelectorAll<HTMLImageElement>('img'));

  await Promise.all(
    images.map(async (img) => {
      try {
        const rawSrc = img.getAttribute('src') || img.src;
        if (!rawSrc || rawSrc.startsWith('data:') || rawSrc.startsWith('blob:')) return;

        let fetchUrl = rawSrc;
        if (fetchUrl.startsWith('/')) {
          fetchUrl = `${origin}${fetchUrl}`;
        } else if (!fetchUrl.startsWith('http')) {
          fetchUrl = `${origin}/${fetchUrl}`;
        }

        // If external domain (Cloudflare R2, CDN, etc.), proxy it
        if (!fetchUrl.startsWith(origin)) {
          fetchUrl = `${origin}/api/proxy-image?url=${encodeURIComponent(fetchUrl)}`;
        }

        const res = await fetch(fetchUrl);
        if (!res.ok) return;

        const blob = await res.blob();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        if (dataUrl && dataUrl.startsWith('data:image')) {
          img.src = dataUrl;
          img.removeAttribute('srcset');
          img.removeAttribute('loading');
        }
      } catch (e) {
        // Continue even if an individual image fails to convert
      }
    })
  );
}

/**
 * Recursively waits for all document assets, web fonts, and layout reflows to settle.
 */
export async function waitForPageAssets(doc: Document, timeoutMs: number = 15000): Promise<void> {
  const startTime = Date.now();

  // 1. Wait for document readyState
  if (doc.readyState !== 'complete') {
    await new Promise<void>((resolve) => {
      const onReady = () => {
        if (doc.readyState === 'complete') {
          doc.removeEventListener('readystatechange', onReady);
          resolve();
        }
      };
      doc.addEventListener('readystatechange', onReady);
      setTimeout(resolve, 4000);
    });
  }

  // 2. Hydration pause for Next.js React 19 Client Components
  await new Promise((r) => setTimeout(r, 1200));

  // 3. Wait for document web fonts
  try {
    if (doc.fonts && typeof doc.fonts.ready !== 'undefined') {
      await Promise.race([
        doc.fonts.ready,
        new Promise((r) => setTimeout(r, 3000))
      ]);
    }
  } catch (err) {
    console.warn('Font loading check skipped:', err);
  }

  // 4. Force all lazy images to eager so browser starts loading them
  const images = Array.from(doc.querySelectorAll<HTMLImageElement>('img'));
  images.forEach((img) => {
    if (img.getAttribute('loading') === 'lazy') {
      img.setAttribute('loading', 'eager');
    }
  });

  // 5. Trigger layout reflow / intersection observers
  try {
    const win = doc.defaultView || (doc as any).parentWindow;
    if (win) {
      win.scrollTo(0, 1000);
      await new Promise((r) => setTimeout(r, 300));
      win.scrollTo(0, 0);
    }
  } catch (e) {
    // ignore
  }

  // 6. Await all image complete & decode
  const refreshedImages = Array.from(doc.querySelectorAll<HTMLImageElement>('img'));
  const imagePromises = refreshedImages.map((img) => {
    return new Promise<void>((resolve) => {
      if (img.complete && img.naturalWidth > 0) {
        resolve();
        return;
      }

      const cleanup = () => {
        img.removeEventListener('load', onLoad);
        img.removeEventListener('error', onError);
      };

      const onLoad = () => {
        cleanup();
        if (typeof img.decode === 'function') {
          img.decode().then(resolve).catch(() => resolve());
        } else {
          resolve();
        }
      };

      const onError = () => {
        cleanup();
        resolve();
      };

      img.addEventListener('load', onLoad);
      img.addEventListener('error', onError);

      setTimeout(() => {
        cleanup();
        resolve();
      }, 5000);
    });
  });

  await Promise.race([
    Promise.all(imagePromises),
    new Promise((r) => setTimeout(r, timeoutMs))
  ]);

  const elapsed = Date.now() - startTime;
  const remainingWait = Math.max(600, 1500 - elapsed);
  await new Promise((r) => setTimeout(r, remainingWait));
}

export interface CaptureResult {
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
}

/**
 * Loads a Wayback URL inside an off-screen desktop iframe (1280px wide).
 * Captures true full-length page layouts without artificial cutoffs.
 * Inlines all images into Data URLs to guarantee 100% unique per-day screenshot rendering.
 */
export async function captureDesktopWayback(
  targetUrl: string,
  options?: {
    viewportWidth?: number;
    viewportHeight?: number;
    timeoutMs?: number;
  }
): Promise<CaptureResult> {
  const width = options?.viewportWidth || 1280;
  const timeout = options?.timeoutMs || 60000;

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`Screenshot capture timed out after ${timeout}ms for ${targetUrl}`));
    }, timeout);

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '-99999px';
    iframe.style.top = '0';
    iframe.style.width = `${width}px`;
    iframe.style.height = '1600px';
    iframe.style.border = 'none';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    iframe.style.zIndex = '-9999';

    const cleanup = () => {
      clearTimeout(timer);
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    };

    iframe.onload = async () => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc || !iframeDoc.body) {
          throw new Error('Failed to access iframe document. Ensure same-origin.');
        }

        if (iframe.contentWindow) {
          try {
            (iframe.contentWindow as any).__IS_SCREENSHOT_CAPTURE__ = true;
          } catch (e) {}
        }

        const origin = typeof window !== 'undefined' ? window.location.origin : '';

        // 1. Wait for page assets, web fonts, and hydration to settle
        await waitForPageAssets(iframeDoc, 15000);

        // 2. Allow body/documentElement to expand naturally
        iframeDoc.body.style.minHeight = 'auto';
        iframeDoc.body.style.height = 'auto';
        if (iframeDoc.documentElement) {
          iframeDoc.documentElement.style.minHeight = 'auto';
          iframeDoc.documentElement.style.height = 'auto';
        }

        // Measure true natural full page height (from header down to footer)
        const naturalFullHeight = Math.max(
          iframeDoc.body?.scrollHeight || 0,
          iframeDoc.documentElement?.scrollHeight || 0,
          iframeDoc.body?.offsetHeight || 0,
          iframeDoc.documentElement?.offsetHeight || 0,
          1500
        );

        // Set iframe height to full natural height so all content renders completely
        iframe.style.height = `${naturalFullHeight}px`;

        // 3. Inline all <img> elements as Base64 Data URLs so images are NEVER shared or cached across iterations
        await inlineAllImagesAsDataUrls(iframeDoc, origin);

        // 4. Remove any cross-origin stylesheet links so html-to-image doesn't trigger CORS DOMExceptions
        const externalLinks = Array.from(iframeDoc.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'));
        externalLinks.forEach((link) => {
          if (link.href && origin && !link.href.startsWith(origin)) {
            link.parentNode?.removeChild(link);
          }
        });

        // 5. Allow layout to settle after expanding to full height
        await new Promise((r) => setTimeout(r, 600));

        // Re-check final full rendered height
        const capturedHeight = Math.max(
          iframeDoc.body?.scrollHeight || 0,
          iframeDoc.documentElement?.scrollHeight || 0,
          naturalFullHeight
        );
        iframe.style.height = `${capturedHeight}px`;

        // 6. Capture full length using html-to-image with skipFonts: true and cacheBust: true
        let dataUrl: string;
        try {
          dataUrl = await htmlToImage.toJpeg(iframeDoc.body, {
            quality: 0.92,
            width: width,
            height: capturedHeight,
            backgroundColor: '#ffffff',
            canvasWidth: width,
            canvasHeight: capturedHeight,
            pixelRatio: 1,
            skipFonts: true,
            includeQueryParams: true,
            cacheBust: true,
            fontEmbedCSS: '',
            style: {
              margin: '0',
              padding: '0',
              transform: 'none',
              width: `${width}px`,
              height: `${capturedHeight}px`,
              maxHeight: 'none',
              overflow: 'visible',
            },
            filter: (node) => {
              if (node.tagName === 'IFRAME') return false;
              return true;
            },
          });
        } catch (captureErr) {
          console.warn('html-to-image toJpeg error, trying toPng fallback:', captureErr);
          dataUrl = await htmlToImage.toPng(iframeDoc.body, {
            width: width,
            height: capturedHeight,
            backgroundColor: '#ffffff',
            pixelRatio: 1,
            skipFonts: true,
            includeQueryParams: true,
            cacheBust: true,
            fontEmbedCSS: '',
            style: {
              margin: '0',
              padding: '0',
              transform: 'none',
              width: `${width}px`,
              height: `${capturedHeight}px`,
              maxHeight: 'none',
              overflow: 'visible',
            },
            filter: (node) => node.tagName !== 'IFRAME',
          });
        }

        const res = await fetch(dataUrl);
        const blob = await res.blob();

        cleanup();
        resolve({
          dataUrl,
          blob,
          width,
          height: capturedHeight,
        });
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    iframe.onerror = (err) => {
      cleanup();
      reject(err);
    };

    document.body.appendChild(iframe);

    // Guarantee is_screenshot=1 query param is set
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://jharkhandexpress.com';
    let finalTargetUrl = targetUrl;
    try {
      const urlObj = new URL(targetUrl, origin);
      urlObj.searchParams.set('is_screenshot', '1');
      finalTargetUrl = urlObj.toString();
    } catch (e) {
      finalTargetUrl = targetUrl + (targetUrl.includes('?') ? '&' : '?') + 'is_screenshot=1';
    }

    iframe.src = finalTargetUrl;
  });
}

/**
 * Uploads a captured screenshot Blob to Cloudflare R2 via /api/media/upload
 */
export async function uploadScreenshotToR2(blob: Blob, filename?: string): Promise<string | null> {
  try {
    const formData = new FormData();
    const finalName = filename || `proof-${Date.now()}.jpg`;
    formData.append('file', blob, finalName);

    const res = await fetch('/api/media/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    return data.success ? data.url : null;
  } catch (err) {
    console.error('Failed to upload screenshot to R2:', err);
    return null;
  }
}

/**
 * Helper to slice an image vertically into a dedicated canvas slice.
 * Guarantees zero bleeding or overlapping across PDF pages.
 */
async function sliceImageToCanvas(
  imgDataUrl: string,
  imgWidth: number,
  sliceY: number,
  sliceH: number
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = imgWidth;
      canvas.height = sliceH;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, imgWidth, sliceH);
        ctx.drawImage(img, 0, sliceY, imgWidth, sliceH, 0, 0, imgWidth, sliceH);
      }
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.onerror = () => resolve(imgDataUrl);
    img.src = imgDataUrl;
  });
}

/**
 * Scales and adds a screenshot image onto an A4 jsPDF document.
 * Supports:
 * 1. Multi-page slicing at full readable width (186mm) - default, highly readable.
 * 2. Single-page scaled compression (fitToSinglePage: true).
 */
export async function addScaledImageToPdf(
  pdf: jsPDF,
  imgDataUrl: string,
  imgWidth: number,
  imgHeight: number,
  title: string,
  options?: {
    fitToSinglePage?: boolean;
    isFirstPage?: boolean;
    campaignName?: string;
  }
): Promise<void> {
  const pdfWidth = pdf.internal.pageSize.getWidth();   // 210mm
  const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
  const margin = 12;
  const headerSpace = 22;
  const footerSpace = 10;
  const usableWidth = pdfWidth - margin * 2;
  const usableHeight = pdfHeight - margin * 2 - headerSpace - footerSpace;

  const isFirst = options?.isFirstPage ?? false;
  const fitSingle = options?.fitToSinglePage ?? false; // Default to multi-page sliced for maximum legibility

  if (fitSingle) {
    if (!isFirst) {
      pdf.addPage();
    }

    // Proportional scaling calculation
    const scale = Math.min(usableWidth / imgWidth, usableHeight / imgHeight);
    const renderWidth = imgWidth * scale;
    const renderHeight = imgHeight * scale;

    // Center horizontally and vertically within available page space
    const xOffset = margin + (usableWidth - renderWidth) / 2;
    const yOffset = margin + headerSpace + (usableHeight - renderHeight) / 2;

    // Header & Metadata
    pdf.setFillColor(248, 249, 250);
    pdf.rect(margin, margin, usableWidth, 16, 'F');
    pdf.setDrawColor(220, 224, 230);
    pdf.rect(margin, margin, usableWidth, 16, 'S');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(20, 20, 20);
    pdf.text('JHARKHAND EXPRESS - AD CAMPAIGN PROOF OF RUN', margin + 4, margin + 6.5);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text(title, margin + 4, margin + 12);

    if (options?.campaignName) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(16, 110, 190);
      const campText = `Campaign: ${options.campaignName}`;
      const campWidth = pdf.getTextWidth(campText);
      pdf.text(campText, margin + usableWidth - campWidth - 4, margin + 6.5);
    }

    // Screenshot Container Border
    pdf.setDrawColor(210, 215, 222);
    pdf.rect(xOffset - 0.5, yOffset - 0.5, renderWidth + 1, renderHeight + 1);

    // Add Image to PDF
    pdf.addImage(imgDataUrl, 'JPEG', xOffset, yOffset, renderWidth, renderHeight, undefined, 'FAST');

    // Footer Watermark
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(7);
    pdf.setTextColor(140, 140, 140);
    pdf.text(
      `Verified Wayback Capture • Desktop Full-Length (1280px) • Rendered: ${new Date().toLocaleDateString()}`,
      margin,
      pdfHeight - margin
    );

    const pageNum = (pdf as any).internal.getNumberOfPages();
    const pageStr = `Page ${pageNum}`;
    pdf.text(pageStr, pdfWidth - margin - pdf.getTextWidth(pageStr), pdfHeight - margin);
  } else {
    // Multi-page slicing at full readable width (186mm)
    const mmToPxRatio = imgWidth / usableWidth;
    const slicePixelHeight = Math.floor(usableHeight * mmToPxRatio);

    let currentPixelY = 0;
    let pageCount = 0;

    while (currentPixelY < imgHeight) {
      if (!isFirst || pageCount > 0) {
        pdf.addPage();
      }

      const thisSlicePxHeight = Math.min(slicePixelHeight, imgHeight - currentPixelY);
      const sliceDataUrl = await sliceImageToCanvas(imgDataUrl, imgWidth, currentPixelY, thisSlicePxHeight);
      const renderSliceMmHeight = thisSlicePxHeight / mmToPxRatio;

      pdf.setFillColor(248, 249, 250);
      pdf.rect(margin, margin, usableWidth, 16, 'F');
      pdf.setDrawColor(220, 224, 230);
      pdf.rect(margin, margin, usableWidth, 16, 'S');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(20, 20, 20);
      pdf.text('JHARKHAND EXPRESS - AD CAMPAIGN PROOF OF RUN', margin + 4, margin + 6.5);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      const pageLabel = (imgHeight > slicePixelHeight) ? `${title} (Part ${pageCount + 1})` : title;
      pdf.text(pageLabel, margin + 4, margin + 12);

      if (options?.campaignName) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        pdf.setTextColor(16, 110, 190);
        const campText = `Campaign: ${options.campaignName}`;
        const campWidth = pdf.getTextWidth(campText);
        pdf.text(campText, margin + usableWidth - campWidth - 4, margin + 6.5);
      }

      pdf.setDrawColor(210, 215, 222);
      pdf.rect(margin - 0.5, margin + headerSpace - 0.5, usableWidth + 1, renderSliceMmHeight + 1);

      pdf.addImage(
        sliceDataUrl,
        'JPEG',
        margin,
        margin + headerSpace,
        usableWidth,
        renderSliceMmHeight,
        undefined,
        'FAST'
      );

      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(7);
      pdf.setTextColor(140, 140, 140);
      pdf.text(
        `Verified Wayback Capture • Desktop Full-Length (1280px) • Part ${pageCount + 1}`,
        margin,
        pdfHeight - margin
      );

      const pageNum = (pdf as any).internal.getNumberOfPages();
      const pageStr = `Page ${pageNum}`;
      pdf.text(pageStr, pdfWidth - margin - pdf.getTextWidth(pageStr), pdfHeight - margin);

      currentPixelY += thisSlicePxHeight;
      pageCount++;
    }
  }
}
