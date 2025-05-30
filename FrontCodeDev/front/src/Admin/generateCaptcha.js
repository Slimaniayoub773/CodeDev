// utils/captcha.js
export const generateCaptcha = () => {
  // Characters to include in CAPTCHA
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let captcha = "";
  
  // Generate 6-character CAPTCHA
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    captcha += chars[randomIndex];
  }
  
  return captcha;
};

// Optional: Create a visually distorted CAPTCHA text (for canvas implementation)
export const generateCaptchaImage = (captchaText, width = 200, height = 80) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  // Fill background
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(0, 0, width, height);
  
  // Add noise - dots
  for (let i = 0; i < 100; i++) {
    ctx.fillStyle = `rgba(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100}, 0.2)`;
    ctx.beginPath();
    ctx.arc(
      Math.random() * width,
      Math.random() * height,
      Math.random() * 2,
      0,
      2 * Math.PI
    );
    ctx.fill();
  }
  
  // Add noise - lines
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = `rgba(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100}, 0.3)`;
    ctx.beginPath();
    ctx.moveTo(Math.random() * width, Math.random() * height);
    ctx.lineTo(Math.random() * width, Math.random() * height);
    ctx.stroke();
  }
  
  // Draw text
  ctx.fillStyle = '#000';
  ctx.font = 'bold 30px Arial';
  
  // Distort each character slightly
  for (let i = 0; i < captchaText.length; i++) {
    // Random rotation and position variation
    ctx.save();
    ctx.translate(30 + (i * 25), 50);
    ctx.rotate((Math.random() - 0.5) * 0.4);
    ctx.fillText(captchaText[i], 0, 0);
    ctx.restore();
  }
  
  return canvas.toDataURL();
};