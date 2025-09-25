# QuickPix - Advanced Image Processor

A powerful, client-side image processing web application built with Next.js, TensorFlow.js, and Web Workers. Process images entirely in your browser without any server storage. Now with metadata viewing and cleaning capabilities!

## Features

- **Bulk Image Upscaler** - Upscale multiple images using TensorFlow.js with 2x and 4x scaling
- **Format Converter** - Convert between JPEG, PNG, WebP, and AVIF formats
- **Image Resizing** - Resize images with aspect ratio preservation
- **Compression** - Adjustable compression levels for optimal file sizes
- **Watermarking** - Add text watermarks with customizable positioning
- **Metadata Viewer & Cleaner** - View EXIF data and remove metadata for privacy
- **Batch Processing** - Process multiple images simultaneously using Web Workers
- **ZIP Download** - Download all processed images as a single ZIP file
- **Progress Tracking** - Real-time progress indicators for batch operations
- **Performance Monitoring** - Built-in performance metrics and optimization

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first CSS framework
- **TensorFlow.js** - Client-side machine learning for image upscaling
- **Web Workers** - Non-blocking image processing
- **JSZip** - ZIP file creation for batch downloads
- **React Dropzone** - Drag & drop file uploads
- **Exifr** - EXIF metadata extraction

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd image-processor
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `out/` directory.

## Deployment

### Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy to Vercel:
```bash
npm run deploy
```

Or connect your GitHub repository to Vercel for automatic deployments.

### Other Platforms

This is a static Next.js application that can be deployed to any static hosting service:

- **Netlify**: Connect your repository and deploy
- **GitHub Pages**: Use the `out/` directory after building
- **AWS S3**: Upload the `out/` directory contents
- **Cloudflare Pages**: Connect your repository

## Usage

### Image Processing

1. **Upload Images**: Drag and drop or click to select multiple image files
2. **Configure Options**: 
   - Choose upscaling factor (1x, 2x, 4x)
   - Select output format (JPEG, PNG, WebP, AVIF)
   - Set quality and compression levels
   - Add watermarks if desired
   - Resize images with optional aspect ratio preservation
3. **Process**: Click "Start Processing" to begin batch processing
4. **Download**: Download individual images or all as a ZIP file

### Metadata Viewer & Cleaner

QuickPix includes a dedicated metadata section where you can:

1. **View EXIF Data**: See detailed metadata including:
   - Camera information (make, model)
   - Lens data
   - Exposure settings (focal length, aperture, shutter speed, ISO)
   - Date and time information
   - GPS coordinates (if available)
   - Software used to create/edit the image

2. **Remove Metadata**: Protect your privacy by removing all metadata from images with a single click

3. **Download Cleaned Images**: Save privacy-protected versions of your images

To use the metadata viewer:
1. Navigate to the "Metadata Viewer" tab
2. Upload an image using the drag & drop area
3. View the extracted metadata in the organized display
4. Click "Remove Metadata" to create a privacy-protected version
5. Download the cleaned image

## Performance Features

- **Web Workers**: Image processing runs in background threads
- **Batch Processing**: Optimized for large batches of images
- **Memory Management**: Efficient memory usage with cleanup
- **Progress Tracking**: Real-time progress updates
- **Error Handling**: Graceful error handling with fallbacks

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

WebGL support is required for optimal TensorFlow.js performance.

## Configuration

### Batch Processing Settings

The application automatically adjusts batch processing based on the number of images:

- **Small batches (≤10 images)**: Process all at once
- **Medium batches (11-50 images)**: Moderate concurrency
- **Large batches (>50 images)**: Controlled concurrency with memory management

### TensorFlow.js Backend

The application automatically selects the best available backend:
1. WebGL (preferred for performance)
2. CPU (fallback)

## Troubleshooting

### Common Issues

1. **WebGL not available**: The app will fall back to CPU processing
2. **Memory errors with large batches**: Try processing smaller batches
3. **Slow processing**: Ensure WebGL is enabled in your browser

### Performance Tips

- Use WebGL-enabled browsers for best performance
- Process images in smaller batches for very large collections
- Close other browser tabs to free up memory
- Use modern browsers with good WebGL support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Ensure your browser supports the required features