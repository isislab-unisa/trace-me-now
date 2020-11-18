db.createUser({
	user: "root",
	pwd: "root",
	roles: [
		{ role: "userAdmin", db: "globalStatus" },
		{ role: "dbAdmin", db: "globalStatus"},
		{ role: "readWrite", db: "globalStatus" }
	]
})
