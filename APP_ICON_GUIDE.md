# App Icon Replacement Guide

This guide explains how to replace the default Capacitor app icon for both Android and iOS platforms.

## Overview

You need to provide app icons in various sizes for both platforms. The recommended approach is to use an automated tool, but manual replacement is also documented below.

---

## Method 1: Automated (Recommended)

### Using Capacitor Assets CLI

This is the easiest and most reliable method.

#### Step 1: Install Capacitor Assets

```bash
npm install -g @capacitor/assets
```

#### Step 2: Prepare Your Icon

1. Create a high-resolution PNG image: **1024×1024 px**
2. Use a transparent background if needed
3. Ensure the icon looks good when scaled down
4. Save it as `icon.png`

#### Step 3: Create Resources Directory

Create a `resources` folder in your project root:

```
frontend/
├── resources/
│   └── icon.png (1024×1024)
├── android/
├── ios/
└── ...
```

#### Step 4: Generate Icons

Run the following command from your project root:

```bash
npx @capacitor/assets generate --iconBackgroundColor '#ffffff' --iconBackgroundColorDark '#000000'
```

Or for a simple generation without background colors:

```bash
npx @capacitor/assets generate
```

This will automatically generate all required icon sizes for both Android and iOS.

#### Step 5: Rebuild Your App

```bash
npm run build
npx cap sync
```

---

## Method 2: Manual Replacement

If you prefer to manually create and place icons, follow these platform-specific instructions.

### Android Icons

#### Directory Structure

Place PNG files in: `android/app/src/main/res/`

#### Required Sizes

| Density | Folder | Size | Filename |
|---------|--------|------|----------|
| LDPI | `mipmap-ldpi/` | 36×36 px | `ic_launcher.png` |
| MDPI | `mipmap-mdpi/` | 48×48 px | `ic_launcher.png` |
| HDPI | `mipmap-hdpi/` | 72×72 px | `ic_launcher.png` |
| XHDPI | `mipmap-xhdpi/` | 96×96 px | `ic_launcher.png` |
| XXHDPI | `mipmap-xxhdpi/` | 144×144 px | `ic_launcher.png` |
| XXXHDPI | `mipmap-xxxhdpi/` | 192×192 px | `ic_launcher.png` |

#### Example File Paths

```
android/app/src/main/res/
├── mipmap-ldpi/
│   └── ic_launcher.png (36×36)
├── mipmap-mdpi/
│   └── ic_launcher.png (48×48)
├── mipmap-hdpi/
│   └── ic_launcher.png (72×72)
├── mipmap-xhdpi/
│   └── ic_launcher.png (96×96)
├── mipmap-xxhdpi/
│   └── ic_launcher.png (144×144)
└── mipmap-xxxhdpi/
    └── ic_launcher.png (192×192)
```

#### Optional: Adaptive Icons (Android 8.0+)

For modern Android devices, you can create adaptive icons:

1. Create foreground and background layers
2. Place them in the same density folders:
   - `ic_launcher_foreground.png`
   - `ic_launcher_background.png`
3. Create `mipmap-anydpi-v26/ic_launcher.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
```

---

### iOS Icons

#### Directory Structure

Place PNG files in: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

#### Required Sizes

| Size | Filename | Purpose |
|------|----------|---------|
| 20×20 | `AppIcon-20x20@1x.png` | iPhone Notification iOS 7-14 |
| 40×40 | `AppIcon-20x20@2x.png` | iPhone Notification @2x iOS 7-14 |
| 60×60 | `AppIcon-20x20@3x.png` | iPhone Notification @3x iOS 7-14 |
| 29×29 | `AppIcon-29x29@1x.png` | iPhone Settings iOS 7-14 |
| 58×58 | `AppIcon-29x29@2x.png` | iPhone Settings @2x iOS 7-14 |
| 87×87 | `AppIcon-29x29@3x.png` | iPhone Settings @3x iOS 7-14 |
| 40×40 | `AppIcon-40x40@1x.png` | iPhone Spotlight iOS 7-14 |
| 80×80 | `AppIcon-40x40@2x.png` | iPhone Spotlight @2x iOS 7-14 |
| 120×120 | `AppIcon-40x40@3x.png` | iPhone Spotlight @3x iOS 7-14 |
| 120×120 | `AppIcon-60x60@2x.png` | iPhone App @2x iOS 7-14 |
| 180×180 | `AppIcon-60x60@3x.png` | iPhone App @3x iOS 7-14 |
| 1024×1024 | `AppIcon-512@2x.png` | App Store iOS |

