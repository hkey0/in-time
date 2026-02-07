#!/bin/bash

# Build script for Amazon Time Prices extension
# Creates separate builds for Chrome and Firefox

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DIST_DIR="$SCRIPT_DIR/dist"

# Clean dist folders
rm -rf "$DIST_DIR/chrome" "$DIST_DIR/firefox"
mkdir -p "$DIST_DIR/chrome" "$DIST_DIR/firefox"

# Copy common files to both
for browser in chrome firefox; do
  cp -r "$SCRIPT_DIR/src" "$DIST_DIR/$browser/"
  # Copy icon if it exists
  if [ -f "$SCRIPT_DIR/icon.png" ]; then
    cp "$SCRIPT_DIR/icon.png" "$DIST_DIR/$browser/"
  fi
done

# Chrome manifest (service_worker)
cat > "$DIST_DIR/chrome/manifest.json" << 'EOF'
{
  "manifest_version": 3,
  "name": "Amazon Prices in Time",
  "version": "1.0.0",
  "description": "Show Amazon prices in time based on your hourly wage.",
  "permissions": ["storage"],
  "icons": {
    "16": "icon.png",
    "32": "icon.png",
    "48": "icon.png",
    "128": "icon.png"
  },
  "background": {
    "service_worker": "src/background.js"
  },
  "action": {
    "default_icon": {
      "16": "icon.png",
      "32": "icon.png",
      "48": "icon.png"
    }
  },
  "host_permissions": [
    "https://amazon.com/*",
    "https://www.amazon.com/*",
    "https://*.amazon.com/*",
    "https://amazon.co.uk/*",
    "https://*.amazon.co.uk/*",
    "https://amazon.de/*",
    "https://*.amazon.de/*",
    "https://amazon.fr/*",
    "https://*.amazon.fr/*",
    "https://amazon.it/*",
    "https://*.amazon.it/*",
    "https://amazon.es/*",
    "https://*.amazon.es/*",
    "https://amazon.ca/*",
    "https://*.amazon.ca/*",
    "https://amazon.co.jp/*",
    "https://*.amazon.co.jp/*",
    "https://amazon.com.au/*",
    "https://*.amazon.com.au/*",
    "https://amazon.in/*",
    "https://*.amazon.in/*",
    "https://amazon.nl/*",
    "https://*.amazon.nl/*",
    "https://amazon.com.br/*",
    "https://*.amazon.com.br/*",
    "https://amazon.com.mx/*",
    "https://*.amazon.com.mx/*",
    "https://amazon.sa/*",
    "https://*.amazon.sa/*",
    "https://amazon.ae/*",
    "https://*.amazon.ae/*",
    "https://amazon.sg/*",
    "https://*.amazon.sg/*",
    "https://amazon.se/*",
    "https://*.amazon.se/*",
    "https://amazon.pl/*",
    "https://*.amazon.pl/*",
    "https://amazon.com.tr/*",
    "https://*.amazon.com.tr/*"
  ],
  "options_page": "src/options.html",
  "content_scripts": [
    {
      "matches": [
        "https://amazon.com/*",
        "https://www.amazon.com/*",
        "https://*.amazon.com/*",
        "https://amazon.co.uk/*",
        "https://*.amazon.co.uk/*",
        "https://amazon.de/*",
        "https://*.amazon.de/*",
        "https://amazon.fr/*",
        "https://*.amazon.fr/*",
        "https://amazon.it/*",
        "https://*.amazon.it/*",
        "https://amazon.es/*",
        "https://*.amazon.es/*",
        "https://amazon.ca/*",
        "https://*.amazon.ca/*",
        "https://amazon.co.jp/*",
        "https://*.amazon.co.jp/*",
        "https://amazon.com.au/*",
        "https://*.amazon.com.au/*",
        "https://amazon.in/*",
        "https://*.amazon.in/*",
        "https://amazon.nl/*",
        "https://*.amazon.nl/*",
        "https://amazon.com.br/*",
        "https://*.amazon.com.br/*",
        "https://amazon.com.mx/*",
        "https://*.amazon.com.mx/*",
        "https://amazon.sa/*",
        "https://*.amazon.sa/*",
        "https://amazon.ae/*",
        "https://*.amazon.ae/*",
        "https://amazon.sg/*",
        "https://*.amazon.sg/*",
        "https://amazon.se/*",
        "https://*.amazon.se/*",
        "https://amazon.pl/*",
        "https://*.amazon.pl/*",
        "https://amazon.com.tr/*",
        "https://*.amazon.com.tr/*"
      ],
      "js": ["src/content.js"],
      "css": ["src/content.css"]
    }
  ]
}
EOF

