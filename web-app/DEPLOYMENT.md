# Golo Web App - Deployment Guide

## Production Deployment

### Prerequisites
- Node.js 16+ (recommended: 18+)
- npm or yarn
- Modern web browser with WebRTC support
- HTTPS (required for microphone access in production)

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/bishalu/veer.git
   cd veer/web-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm start
   ```
   
   The app will open at `http://localhost:3000`

### Production Deployment Options

#### Option 1: Static File Server (Recommended)

**Using nginx:**
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    root /path/to/golo-web-app;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Enable gzip compression
    gzip on;
    gzip_types text/css application/javascript text/javascript;
}
```

**Using Apache:**
```apache
<VirtualHost *:443>
    ServerName your-domain.com
    DocumentRoot /path/to/golo-web-app
    
    SSLEngine on
    SSLCertificateFile /path/to/cert.pem
    SSLCertificateKeyFile /path/to/key.pem
    
    <Directory /path/to/golo-web-app>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

#### Option 2: Node.js Server

```bash
# Install a simple HTTP server
npm install -g http-server

# Serve with HTTPS (required for mic access)
http-server -p 8080 -S -C cert.pem -K key.pem
```

#### Option 3: Cloud Deployment

**Vercel:**
```bash
npm install -g vercel
vercel --prod
```

**Netlify:**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=.
```

**GitHub Pages:**
1. Push to GitHub
2. Enable GitHub Pages in repository settings
3. Set source to main branch / root folder

### Environment Configuration

Create `.env.production` for production-specific settings:
```bash
NODE_ENV=production
PUBLIC_URL=https://your-domain.com
HTTPS=true
```

### Security Considerations

1. **HTTPS Required:** Microphone access requires HTTPS in production
2. **CSP Headers:** Consider adding Content Security Policy headers
3. **CORS:** Configure CORS if serving from different domains
4. **Rate Limiting:** Implement rate limiting for API endpoints (future)

### Performance Optimization

1. **Enable gzip compression** on your web server
2. **Minify CSS/JS** (optional - current files are already optimized)
3. **Use CDN** for static assets
4. **Cache static resources** with appropriate headers

### Browser Support

- **Chrome:** Full support (recommended)
- **Firefox:** Full support
- **Safari:** Full support (iOS 14.3+)
- **Edge:** Full support
- **Mobile:** Optimized for mobile browsers

### Troubleshooting

**Microphone not working:**
- Ensure HTTPS is enabled
- Check browser permissions
- Verify MediaRecorder API support

**Audio playback issues:**
- Check console for codec errors
- Verify blob MIME types
- Test with different browsers

**Layout issues:**
- Clear browser cache
- Check CSS loading order
- Verify responsive breakpoints

### Monitoring & Analytics

For production monitoring, consider adding:
- Google Analytics
- Error tracking (Sentry)
- Performance monitoring
- User feedback tools

### Support

For deployment issues:
1. Check browser console for errors
2. Verify all static files are served correctly
3. Test microphone permissions
4. Ensure HTTPS is properly configured