#### Update Contents.json

Ensure `ios/App/App/Assets.xcassets/AppIcon.appiconset/Contents.json` references all your icons correctly.

---

## Alternative Online Tools

If you don't want to use the CLI, these online tools can generate all sizes from a single image:

1. **AppIcon.co** - https://www.appicon.co/
   - Upload 1024×1024 PNG
   - Download generated zip
   - Extract and place files manually

2. **MakeAppIcon** - https://makeappicon.com/
   - Similar to AppIcon.co
   - Supports both iOS and Android

3. **Icon Kitchen** - https://icon.kitchen/
   - Android-focused
   - Generates adaptive icons

---

## Icon Design Best Practices

### General Guidelines

- **Size**: Start with at least 1024×1024 px
- **Format**: PNG with transparency support
- **Safe Zone**: Keep important elements within the center 80% of the canvas
- **Simplicity**: Icons should be recognizable at small sizes
- **No Text**: Avoid text in icons (it becomes unreadable when scaled)

### Platform-Specific Considerations

#### Android
- Icons are typically square with rounded corners applied by the system
- Consider how your icon looks with different background shapes (circle, squircle, rounded square)
- Test on different Android launchers

#### iOS
- iOS automatically applies rounded corners and shadow
- Design for a square canvas
- Avoid pre-rounding corners in your design

---

## Testing Your Icons

### Android

1. Build and run on an emulator or device:
   ```bash
   npm run build
   npx cap sync android
   npx cap open android
   ```

2. Check the app icon on:
   - Home screen
   - App drawer
   - Recent apps
   - Settings

### iOS

1. Build and run on a simulator or device:
   ```bash
   npm run build
   npx cap sync ios
   npx cap open ios
   ```

2. Check the app icon on:
   - Home screen
   - Spotlight search
   - Settings
   - App Store listing (1024×1024)

---

## Troubleshooting

### Icons Not Updating

**Android:**
- Clean and rebuild the project
- Uninstall the app completely and reinstall
- Clear Android Studio cache

**iOS:**
- Clean build folder in Xcode (Product → Clean Build Folder)
- Delete app from device/simulator
- Restart Xcode

### Wrong Size Errors

- Verify each PNG file is exactly the required dimensions
- Ensure files are named correctly (case-sensitive)
- Check that files are in PNG format, not JPEG

### Blurry Icons

- Start with a higher resolution source image
- Use vector graphics (SVG) and export to PNG at exact sizes
- Avoid upscaling smaller images

---

## Quick Reference Commands

```bash
# Install Capacitor Assets
npm install -g @capacitor/assets

# Generate icons from resources/icon.png
npx @capacitor/assets generate

# Sync changes to native projects
npx cap sync

# Open native IDEs
npx cap open android
npx cap open ios
```

---

## File Format Requirements

- **Extension**: `.png` only
- **Color Mode**: RGB or RGBA
- **Bit Depth**: 24-bit (RGB) or 32-bit (RGBA with transparency)
- **Compression**: PNG compression is fine
- **Transparency**: Supported and recommended for iOS

---

## Additional Resources

- [Capacitor Assets Documentation](https://github.com/ionic-team/capacitor-assets)
- [Android Icon Guidelines](https://developer.android.com/guide/practices/ui_guidelines/icon_design_launcher)
- [iOS Human Interface Guidelines - App Icons](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Capacitor Documentation](https://capacitorjs.com/docs)
