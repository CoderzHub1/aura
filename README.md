# 🌟 Aura – Your Smart AI Home Assistant

**Aura** is a tech-powered AI home automation web application that combines gesture recognition, distress detection, and voice interaction to create a seamless smart home experience. Built using **Next.js** and **MongoDB**, Aura is your intelligent assistant that’s always listening (but only when you want it to).

---

## 🚀 Features

- 👋 **Gesture Control**  
  Activate or deactivate Aura with simple hand gestures.

- 🆘 **Distress Detection**  
  Automatically detects signs of distress to ensure safety and quick responses.

- 🗣️ **Wake Word Activation**  
  Say **"Hey"** to trigger speech recognition and interact naturally.

- 🤖 **AI-Powered Responses**  
  Ask Aura anything—from home controls to general queries—and get smart responses.

---

## 🛠️ Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/)
- **Backend**: [Node.js](https://nodejs.org/),
- **Database**: [MongoDB](https://www.mongodb.com/)
- **AI/ML**: Gemini API
- **Speech Recognition**: Integrated voice interface triggered by wake word

---

## 📁 Folder Structure

/aura ├── components # Reusable React components ├── pages # Next.js routing and UI pages ├── public # Static assets ├── utils # Utility functions and helpers ├── models # Mongoose models (MongoDB) └── ... # Other config and supporting files


---

## ⚙️ Getting Started

Follow these steps to set up Aura locally on your machine.

### 1. Clone the Repository

```bash
git clone https://github.com/CoderzHub1/aura.git
cd aura
```
### 2. Install Dependencies

```bash
npm install
```
### 3. Set Up Environment Variables
Create a .env.local file in the root directory and add the following:

```ini
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY='yourAPIKEY'
AppPassword = 'yourAPPpassword'
NEXT_PUBLIC_API_URL=your_api_url_if_any
```
### 4. Run the Development Server
```bash
npm run dev
```
Visit http://localhost:3000 in your browser to use the app.
