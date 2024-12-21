import $ from "jquery";
import axios from "axios";
import { intializeUser, toggleSigninupBtns } from "../frontEnd/pageControls";
import { serverurl } from "./auth";

axios.defaults.withCredentials = true;

$(() => {
	axios
		.get(serverurl + "/api/user")
		.then(
			(response) => {
				toggleSigninupBtns(true);
				intializeUser(response.data);
			},
			(error) => {
				toggleSigninupBtns(false);
			}
		)
		.catch(() => {
			toggleSigninupBtns(false);
		});
});
