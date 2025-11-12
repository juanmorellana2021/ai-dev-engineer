# AIDevPilot Icon Creation Guide

## Icon Design
The icon combines several symbolic elements:
- **Purple/Blue Gradient Circle**: Modern, tech-forward brand color (matches VS Code aesthetic)
- **AI Brain**: White oval shape representing artificial intelligence
- **Code Brackets `</>`**: Classic programming symbol in blue gradient
- **Green Checkmarks/Wings**: Validation, quality assurance, "pilot" wings concept
- **Circuit Pattern**: Subtle tech texture

## Convert SVG to PNG (Multiple Methods)

### Method 1: Online Converter (Fastest)
1. Go to: https://cloudconvert.com/svg-to-png
2. Upload `icon.svg`
3. Set width/height to 128px
4. Download as `icon.png`

### Method 2: Inkscape (Best Quality)
```bash
# If you have Inkscape installed:
inkscape icon.svg --export-type=png --export-width=128 --export-height=128 --export-filename=icon.png
```

### Method 3: ImageMagick
```bash
# If you have ImageMagick:
magick convert -background none icon.svg -resize 128x128 icon.png
```

### Method 4: Browser (Simple)
1. Open `icon.svg` in Chrome/Firefox
2. Right-click → Inspect
3. Take screenshot (Windows: Win+Shift+S)
4. Crop to square, save as icon.png

## Add Icon to Extension

1. **Add icon file to extension root:**
   ```
   ai-dev-engineer-extension/
   ├── icon.png  ← Add this
   ├── package.json
   └── extension.js
   ```

2. **Update package.json:**
   ```json
   {
     "name": "aidevpilot",
     "displayName": "AIDevPilot",
     "icon": "icon.png",  ← Add this line
     "description": "...",
     ...
   }
   ```

3. **Repackage extension:**
   ```bash
   npx vsce package
   ```

4. **Reinstall:**
   ```bash
   code --install-extension aidevpilot-2.1.0.vsix
   ```

## Icon Appears In:
- VS Code Extensions sidebar
- VS Code Marketplace listing
- Extension notifications
- Command palette suggestions
- Status bar items

## Design Rationale:
- **Purple/Blue**: Premium, modern, AI-focused (matches GitHub Copilot's purple theme)
- **White AI Brain**: Intelligence, thinking, guidance
- **Code Brackets**: Clear developer tool identification
- **Green Checks**: Quality assurance, validation, success
- **128x128px**: Standard VS Code extension icon size

## Alternative Color Schemes (if needed):
- **Dark Mode Friendly**: Keep current (works on light/dark)
- **Blue Only**: Change gradient to #3b82f6 → #60a5fa
- **Green Accent**: Change purple to #10b981 → #34d399
