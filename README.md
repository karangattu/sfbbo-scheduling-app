# SFBBO Scheduling App

A React-based event scheduling and signup application for the San Francisco Bay Bird Observatory (SFBBO). This application allows volunteers to view, sign up for, and manage bird observatory events and activities.

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

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Deployment

This app is configured for deployment on Firebase Hosting. Use `npm run deploy` to build and deploy the application.
