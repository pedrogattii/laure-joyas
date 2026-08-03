export interface ImageCompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * Compresses an image File and converts it to WebP format using browser HTML5 Canvas.
 * If WebP is not supported or conversion fails, degrades gracefully to original file.
 */
export async function compressAndConvertToWebP(
  file: File,
  options: ImageCompressOptions = {}
): Promise<File> {
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.82 } = options;

  // If it's not an image file, return original
  if (!file.type || !file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // Calculate aspect ratio downscaling
        if (width > maxWidth || height > maxHeight) {
          const widthRatio = maxWidth / width;
          const heightRatio = maxHeight / height;
          const bestRatio = Math.min(widthRatio, heightRatio);

          width = Math.round(width * bestRatio);
          height = Math.round(height * bestRatio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        // Smooth image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            const baseName = file.name.replace(/\.[^/.]+$/, '');
            const newFileName = `${baseName}.webp`;

            const compressedFile = new File([blob], newFileName, {
              type: 'image/webp',
              lastModified: Date.now(),
            });

            // If compressed file turns out larger (rare), retain original
            if (compressedFile.size >= file.size && file.type === 'image/webp') {
              resolve(file);
            } else {
              resolve(compressedFile);
            }
          },
          'image/webp',
          quality
        );
      };

      img.onerror = () => resolve(file);

      if (typeof e.target?.result === 'string') {
        img.src = e.target.result;
      } else {
        resolve(file);
      }
    };

    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
