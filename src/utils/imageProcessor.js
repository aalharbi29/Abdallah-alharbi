export const removeWhiteBackground = async (imageUrl, tolerance = 210) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // If pixel is white or very light grey, make it fully transparent
        if (r > tolerance && g > tolerance && b > tolerance) {
          data[i + 3] = 0; 
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = (err) => {
      console.error("Error loading image for background removal:", err);
      resolve(imageUrl); // Fallback to original image if CORS fails
    };
    
    // Prevent CORS cache issues
    const src = imageUrl.includes('?') ? `${imageUrl}&cb=${Date.now()}` : `${imageUrl}?cb=${Date.now()}`;
    img.src = src;
  });
};