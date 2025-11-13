const express = require("express");
const cors = require("cors");
const dbConfig = require("./app/config/db.config");

const app = express();

let corsOptions = {
  origin: "http://localhost:8081"
};
app.use(cors(corsOptions));
// cors here is optional as there isnt any frontend to consume the api..
// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const db = require("./app/models");
const Role = db.role;

db.mongoose
  .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to my application." });
});

// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);

// set port, listen for requests
const PORT =  8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

function initial() {
  Role.estimatedDocumentCount((err, count) => {
    if (err) {
      console.log("Error counting roles:", err);
      return;
    }

    if (count === 0) {
      const roles = ["user", "moderator", "admin"];
      roles.forEach(roleName => {
        new Role({ name: roleName }).save(err => {
          if (err) console.log("Error adding role:", roleName, err);
          else console.log(`Added '${roleName}' to roles collection`);
        });
      });
    }
  });
}
