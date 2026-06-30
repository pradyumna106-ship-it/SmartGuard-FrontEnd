# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
# SmartGuard-FrontEnd

SmartGuard-FrontEnd is the web dashboard for the SmartGuard ecosystem. Built with **React** and **Vite**, it provides real-time monitoring of IoT devices, Wi-Fi signal (RSSI) analysis, motion detection status, and live CCTV observation with AI-powered object detection.

---

## Features

- 📊 Real-time Device Dashboard
- 📶 Live RSSI Monitoring
- 📡 Wi-Fi Motion Detection Status
- 🚶 PIR Motion Detection Monitoring
- 🎥 Live CCTV/IP Camera Observation
- 🤖 AI Object Detection using MediaPipe
- 🔐 JWT Authentication
- 👤 User Profile Management
- 📱 Responsive User Interface
- ⚡ Fast development with Vite
- 🔄 Real-time API Integration

---

## Tech Stack

- React
- Vite
- JavaScript
- Axios
- React Router
- Tailwind CSS
- MediaPipe Tasks Vision

---

## Backend Services

| Service | Technology |
|---------|------------|
| Gateway | Node.js + Express |
| API v1 | Java Spring Boot |
| API v2 | Python Flask |

---

## Dashboard Modules

- Dashboard
- Device Monitoring
- RSSI Monitoring
- Wi-Fi Motion Detection
- PIR Motion Detection
- CCTV Observation
- AI Object Detection
- User Profile
- Authentication

---

## Project Structure

```
SmartGuard-FrontEnd
│
├── src/
│   ├── api/
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   ├── utils/
│   └── App.jsx
│
├── public/
├── .env
├── package.json
└── README.md
```

---

## Installation

Clone the repository.

```bash
git clone https://github.com/your-username/SmartGuard-FrontEnd.git
```

Navigate to the project directory.

```bash
cd SmartGuard-FrontEnd
```

Install dependencies.

```bash
npm install
```

---

## Environment Configuration

Create a `.env` file in the project root.

Example:

```env
VITE_API_BASE_URL=http://localhost:3000
```

---

## Running the Application

Development

```bash
npm run dev
```

Production Build

```bash
npm run build
```

Preview Production Build

```bash
npm run preview
```

---

## System Architecture

```
ESP32 Device
     │
     ▼
C++ (Arduino Framework)
     │
     ▼
Python Flask Server (Device Service)
     │
     ▼
SmartGuard Gateway (Node.js + Express)
     │
     ▼
React Dashboard
```

---

## Data Flow

1. **ESP32** monitors Wi-Fi signal (RSSI) and optional PIR motion sensor.
2. The **Arduino (C++) firmware** sends motion and device data to the **Python Flask Server**.
3. The **Flask Server** processes device requests and exposes REST APIs.
4. The **SmartGuard Gateway (Express.js)** authenticates requests using JWT and routes API requests.
5. The **React Dashboard** communicates only with the Gateway to display:
   - 📶 RSSI Monitoring
   - 🚶 Motion Detection Status
   - 🎥 Live CCTV Observation
   - 🤖 AI Object Detection
   - 📡 Device Status

## Future Improvements

- Real-time Notifications
- Historical Analytics
- Camera Recording
- Multi-Camera Support
- Device Management
- Dark Mode
- Docker Deployment
- Progressive Web App (PWA)

---

## License

This project is intended for educational and personal use.

---

## Author

Developed by **J. Pradyumna**