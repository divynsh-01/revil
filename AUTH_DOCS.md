# Authentication System Documentation

This document explicitly explains the current state of the authentication system, how it works across different user roles, and what needs to be considered before deploying to production.

## System Overview

The application utilizes a **role-based dual authentication strategy**:
1. **Frontend Users (Customers)**: Authenticate using **Mobile Number + OTP** (One-Time Password). This creates a frictionless signup and login experience without needing passwords.
2. **Admin & Owner Users**: Authenticate using **Email + Password**. This provides standard, secure administrative access to the backend dashboards.

---

## Data Model (`backend/models/userModel.js`)

The `userSchema` supports both authentication types simultaneously:
- `name` (String, default: "User"): The user's display name.
- `phone` (String, required, unique): The primary identifier for standard users.
- `email` (String, optional): Used for admin logins.
- `password` (String, optional): Hashed password used for admin logins.
- `role` (Enum): Can be `user`, `admin`, or `owner`. Defaults to `user`.
- `otp` (String): Temporarily stores the active 6-digit OTP code for standard users.
- `otpExpiry` (Date): Timestamp when the active OTP expires (defaults to 5 minutes after generation).

---

## Application API Endpoints (`backend/routes/userRoute.js`)

### Frontend (Customer) Authentication
- **`POST /api/user/send-otp`**
  - **Payload**: `{ phone: "9876543210" }`
  - **Logic**: Automatically creates a new user if the phone doesn't exist. Generates a 6-digit OTP, sets the expiry, and simulates sending an SMS by logging the OTP to the active terminal.
  
- **`POST /api/user/verify-otp`**
  - **Payload**: `{ phone: "9876543210", otp: "123456" }`
  - **Logic**: Verifies the OTP against the database and checks the expiry timestamp. If valid, it clears the OTP data, signs a JWT (JSON Web Token), and authenticates the user.

### Admin/Owner Authentication
- **`POST /api/user/admin`**
  - **Payload**: `{ email: "admin@domain.com", password: "securepassword" }`
  - **Logic**: Standard email/password verification using `bcrypt`. Ensures the user's role is `admin` or `owner` before returning the JWT.

---

## Future Action: Integrating a Real SMS Node

Currently, the OTP logic is securely functioning, but the actual SMS dispatch is disabled locally to save costs. The generated test OTP is returned to the frontend and displayed directly as a success notification popup on your screen (and also printed to the backend terminal for logging purposes).

**Before going to production**, you must replace this simulation with a real SMS API (e.g. Fast2SMS, MSG91, Twilio). 

### How to implement SMS:
1. Open `backend/controllers/userController.js`.
2. Locate the `sendOTP` function on Line 39.
3. Replace the `console.log` simulation with your provider's API.

**Example implementation using Fast2SMS:**
```javascript
import axios from 'axios';

// Drop this code into the sendOTP function just before res.json()
try {
    await axios.post('https://www.fast2sms.com/dev/bulkV2', {
        route: 'v3',
        sender_id: 'TXTIND',
        message: `Your Revil verification code is: ${otp}`,
        language: 'english',
        flash: 0,
        numbers: phone,
    }, {
        headers: { authorization: process.env.FAST2SMS_API_KEY } // Add key to .env
    });
} catch (smsError) {
    console.log("Failed to send real SMS:", smsError.message);
}
```
