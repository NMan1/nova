import $ from "jquery";
import axios from "axios";

export const serverurl = "http://localhost:3000";

function getInputFields(loginType) {
	const nameInput = $("#name-input").val();

	let emailInput = "";
	if (loginType === "signin") {
		emailInput = $(".email-input").eq(0).val();
	} else if (loginType === "signup") {
		emailInput = $(".email-input").eq(1).val();
	} else if (loginType === "forgot-password") {
		emailInput = $(".email-input").eq(2).val();
	}

	const passwordInput =
		loginType == "signin"
			? $(".password-input").eq(0).val()
			: $(".password-input").eq(1).val();

	return {
		name: nameInput,
		email: emailInput,
		password: passwordInput,
	};
}

$(() => {
	const passwordWarning = $("#password-warning");
	const signinInvalid = $("#invalid-login");

	$("#signup-form").on("submit", (event) => {
		event.preventDefault();
		const { name, email, password } = getInputFields("signup");

		if (password.length < 8) {
			passwordWarning.show();
			passwordWarning.css("margin-bottom", "20px");
			$(".signup.password-input").css("margin-bottom", "0px");
			return false;
		}

		axios
			.post(serverurl + "/api/register", {
				name: name,
				email: email,
				password: password,
			})
			.then(
				(response) => {
					console.log(response);
					window.location.reload();
				},
				(error) => {}
			);

		return false;
	});

	$("#signin-form").on("submit", (event) => {
		event.preventDefault();
		const { name, email, password } = getInputFields("signin");

		axios
			.post(serverurl + "/api/login", {
				email: email,
				password: password,
			})
			.then(
				(response) => {
					signinInvalid.hide();

					if (response.status == 200) {
						window.location.reload();
					}
				},
				(error) => {
					event.preventDefault();
					signinInvalid.show();
				}
			);
	});

	$("#forgot-password-form").on("submit", (event) => {
		event.preventDefault();
		console.log(getInputFields("forgot-password"));
		return false;
	});
});
