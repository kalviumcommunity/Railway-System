# 📱 How to Test on Mobile - No Deployment Needed!

## Quick Start Guide

Your Next.js dev server already provides a **Network URL** that works on mobile devices connected to the same WiFi network!

### Step 1: Start the Dev Server

```bash
npm run dev
```

You'll see output like:
```
▲ Next.js 16.1.4 (Turbopack)
- Local:         http://localhost:3000
- Network:       http://192.168.1.47:3000  <-- USE THIS ON MOBILE!
```

### Step 2: Access from Your Mobile

1. **Make sure your phone is on the SAME WiFi** as your computer
2. Open your mobile browser (Chrome, Safari, etc.)
3. Enter the **Network URL** in the address bar: `http://192.168.1.47:3000`
4. You can now use the app on your mobile!

### Step 3: Test the QR Code Flow

#### As Kitchen Head:
1. Login as KITCHEN user
2. Go to Kitchen Dashboard
3. Create a batch with food item details
4. Click "View QR" on the batch
5. **Download the QR code image** or **Copy the Link**
6. Print the QR code or save it to your phone

#### As Passenger (No Login Required):
1. Scan the QR code with your phone camera (most phones have built-in QR scanners)
   - **iPhone**: Open Camera app, point at QR code
   - **Android**: Open Camera app or use Google Lens
2. OR manually enter: `http://192.168.1.47:3000/complaint/[QR-CODE]`
3. You'll see the food batch details
4. Fill in:
   - Train Number (required)
   - Your Name (optional)
   - Complaint details (required)
5. Submit complaint - **No login needed!**

## 🎯 Testing Scenarios

### Scenario 1: Food Quality Issue
1. Kitchen head creates batch: "Biryani from ABC Kitchen"
2. Passenger scans QR code on food package
3. Submits complaint: "Food is cold and tastes stale"
4. Admin receives complaint in dashboard

### Scenario 2: Expired Food
1. System shows warning if batch is expired
2. Passenger can still report it
3. Kitchen head can track all complaints per batch

## 📊 Features You Can Test

### Kitchen Dashboard
- ✅ Create kitchens
- ✅ Create food batches with QR codes
- ✅ View scannable QR codes
- ✅ Download QR codes as images
- ✅ Track all batches

### Public Complaint Page (No Login)
- ✅ Mobile-friendly design
- ✅ Scan QR codes to access
- ✅ View food batch details
- ✅ Submit complaints without account
- ✅ Works on any smartphone browser

### Admin Features
- ✅ View all complaints
- ✅ Monitor batches
- ✅ Track food safety issues

## 🔒 When Do You Need Deployment?

You DON'T need deployment for testing! But you should deploy when:

1. **You want access from anywhere** (not just local WiFi)
2. **Multiple locations** (different railway stations)
3. **Production use** with real passengers
4. **Public internet access** needed

### Free Deployment Options:
- **Vercel** (Recommended for Next.js)
- **Netlify**
- **Railway.app**
- **Render**

## 📱 Mobile Testing Tips

1. **Use Chrome on Android** or **Safari on iOS** for best experience
2. **Add to Home Screen** for app-like experience:
   - Android: Menu → "Add to Home Screen"
   - iOS: Share → "Add to Home Screen"
3. **QR Scanner Apps**: Use built-in camera or download QR scanner
4. **Test offline behavior**: See how it handles network issues

## 🆘 Troubleshooting

### Can't access from mobile?
- Check both devices on same WiFi
- Try disabling firewall temporarily
- Use the Network URL, not localhost
- Restart dev server

### QR code not scanning?
- Make sure QR code is clear and well-lit
- Try a dedicated QR scanner app
- Manual entry works too!

### Form not submitting?
- Check browser console for errors
- Ensure backend server is running
- Check network connectivity

## 🎉 You're Ready!

No deployment needed for testing. Just use your local network and start scanning QR codes!
