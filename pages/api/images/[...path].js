import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { path: imagePath } = req.query;
  
  // Join all path segments and create the full path to the image
  const filePath = path.join(process.cwd(), 'data', 'images', ...imagePath);
  
  try {
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).end('Image not found');
    }
    
    // Determine the content type based on file extension
    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
    }
    
    // Read and serve the file
    const fileBuffer = fs.readFileSync(filePath);
    res.setHeader('Content-Type', contentType);
    return res.send(fileBuffer);
  } catch (error) {
    console.error('Error serving image:', error);
    return res.status(500).end('Error serving image');
  }
}