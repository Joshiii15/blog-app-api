const User = require("../models/User");
const bcrypt = require("bcrypt");
const auth = require("../auth");
const { errorHandler } = auth;

// User Registration
module.exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  //Validate email
  if (!email.includes("@")) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (password.length < 8) {
    return res
      .status(400)
      .json({ message: "Password must be at least 8 characters long" });
  }

  try {
    //Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    //Create a new user document, secure password thru bcrypt
    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = new User({ name, email, password: hashedPassword });
    const result = await newUser.save();
    return res.status(201).json({ message: "Registered Successfully" });
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

//User Login
module.exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  //Validate email
  if (!email.includes("@")) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  try {
    //Find user by emai;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "No email found" });
    }

    //Check if the password is correct
    const isPasswordCorrect = bcrypt.compareSync(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    // Generate access token
    const accessToken = auth.createAccessToken(user);
    return res.status(200).json({ access: accessToken });
  } catch (error) {
    return errorHandler(error, req, res);
  }
};
