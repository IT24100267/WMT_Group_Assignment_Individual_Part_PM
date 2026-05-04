# WMT_Group_Assignment_Individual_Part_PM

**Live Backend URL:** [https://wmtgroupassignmentindividualpartpm-production.up.railway.app](https://wmtgroupassignmentindividualpartpm-production.up.railway.app)

---

## 🚀 How to Run the Project

### 1. Backend Setup
The backend is already deployed, but if you want to run it locally:
```bash
cd freshguard-backend
npm install
npm run dev
```
*It will run on http://localhost:5005*

### 2. Mobile App Setup
Make sure you have the [Expo Go](https://expo.dev/go) app installed on your phone.
```bash
cd freshguard-mobile
npm install
npx expo start --tunnel
```
*Scan the QR code with your phone to open the app.*

### 3. Environment Variables
*   **Backend**: Create a `.env` in `freshguard-backend/` with `MONGO_URI`, `JWT_SECRET`, and `PORT=5005`.
*   **Frontend**: Create a `.env` in `freshguard-mobile/` with `EXPO_PUBLIC_API_URL=https://your-railway-url.app`.
