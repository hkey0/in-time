# Amazon Prices in Time 

A browser extension that converts Amazon prices into time, showing you how long you would need to work to afford each item based on your hourly wage.

<img width="1523" height="678" alt="image" src="https://github.com/user-attachments/assets/011ba611-6821-492f-979f-fe55c5ab3837" />
<img width="1920" height="1005" alt="image" src="https://github.com/user-attachments/assets/12714c01-3ce8-4c33-bf2c-ae5cc412e2a3" />


## Installation

### Chrome / Edge / Brave

1. Download or clone this repository
2. Run `./build.sh` to generate browser-specific builds
3. Open `chrome://extensions` in your browser
4. Enable "Developer mode"
5. Click "Load unpacked" and select the `dist/chrome` folder

### Firefox

1. Download or clone this repository
2. Run `./build.sh` to generate browser-specific builds
3. Open `about:debugging#/runtime/this-firefox`
4. Click "Load Temporary Add-on"
5. Select any file in the `dist/firefox` folder

## Privacy

This extension:
- Does not collect any personal data
- Does not send any information to external servers
- Stores your wage settings locally using browser sync storage
- Only runs on Amazon websites

## Development

```bash
# Build for both browsers
./build.sh

# Output
# dist/chrome/  - Chrome/Chromium build
# dist/firefox/ - Firefox build
```
