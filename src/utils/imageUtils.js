// src/utils/imageUtils.js
// Resize + base64-encode images client-side before sending to Claude's
// vision API or storing on a Firestore message doc.

export const MAX_IMAGES_PER_MESSAGE = 4;
export const MAX_IMAGE_DIMENSION    = 1568; // Anthropic's recommended max edge
export const JPEG_QUALITY           = 0.82;
export const ACCEPTED_IMAGE_TYPES   = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Resize an image file down to at most MAX_IMAGE_DIMENSION on its longest
 * edge (skips resizing if already smaller) and return it as base64 +
 * media type, ready to hand to the Anthropic API or store in Firestore.
 *
 * @param {File} file
 * @returns {Promise<{mediaType: string, data: string, dataUrl: string, name: string}>}
 */
export function fileToResizedImage(file) {
  return new Promise((resolve, reject) => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      reject(new Error(`Unsupported image type: ${file.type || 'unknown'}`));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Could not decode image.'));
      img.onload = () => {
        let { width, height } = img;
        const longEdge = Math.max(width, height);

        // GIFs: pass through untouched (canvas would flatten animation)
        if (file.type === 'image/gif') {
          const dataUrl = reader.result;
          resolve({
            mediaType: file.type,
            data:      dataUrl.split(',')[1],
            dataUrl,
            name:      file.name,
          });
          return;
        }

        if (longEdge > MAX_IMAGE_DIMENSION) {
          const scale = MAX_IMAGE_DIMENSION / longEdge;
          width  = Math.round(width * scale);
          height = Math.round(height * scale);
        }

        const canvas = document.createElement('canvas');
        canvas.width  = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const mediaType = 'image/jpeg';
        const dataUrl    = canvas.toDataURL(mediaType, JPEG_QUALITY);
        resolve({
          mediaType,
          data: dataUrl.split(',')[1],
          dataUrl,
          name: file.name,
        });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/** Rough size estimate in KB for a base64 string (for UI display only). */
export function base64SizeKB(base64) {
  return Math.round((base64.length * 0.75) / 1024);
}
