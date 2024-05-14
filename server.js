const sqlite = require('sqlite3').verbose();
let db = my_database('./gallery.db');

// Express application `app`:
var express = require("express");
var app = express();

// Middleware to parse JSON data in the body of our HTTP requests:
app.use(express.json());

// Retrieve the full data set of photos
app.get("/photos", function(req, res) {
	db.all(`SELECT author, alt, tags, image, description FROM gallery`, function(err, rows) {
		if (err) {
		    return res.status(400).send(err);
	    } else {
	        return res.status(200).json(rows);
	    }
	});
});

// Create data for a new photo item
app.post("/photos", function(req, res) {
	let newPhoto = req.body;
	db.run(`INSERT INTO gallery (author, alt, tags, image, description)
	VALUES (?, ?, ?, ?, ?)`,
	[newPhoto['author'], newPhoto['alt'], newPhoto['tags'], newPhoto['image'],  newPhoto['description']], function(err) {
		if (err) {
		    return res.status(400).send(err);
	    } else {
	        return res.status(201).json(newPhoto);
		}
	});
});

// Retrieve data of a specific photo item
app.get("/photos/:id", function(req, res) {
    let id = req.params.id;
    db.get(`SELECT author, alt, tags, image, description FROM gallery WHERE id=?`, [id], function(err, row) {
        if (err) {
            return res.status(400).send(err);
        } 
		if (row) {
            return res.status(200).json(row);
        } else {
            return res.status(404).send(err);
        }
    });
});

// Update data of a specific photo item
app.put("/photos/:id", function(req, res) {
    let id = req.params.id;
	let updatedPhoto = req.body;
	db.get(`SELECT * FROM gallery WHERE id=?`, [id], function(err, row) {
		if (err) {
		    return res.status(400).send(err);
	    }
		if (row) {
			db.run(`UPDATE gallery SET author=?, alt=?, tags=?, image=?, description=? WHERE id=?`,
                [updatedPhoto['author'], updatedPhoto['alt'], updatedPhoto['tags'], updatedPhoto['image'], updatedPhoto['description'], [id]],
				function(err) {
			        if (err) {
				        return res.status(400).send(err);
			        }
			        return res.status(204).send();
		    });
		} else {
		    return res.status(404).send(err);
		}
	});
});

// Delete data of a specific photo item
app.delete("/photos/:id", function(req, res) {
    let id = req.params.id;
	db.get(`SELECT * FROM gallery WHERE id=?`, [id], function(err, row) {
		if (err) {
		    return res.status(400).send(err);
	    }
		if (row) {
		    db.run(`DELETE FROM gallery WHERE id=?`, [id], function(err) {
			    if (err) {
				    return res.status(400).send(err);
			    }
			    return res.status(204).send();
		    });
		} else {
		    return res.status(404).send(err);
		}
	});
});

// Server start
app.listen(3002);
console.log("Your Web server should be up and running, waiting for requests to come in. Try http://localhost:3002/photos");

// Some helper functions called above
function my_database(filename) {
	// Connect to db by opening filename, create filename if it does not exist:
	var db = new sqlite.Database(filename, (err) => {
  		if (err) {
			console.error(err.message);
  		}
  		console.log('Connected to the photo database.');
	});
	// Create our gallery table if it does not exist already:
	db.serialize(() => {
		db.run(`
        	CREATE TABLE IF NOT EXISTS gallery
        	(
                id INTEGER PRIMARY KEY,
                author CHAR(100) NOT NULL,
                alt CHAR(100) NOT NULL,
                tags CHAR(256) NOT NULL,
                image char(2048) NOT NULL,
                description CHAR(1024) NOT NULL
		    )
		`);
		db.all(`select count(*) as count from gallery`, function(err, result) {
			if (result[0].count == 0) {
				db.run(`INSERT INTO gallery (author, alt, tags, image, description) VALUES (?, ?, ?, ?, ?)`, [
        			"Tim Berners-Lee",
        			"Image of Berners-Lee",
        			"html,http,url,cern,mit",
        			"https://upload.wikimedia.org/wikipedia/commons/9/9d/Sir_Tim_Berners-Lee.jpg",
        			"The internet and the Web aren't the same thing."
    				]);
				db.run(`INSERT INTO gallery (author, alt, tags, image, description) VALUES (?, ?, ?, ?, ?)`, [
        			"Grace Hopper",
        			"Image of Grace Hopper at the UNIVAC I console",
        			"programming,linking,navy",
        			"https://upload.wikimedia.org/wikipedia/commons/3/37/Grace_Hopper_and_UNIVAC.jpg",
				    "Grace was very curious as a child; this was a lifelong trait. At the age of seven, she decided to determine how an alarm clock worked and dismantled seven alarm clocks before her mother realized what she was doing (she was then limited to one clock)."
    				]);
				console.log('Inserted dummy photo entry into empty database');
			} else {
				console.log("Database already contains", result[0].count, " item(s) at startup.");
			}
		});
	});
	return db;
}