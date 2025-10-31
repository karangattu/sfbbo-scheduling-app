# SFBBO Event Signup App

A professional event scheduling and signup application for SFBBO (San Francisco Bay Area Breastfeeding & Birth Options) volunteer management and event coordination.

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run start
```

Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
```

Creates an optimized production build in the `build/` folder.

### Deploy to Firebase

```bash
firebase deploy
```

## Project Structure

```bash
src/
├── App.js              # Main application component
├── App.css             # App-specific styles
├── index.js            # React entry point
├── index.css           # Global styles & Tailwind
└── firebase.js         # Firebase configuration & operations

public/
├── index.html          # HTML entry point
└── manifest.json       # PWA manifest

build/                  # Production build (generated)
```

## Available Scripts

- `npm start` - Run development server
- `npm run build` - Create production build

## Environment Variables

Create a `.env` file with your Firebase configuration:

```bash
REACT_APP_FIREBASE_API_KEY=your_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain_here
REACT_APP_FIREBASE_PROJECT_ID=your_project_id_here
REACT_APP_FIREBASE_STORAGE_BUCKET=your_bucket_here
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
REACT_APP_FIREBASE_APP_ID=your_app_id_here
```
