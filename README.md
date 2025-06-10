# 🌴 Holiday Hub - Full Stack Travel Booking Website

**Holiday Hub**  is a feature-rich full stack travel booking platform where users can explore destinations, create bookings, write reviews, and manage their account. Users can manage listings, while a background job scheduler maintains the database by cleaning up inactive users.

> 🚀 Live Demo: https://wanderlust-6vll.onrender.com

---

## 📁 Project Structure


---

## 🌟 Features

### 🔐 Authentication
- User signup, login, logout
- Session management with `express-session`
- Secure authentication via passport.js
- Email validation and restrictions

### 📍 Listings
- Add/Edit/Delete listings (with image uploads via Cloudinary)
- View destination details with maps (Mapbox integration)
- Price, description, images, and location metadata

### 🧳 Booking System
- Authenticated users can book listings
- Date validations (check-in, check-out)

### 🌍 Reviews
- Leave ratings and textual reviews

### ☁️ Image Upload
- Cloudinary integration for image hosting
- Upload during listing creation/edit
- Delete images during update

### 📬 Email + Scheduler
- Confirmation and notification emails
- `node-cron` job runs to remove unverified accounts after a certain period

### 🛡️ Form Validation
- Server-side input validation using Joi

---

## 🛠️ Tech Stack

| Technology | Usage |
|------------|-------|
| **Frontend** | HTML5, CSS3, Bootstrap 5, JavaScript |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose |
| **Templating Engine** | EJS |
| **Auth** | express-session, passport.js |
| **File Hosting** | Cloudinary |
| **Email** | Nodemailer |
| **Geocoding** | Mapbox |
| **Scheduling** | node-cron |

---

## ⚙️ Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/srinadh-ghattamneni/HolidayHub.git
   cd HolidayHub
2. npm install
3. Set up environment variables
4. setup MongoDb
5. run the project: Node app.js


## ⭐ Support

If you like this project, please consider giving it a ⭐ on [GitHub](https://github.com/srinadh-ghattamneni/HolidayHub) — it helps others discover it and keeps me motivated! 😊



