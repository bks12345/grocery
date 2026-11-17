import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "../firebase/config";

/**
 * Optimizes an image client-side using HTML5 Canvas:
 * - Scales down image if dimensions exceed maxWidth or maxHeight while preserving aspect ratio
 * - Converts to high-efficiency WebP format with configurable compression quality
 *
 * @param {File|Blob} file - Source image file
 * @param {Object} options - Optimization parameters
 * @param {number} [options.maxWidth=1200] - Maximum width in pixels
 * @param {number} [options.maxHeight=1200] - Maximum height in pixels
 * @param {number} [options.quality=0.82] - WebP quality (0.0 to 1.0)
 * @param {string} [options.outputType="image/webp"] - MIME type for exported blob
 * @returns {Promise<{blob: Blob, dataUrl: string, width: number, height: number}>}
 */
export async function optimizeImage(file, options = {}) {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.82,
    outputType = "image/webp",
  } = options;

  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error("No file provided for image optimization"));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // Maintain aspect ratio while constraining to bounds
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL(outputType, quality);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error("Failed to generate WebP blob from canvas"));
            }
            resolve({ blob, dataUrl, width, height });
          },
          outputType,
          quality
        );
      };
      img.onerror = () => reject(new Error("Failed to decode image for optimization"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Generates a collision-resistant, clean storage path for Firebase Cloud Storage.
 *
 * @param {string} folder - Destination folder (e.g. 'products', 'goat', 'cms')
 * @param {string} originalName - Original file name for slugging
 * @returns {string} Sanitized storage path
 */
function generateStoragePath(folder = "products", originalName = "image") {
  const cleanFolder = (folder || "uploads").replace(/^\/+|\/+$/g, "");
  const baseName = originalName
    .replace(/\.[^/.]+$/, "") // strip extension
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .slice(0, 32);
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `${cleanFolder}/${timestamp}_${baseName || "photo"}_${randomSuffix}.webp`;
}

/**
 * Uploads an image to Firebase Cloud Storage with client-side WebP compression.
 *
 * @param {File|Blob} file - The file to upload
 * @param {string} [folder="products"] - Target directory in Firebase Storage
 * @param {Object} [options={}] - Optimization and upload options
 * @param {boolean} [options.allowFallback=true] - Fall back to data URL if Storage is unreachable
 * @returns {Promise<{url: string, imageUrl: string, path: string}>}
 */
export async function uploadImageToStorage(file, folder = "products", options = {}) {
  if (!file) {
    throw new Error("No file provided for upload");
  }

  // 1. Client-Side WebP Compression
  let uploadBlob = file;
  let dataUrlFallback = null;

  try {
    const optimized = await optimizeImage(file, options);
    uploadBlob = optimized.blob;
    dataUrlFallback = optimized.dataUrl;
  } catch (optErr) {
    console.warn("[storageService] Client WebP optimization failed, continuing with original file:", optErr.message);
  }

  // 2. Prepare Storage Reference & Metadata
  const originalName = file.name || "image.webp";
  const filePath = generateStoragePath(folder, originalName);
  const storageRef = ref(storage, filePath);

  const metadata = {
    contentType: "image/webp",
    cacheControl: "public, max-age=31536000",
    customMetadata: {
      uploadedAt: new Date().toISOString(),
      originalName: file.name || "unknown",
      originFolder: folder,
    },
  };

  // 3. Upload to Firebase Cloud Storage
  try {
    const snapshot = await uploadBytes(storageRef, uploadBlob, metadata);
    const downloadUrl = await getDownloadURL(snapshot.ref);

    return {
      url: downloadUrl,
      imageUrl: downloadUrl, // Backwards-compatible alias for existing consumers
      path: filePath,
    };
  } catch (err) {
    console.error(`[storageService] Upload failed for path '${filePath}':`, err);

    // Diagnostics for common Firebase Storage error conditions
    if (err.code === "storage/unauthorized") {
      const errorMsg = "Permission denied: Ensure your user is logged in as an administrator and Storage rules allow write.";
      if (options.allowFallback && dataUrlFallback) {
        console.warn(`[storageService] ${errorMsg} - Falling back to local WebP data URL.`);
        return { url: dataUrlFallback, imageUrl: dataUrlFallback, path: null };
      }
      throw new Error(errorMsg);
    }

    if (err.code === "storage/bucket-not-found" || err.code === "storage/project-not-found") {
      const errorMsg = "Firebase Storage bucket not found. Verify VITE_FIREBASE_STORAGE_BUCKET in your environment config.";
      if (options.allowFallback && dataUrlFallback) {
        console.warn(`[storageService] ${errorMsg} - Falling back to local WebP data URL.`);
        return { url: dataUrlFallback, imageUrl: dataUrlFallback, path: null };
      }
      throw new Error(errorMsg);
    }

    if (err.code === "storage/quota-exceeded") {
      throw new Error("Firebase Storage quota exceeded. Please review Blaze plan billing in Firebase Console.");
    }

    // Graceful fallback for offline dev/local testing without active emulators
    if (options.allowFallback && dataUrlFallback) {
      console.warn("[storageService] Cloud upload failed, falling back to local WebP data URL:", err.message);
      return {
        url: dataUrlFallback,
        imageUrl: dataUrlFallback,
        path: null,
      };
    }

    throw new Error(err.message || "Failed to upload image to Firebase Storage.");
  }
}

/**
 * Uploads an array or FileList of images to Firebase Storage concurrently.
 *
 * @param {FileList|Array<File>} files - Files to upload
 * @param {string} [folder="products"] - Target folder
 * @param {Object} [options={}] - Options passed to uploadImageToStorage
 * @returns {Promise<Array<string>>} List of public HTTPS download URLs
 */
export async function uploadMultipleImagesToStorage(files, folder = "products", options = {}) {
  const fileArray = Array.from(files || []).filter(Boolean);
  if (fileArray.length === 0) return [];

  const results = await Promise.all(
    fileArray.map(async (file) => {
      try {
        const uploaded = await uploadImageToStorage(file, folder, options);
        return uploaded.url;
      } catch (err) {
        console.error(`[storageService] Multi-upload error on file ${file.name}:`, err);
        if (options.ignoreErrors) return null;
        throw err;
      }
    })
  );

  return results.filter(Boolean);
}

/**
 * Deletes a file from Firebase Cloud Storage by its full download URL or relative path.
 *
 * @param {string} urlOrPath - Storage download URL or internal path
 * @returns {Promise<boolean>} Success indicator
 */
export async function deleteImageFromStorage(urlOrPath) {
  if (!urlOrPath) return false;

  try {
    let storageRef;
    if (urlOrPath.startsWith("http")) {
      // Extract storage path from Firebase download URL: /o/{encodedPath}?alt=media...
      const match = urlOrPath.match(/\/o\/([^?]+)/);
      if (match && match[1]) {
        const decodedPath = decodeURIComponent(match[1]);
        storageRef = ref(storage, decodedPath);
      } else {
        return false;
      }
    } else {
      storageRef = ref(storage, urlOrPath);
    }

    await deleteObject(storageRef);
    return true;
  } catch (err) {
    console.warn("[storageService] Failed to delete image from Firebase Storage:", err.message);
    return false;
  }
}