# Firefox manifest (scripts)
cat > "$DIST_DIR/firefox/manifest.json" << 'EOF'
{
  "manifest_version": 3,
  "name": "Amazon Prices in Time",
  "version": "1.0.0",
  "description": "Show Amazon prices in time based on your hourly wage.",
  "browser_specific_settings": {
    "gecko": {
      "id": "{a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d}"
    }
  },
  "permissions": ["storage"],
  "icons": {
    "16": "icon.png",
    "32": "icon.png",
    "48": "icon.png",
    "128": "icon.png"
  },
  "background": {
    "scripts": ["src/background.js"]
  },
  "action": {
    "default_icon": {
      "16": "icon.png",
      "32": "icon.png",
      "48": "icon.png"
    }
  },
  "host_permissions": [
    "https://amazon.com/*",
    "https://www.amazon.com/*",
    "https://*.amazon.com/*",
    "https://amazon.co.uk/*",
    "https://*.amazon.co.uk/*",
    "https://amazon.de/*",
    "https://*.amazon.de/*",
    "https://amazon.fr/*",
    "https://*.amazon.fr/*",
    "https://amazon.it/*",
    "https://*.amazon.it/*",
    "https://amazon.es/*",
    "https://*.amazon.es/*",
    "https://amazon.ca/*",
    "https://*.amazon.ca/*",
    "https://amazon.co.jp/*",
    "https://*.amazon.co.jp/*",
    "https://amazon.com.au/*",
    "https://*.amazon.com.au/*",
    "https://amazon.in/*",
    "https://*.amazon.in/*",
    "https://amazon.nl/*",
    "https://*.amazon.nl/*",
    "https://amazon.com.br/*",
    "https://*.amazon.com.br/*",
    "https://amazon.com.mx/*",
    "https://*.amazon.com.mx/*",
    "https://amazon.sa/*",
    "https://*.amazon.sa/*",
    "https://amazon.ae/*",
    "https://*.amazon.ae/*",
    "https://amazon.sg/*",
    "https://*.amazon.sg/*",
    "https://amazon.se/*",
    "https://*.amazon.se/*",
    "https://amazon.pl/*",
    "https://*.amazon.pl/*",
    "https://amazon.com.tr/*",
    "https://*.amazon.com.tr/*"
  ],
  "options_page": "src/options.html",
  "content_scripts": [
    {
      "matches": [
        "https://amazon.com/*",
        "https://www.amazon.com/*",
        "https://*.amazon.com/*",
        "https://amazon.co.uk/*",
        "https://*.amazon.co.uk/*",
        "https://amazon.de/*",
        "https://*.amazon.de/*",
        "https://amazon.fr/*",
        "https://*.amazon.fr/*",
        "https://amazon.it/*",
        "https://*.amazon.it/*",
        "https://amazon.es/*",
        "https://*.amazon.es/*",
        "https://amazon.ca/*",
        "https://*.amazon.ca/*",
        "https://amazon.co.jp/*",
        "https://*.amazon.co.jp/*",
        "https://amazon.com.au/*",
        "https://*.amazon.com.au/*",
        "https://amazon.in/*",
        "https://*.amazon.in/*",
        "https://amazon.nl/*",
        "https://*.amazon.nl/*",
        "https://amazon.com.br/*",
        "https://*.amazon.com.br/*",
        "https://amazon.com.mx/*",
        "https://*.amazon.com.mx/*",
        "https://amazon.sa/*",
        "https://*.amazon.sa/*",
        "https://amazon.ae/*",
        "https://*.amazon.ae/*",
        "https://amazon.sg/*",
        "https://*.amazon.sg/*",
        "https://amazon.se/*",
        "https://*.amazon.se/*",
        "https://amazon.pl/*",
        "https://*.amazon.pl/*",
        "https://amazon.com.tr/*",
        "https://*.amazon.com.tr/*"
      ],
      "js": ["src/content.js"],
      "css": ["src/content.css"]
    }
  ]
}
EOF

echo "✓ Built Chrome extension in dist/chrome/"
echo "✓ Built Firefox extension in dist/firefox/"
