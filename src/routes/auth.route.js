const { Router } = require("express");
const argon2 = require("argon2");
const router = Router();
const pool = require("../db/db");
const {
  ValidateSignup,
  validateLogin,
} = require("../schemas/validation.schema");
const jwt = require("jsonwebtoken");
const { id } = require("zod/locales");
const isAuthenticate = require("../middlewares/authentication");

router.post("/auth/signup", async (req, res) => {
  try {
    //validate input
    const { name, username, email, password } = req.body;
    const data = await ValidateSignup.safeParse({
      name,
      username,
      email,
      password,
    });
    let obj = {
      sucessMessage: {},
      errMessage: {},
    };
    if (!data.success) {
      for (let err of data.error.issues) {
        const key = err.path[0];
        const value = err.message;
        obj.errMessage = { ...obj.errMessage, [key]: value };
      }
      throw { status: 400, message: { ...obj.errMessage } };
    } else {
      obj.sucessMessage = { ...data.data };
    }

    //check in db is user already exist or not
    //inside db the constraint for email is unique so it cannot bypass this step;

    // hashed the password
    const hashedPassword = await argon2.hash(password);

    //insert in database
    const result = await pool.query(
      "INSERT INTO users (name, username, email, password) VALUES ($1, $2, $3, $4) RETURNING id, name, username, email",
      [
        obj.sucessMessage.name,
        obj.sucessMessage.username,
        obj.sucessMessage.email,
        hashedPassword,
      ],
    );

    //generate jsonwebtoken
    const user = { ...result.rows[0].user };
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    // response send
    res.cookie("token", token);
    return res.status(200).json({ message: "Signup Successfull" });
  } catch (err) {
    console.log(err);
    if (err.code === "23505") {
      return res.status(409).json({ error: "Resource already exists" });
    }
    return res.status(err.status || 500).json(err.message || err);
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    //validate req body
    const { email, password } = req.body;
    const isValidated = validateLogin.safeParse({ email, password });
    let validatedData = {
      sucessMessage: {},
      errMessage: {},
    };
    if (!isValidated.success) {
      for (let err of isValidated.error.issues) {
        const key = err.path[0];
        const value = err.message;
        validatedData.errMessage = {
          ...validatedData.errMessage,
          [key]: value,
        };
      }
      throw { status: 400, message: { ...validatedData.errMessage } };
    } else {
      validatedData.sucessMessage = { ...isValidated.data };
    }

    //find user
    const { rows } = await pool.query(
      "SELECT id, email, password FROM users WHERE email = $1",
      [validatedData.sucessMessage.email],
    );
    const user = rows[0];

    if (!user) throw { status: 400, message: "Invalid Credentials" };

    //comapre password
    const isPasswordCorrect = await argon2.verify(
      user.password,
      validatedData.sucessMessage.password,
    );

    if (!isPasswordCorrect) throw { status: 401, message: "Unauthorized" };

    //generate jwt token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );
    //send response
    res.cookie("token", token);
    return res.status(200).json({ message: "Login Successfull" });
  } catch (err) {
    console.log(err);
    return res
      .status(err.staus || 500)
      .json(err.message || "Internal Server Error");
  }
});

router.post("/auth/logout", isAuthenticate, async (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({ message: "Logout Successfull" });
});

module.exports = router;
