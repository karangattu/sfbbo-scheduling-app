# SFBBO Scheduling App

A React-based event scheduling and signup application for the San Francisco Bay Bird Observatory (SFBBO). This application allows volunteers to view, sign up for, and manage bird observatory events and activities.

## Features

- 📅 **Event Calendar**: Browse upcoming SFBBO events and activities
- 👥 **Volunteer Signup**: Easy registration for events with capacity management
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🔥 **Firebase Integration**: Real-time data synchronization and hosting
- 📧 **Calendar Integration**: Add events directly to personal calendars
- 🌙 **Dark Mode Support**: Toggle between light and dark themes
- ♿ **Accessibility**: Built with accessibility best practices

## Tech Stack

- **Frontend**: React 18, Tailwind CSS
- **Backend**: Firebase (Firestore, Hosting)
- **Icons**: Lucide React
- **Calendar**: Add-to-Calendar Button React
- **Build Tool**: Create React App

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- Firebase CLI (for deployment)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/karangattu/sfbbo-scheduling-app.git
   cd sfbbo-scheduling-app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up Firebase configuration:
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Add your Firebase config to `src/firebase.js`

4. Start the development server:

   ```bash
   npm start
   ```

The app will open at [http://localhost:3000](http://localhost:3000).

## Available Scripts

### `npm start`

Runs the app in development mode. The page will reload when you make changes.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder with optimized performance.

### `npm run deploy`

Builds and deploys the app to Firebase Hosting.

### `npm run deploy:hosting`

Deploys only the hosting component to Firebase.

## Project Structure

```text
src/
├── App.js              # Main application component
├── firebase.js         # Firebase configuration and operations
├── App.css            # Global styles
├── index.js           # React app entry point
└── sfbbo_logo.png     # SFBBO logo asset
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Deployment

This app is configured for deployment on Firebase Hosting. Use `npm run deploy` to build and deploy the application.

## License

This project is developed for the San Francisco Bay Bird Observatory.
