import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import admin from "firebase-admin";
import { readFile } from "fs/promises";

export { admin };

const serviceAccount = JSON.parse(
	await readFile(new URL("../FirebaseService.json", import.meta.url))
);

const firebaseConfig = {
	apiKey: "AIzaSyDpguIQfpUaUEdQaIbva8BTPx4vjcJL6m4",
	authDomain: "nova-a6beb.firebaseapp.com",
	projectId: "nova-a6beb",
	storageBucket: "nova-a6beb.firebasestorage.app",
	messagingSenderId: "161358604257",
	appId: "1:161358604257:web:8cb2ced3a970eab2c394a0",
};

const firebaseApp = initializeApp(firebaseConfig);
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

export const auth = getAuth(firebaseApp);
