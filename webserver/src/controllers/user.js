export class User {
	getUser(req, res) {
		return res.json(req.user);
	}
}
