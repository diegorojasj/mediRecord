const LOGO_MAX_SIDE = 512;
// Matches the config service limit on the stored data URL, with margin
const LOGO_MAX_DATA_URL = 950_000;
export const LOGO_ACCEPT = 'image/png,image/jpeg,image/webp,image/svg+xml';

const readAsDataUrl = (file: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('The image could not be read'));
    reader.readAsDataURL(file);
  });

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('The file is not a valid image'));
    img.src = src;
  });

// Turns the picked file into a small data URL: photos are scaled down, SVGs are kept as they are
export async function logoFromFile(file: File): Promise<string> {
  if (!LOGO_ACCEPT.split(',').includes(file.type)) {
    throw new Error('Use a PNG, JPG, WebP or SVG image');
  }
  const source = await readAsDataUrl(file);
  if (file.type === 'image/svg+xml') {
    if (source.length > LOGO_MAX_DATA_URL)
      throw new Error('The SVG is too large, keep it under 700 KB');
    return source;
  }

  const img = await loadImage(source);
  const scale = Math.min(1, LOGO_MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);

  // PNG keeps transparency; fall back to WebP when a detailed photo gets too heavy
  let result = canvas.toDataURL('image/png');
  if (result.length > LOGO_MAX_DATA_URL) result = canvas.toDataURL('image/webp', 0.9);
  if (result.length > LOGO_MAX_DATA_URL)
    throw new Error('The image is too detailed, try a simpler logo');
  return result;
}
