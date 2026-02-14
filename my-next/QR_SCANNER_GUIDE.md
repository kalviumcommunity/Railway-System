# QR Scanner Guide

## Overview
Mobile QR scanning functionality has been added to the Railway Food Management System. Passengers can now scan QR codes on food packages using their phone camera to report issues or complaints.

## Features
- **Camera Access**: Uses device camera with rear-facing mode for scanning
- **Real-time Scanning**: Automatically detects and scans QR codes
- **Manual Entry**: Option to manually enter QR code if camera doesn't work
- **Mobile Optimized**: Fully responsive design for mobile devices
- **Error Handling**: Graceful handling of camera permission issues

## How to Use

### For Passengers:
1. Open the app on your mobile device
2. Click the green "Scan QR Code to Report Issue" button on the home page
3. Grant camera permissions when prompted
4. Click "Start Camera"
5. Point your camera at the QR code on your food package
6. The app will automatically detect and redirect you to the complaint form
7. Alternatively, you can manually enter the QR code in the text field

### Testing the Scanner:
1. Start the development server:
   ```bash
   cd /home/harish/Documents/Important_project/railway/Railway-System/my-next
   npm run dev
   ```

2. Access from your mobile device:
   - Find your computer's local IP address: `ip addr show | grep inet`
   - Open `http://YOUR_IP:3000` on your phone
   - Or use ngrok for external access: `npx ngrok http 3000`

3. Test with existing QR codes:
   - Login as Kitchen user and generate a QR code from the Kitchen Dashboard
   - Use that to test the scanner

## File Structure
- `/app/scan/page.tsx` - QR scanner page
- `/app/complaint/[qrcode]/page.tsx` - Complaint submission page
- `/app/page.tsx` - Updated home page with scanner button

## Technical Details
- Uses **jsQR** library for QR code detection
- Uses **MediaDevices API** for camera access
- Scans every 500ms for QR codes
- Automatically stops camera when QR code is detected
- Falls back to manual entry if camera fails

## Browser Requirements
- HTTPS or localhost (required for camera access)
- Modern mobile browser (Chrome, Safari, Firefox)
- Camera permissions must be granted

## Demo Credentials
For testing the full workflow:
- **Kitchen**: kitchen@railway.com / kitchen123 (to generate QR codes)
- **Admin**: admin@railway.com / admin123 (to view complaints)

## Next Steps
- Test on various mobile devices
- Ensure HTTPS for production deployment
- Consider adding flashlight toggle for low-light scanning
- Add haptic feedback on successful scan
