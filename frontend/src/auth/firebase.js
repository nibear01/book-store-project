// // src/firebase.js
// import { initializeApp } from "firebase/app";
// import { getAuth, GoogleAuthProvider } from "firebase/auth";
// import { getAnalytics, isSupported } from "firebase/analytics";

// const firebaseConfig = {
//     apiKey: "AIzaSyCsrtJupTH_pvqxRUiAbXSaUXv50bgElgk",
//     authDomain: "bookstore-app-bb468.firebaseapp.com",
//     projectId: "bookstore-app-bb468",
//     storageBucket: "bookstore-app-bb468.firebasestorage.app",
//     messagingSenderId: "738934245379",
//     appId: "1:738934245379:web:28893bc7f3fac907596636",
//     measurementId: "G-6XF2V0Q0CN",
// };

// export const app = initializeApp(firebaseConfig);

// // Avoid analytics errors on SSR / unsupported envs
// isSupported().then((ok) => {
//     if (ok) getAnalytics(app);
// });

// export const auth = getAuth(app);
// export const googleProvider = new GoogleAuthProvider();
// googleProvider.setCustomParameters({ prompt: "select_account" });