const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;

exports.signup = async (req, res) => {
  try {
    const hashedPassword = bcrypt.hashSync(req.body.password, 8);
    const user = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword
    });

    const roles = req.body.roles
      ? await Role.find({ name: { $in: req.body.roles } })
      : [await Role.findOne({ name: "user" })];

    user.roles = roles.map(role => role._id);
    await user.save();

    res.send({ message: "User registered successfully!" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.signin = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username }).populate("roles");
    // can populate specific things we want ..by mentioning those .populate("rows","name")
    //or by removing which we dont want ..like .populate("role","-id")..etc
    if (!user) return res.status(404).send({ message: "User not found." });

    const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    if (!passwordIsValid) return res.status(401).send({ message: "Invalid password!" });

    const token = jwt.sign({ id: user.id }, config.secret, { expiresIn: 86400 });

    const authorities = user.roles.map(role => "ROLE_" + role.name.toUpperCase());

    res.status(200).send({
      id: user._id,
      username: user.username,
      email: user.email,
      roles: authorities,
      accessToken: token
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
