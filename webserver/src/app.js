import cookieParser from "cookie-parser";
import express from "express";
import { router } from "./routes/routes.js";

const PORT = 3000;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(router);

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
