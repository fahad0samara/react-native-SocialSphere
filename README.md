# SocialSphere

A modern social networking application built with React Native and Expo, featuring real-time interactions, beautiful UI, and comprehensive social features.

## 🚀 Features

- 📱 Cross-platform (iOS, Android, Web) support
- 🔥 Firebase Integration (Authentication, Firestore, Storage)
- 👥 Rich social features (profiles, posts, comments)
- 🎨 Modern UI with animations
- 🌍 Internationalization support
- 📸 Image handling and upload capabilities
- 🏃‍♂️ High-performance list rendering
- 💾 Local storage management
- 🔔 Push notifications
- 🌙 Dark mode support

## 📚 Tech Stack

### Core
- React Native 0.74.5
- Expo SDK 52.0.0
- TypeScript
- Expo Router 2.0.0

### State Management & Data
- Zustand for state management
- @react-native-async-storage/async-storage for local storage
- Firebase (Authentication, Firestore, Storage)

### UI Components & Styling
- @shopify/flash-list for high-performance lists
- react-native-reanimated for animations
- lottie-react-native for beautiful animations
- expo-image for optimized image handling
- @expo/vector-icons for icons

### Features & Utilities
- expo-notifications for push notifications
- expo-image-picker for image selection
- i18n-js & expo-localization for internationalization
- date-fns for date manipulation

### Development Tools
- ESLint with TypeScript support
- Prettier for code formatting
- Jest for testing

## 🛠️ Setup & Installation

1. **Prerequisites**
   ```bash
   # Install Node.js (v18 or higher)
   # Install Expo CLI
   npm install -g expo-cli
   ```

2. **Installation**
   ```bash
   # Clone the repository
   git clone https://github.com/yourusername/social-sphere.git
   cd social-sphere

   # Install dependencies
   npm install --legacy-peer-deps
   ```

3. **Environment Setup**
   - Create a `.env` file in the root directory
   - Add your Firebase configuration
   ```env
   FIREBASE_API_KEY=your_api_key
   FIREBASE_AUTH_DOMAIN=your_auth_domain
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_storage_bucket
   FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   FIREBASE_APP_ID=your_app_id
   ```

## 📱 Running the App

```bash
# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on Web
npm run web
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run linting
npm run lint

# Format code
npm run format
```

## 📦 Building for Production

```bash
# Build for Android
npm run build:android

# Build for iOS
npm run build:ios
```

## 📂 Project Structure

```
social-sphere/
├── app/                   # App navigation and screens
│   ├── (auth)/           # Authentication screens
│   ├── (tabs)/           # Main tab screens
│   └── _layout.tsx       # Root layout
├── components/           # Reusable components
├── constants/           # App constants and theme
├── hooks/              # Custom hooks
├── services/          # API and service integrations
├── store/             # State management
├── types/             # TypeScript types
├── utils/             # Utility functions
└── assets/            # Images, fonts, etc.
```

## 🔧 Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web
- `npm test` - Run tests
- `npm run lint` - Check code for errors
- `npm run format` - Format code using Prettier
- `npm run build:android` - Build Android app
- `npm run build:ios` - Build iOS app

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- [Expo](https://expo.dev/)
- [React Native](https://reactnative.dev/)
- [Firebase](https://firebase.google.com/)
- All other open-source libraries used in this project

---

Made with ❤️ by SocialSphere Team
