db.createUser({
	user: "root",
	pwd: "root",
	roles: [
		{ role: "userAdmin", db: "globalStatus" },
		{ role: "dbAdmin", db: "globalStatu"},
		{ role: "readWrite", db: "globalStatus" }
	]
})
