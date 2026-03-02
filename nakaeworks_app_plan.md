# NakaeWorks React Native CLI App Implementation Plan

This document outlines the step-by-step plan to develop the NakaeWorks mobile application using React Native CLI (without Expo) to mirror the core functionalities of the user web portal.

## Phase 1: Project Initialization & Setup
1. **Initialize Project:** Create a new React Native CLI project (`UserApp`).
2. **Setup Dependencies:** Install core libraries (React Navigation, Axios, `@tanstack/react-query`, Async Storage, React Native Reanimated, Lucide React Native/Vector Icons, NativeWind for Tailwind styling).
3. **Folder Structure Setup:** Create familiar folders mapping to the web: `src/components`, `src/screens`, `src/navigation`, `src/context`, `src/services`, `src/utils`.
4. **Theme & Context:** Port the `ThemeContext`, `AuthContext`, `CartContext`, and `FavoriteContext` from React to React Native using `@react-native-async-storage/async-storage`.

## Phase 2: Navigation & Core Layout
1. **Root Navigation:** Set up Authentication Stack vs. App Stack inside NavigationContainer.
2. **Bottom Tabs:** Create a Bottom Tab Navigator for main sections: 
   - **Home:** Categories, Featured Services
   - **Search/Services:** Browse all services with filters
   - **Cart:** Shopping Cart
   - **Favorites:** Saved items
   - **Profile:** User settings & History
3. **App Header:** Build a custom header with logo and location selector.

## Phase 3: Screen Development - MVP Actions
1. **Auth Screens:** Login, Register, Forgot Password. Use secure storage for JWT tokens.
2. **Home Screen:** Recreate the web Hero section, Categories slider, and top providers using React Native `ScrollView` and `FlatList`.
3. **Services Screen:** Implement the grid view of services, integrating the APIs. Add filters (modal/bottom sheet).
4. **Service Detail Screen:** Images, provider info, reviews, "Add to Cart" and "Book Now" actions.
5. **Cart & Favorites Screen:** Replicate the web logic for displaying pending checkout items.

## Phase 4: Checkout & Profile Integration
1. **Checkout Flow/Booking Confirm:** Date/Time pickers, address selection, payment summary.
2. **Booking Success:** "Booking Confirmed" animated screen.
3. **Profile Control Center:** 
   - Order History / Missions
   - Secure coordinates/addresses
   - User intel (Profile Edit)
   - Real-time password updates.

## Phase 5: Polish & Backend Connection
1. **API Integration:** Ensure API base URLs point accurately to the `.NET` backend (`http://10.0.2.2:5000` for Android Emulator or LAN IP).
2. **Native Modules & Styling:** Link native assets (fonts/icons) and add smooth transitions, premium color themes (Navy/Dark), and micro-animations mirroring the web aesthetic.
3. **Testing:** Test extensively on both Android emulator and iOS simulator (if available on Mac) or real devices via metro bundler.

---

### Immediate Next Steps to execute today:
- Run `npx @react-native-community/cli@latest init UserApp` to initialize the project folder in `nakaeworks`.
- Configure `Nativewind` (for Tailwind CSS in React Native CLI) to easily reuse our web styling language.
- Set up the main navigator and configure `QueryClientProvider` from `@tanstack/react-query` to handle all API/state caching exactly like the web.
