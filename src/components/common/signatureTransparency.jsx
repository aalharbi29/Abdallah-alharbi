export const makeWhiteTransparentImage = (src) => new Promise((resolve) => {
  if (!src) {
    resolve(src);
    return;
  }

  const image = new Image();
  image.crossOrigin = 'anonymous';

  image.onload = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const red = data[i];
        const green = data[i + 1];
        const blue = data[i + 2];
        if (red > 235 && green > 235 && blue > 235) {
          data[i + 3] = 0;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    } catch {
      resolve(src);
    }
  };

  image.onerror = () => resolve(src);
  image.src = src;
});

export const prepareSignaturesForExport = async (signatures = [], selectedIds = []) => {
  const ids = (Array.isArray(selectedIds) ? selectedIds : [selectedIds]).filter(Boolean);
  if (ids.length === 0) return signatures;

  const processed = await Promise.all(signatures.map(async (signature) => (
    ids.includes(signature.id) && signature.image_url
      ? { ...signature, image_url: await makeWhiteTransparentImage(signature.image_url) }
      : signature
  )));
  return processed;
};