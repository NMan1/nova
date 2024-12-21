import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
	sendEmailVerification,
	sendPasswordResetEmail,
	updateProfile,
} from "firebase/auth";
import { auth } from "../firebase.js";

export class FirebaseAuthController {
	registerUser(req, res) {
		const { name, email, password } = req.body;
		if (!email || !password) {
			return res.status(422).json({
				email: "Email is required",
				password: "Password is required",
			});
		}

		createUserWithEmailAndPassword(auth, email, password)
			.then((userCredential) => {
				updateProfile(userCredential.user, { displayName: name });

				sendEmailVerification(auth.currentUser)
					.then(() => {
						res.status(201).json({
							message: "Verification email sent! User created successfully!",
						});
					})
					.catch((error) => {
						console.error(error);
						res.status(500).json({ error: "Error sending email verification" });
					});
			})
			.catch((error) => {
				const errorMessage =
					error.message || "An error occurred while registering user";
				res.status(500).json({ error: errorMessage });
			});
	}

	loginUser(req, res) {
		const { email, password } = req.body;
		if (!email || !password) {
			return res.status(422).json({
				email: "Email is required",
				password: "Password is required",
			});
		}

		signInWithEmailAndPassword(auth, email, password)
			.then((userCredential) => {
				const idToken = userCredential._tokenResponse.idToken;
				if (idToken) {
					res.cookie("access_token", idToken, {
						httpOnly: true,
					});
					res
						.status(200)
						.json({ message: "User logged in successfully", userCredential });
				} else {
					res.status(500).json({ error: "Internal Server Error" });
				}
			})
			.catch((error) => {
				const errorMessage =
					error.message || "An error occurred while logging in";
				res.status(500).json({ error: errorMessage });
			});
	}

	logoutUser(req, res) {
		signOut(auth)
			.then(() => {
				res.clearCookie("access_token");
				res.status(200).json({ message: "User logged out successfully" });
			})
			.catch((error) => {
				res.status(500).json({ error: "Internal Server Error" });
			});
	}

	resetPassword(req, res) {
		const { email } = req.body;
		if (!email) {
			return res.status(422).json({
				email: "Email is required",
			});
		}

		sendPasswordResetEmail(auth, email)
			.then(() => {
				res
					.status(200)
					.json({ message: "Password reset email sent successfully!" });
			})
			.catch((error) => {
				console.error(error);
				res.status(500).json({ error: "Internal Server Error" });
			});
	}
}
