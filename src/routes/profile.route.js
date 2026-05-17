const { Router } = require("express");
const isAuthenticate = require("../middlewares/authentication");
const { validateProfile } = require("../schemas/validation.schema");
const pool = require("../db/db");
const router = Router();

router.post("/profile", isAuthenticate, async (req, res) => {
  try {
    const { bio, avatar_url, birth, hobbies } = req.body;
    const parsedData = await validateProfile.safeParse({
      bio,
      avatar_url,
      birth,
    });

    if (!parsedData.success) {
      throw { status: 400, message: parsedData.error.issues };
    }
    const { rows } = await pool.query(
      "INSERT INTO profiles (user_id, bio, avatar_url, birth) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id) DO UPDATE SET bio = EXCLUDED.bio, avatar_url = EXCLUDED.avatar_url, birth = EXCLUDED.birth RETURNING bio, avatar_url, birth",
      [
        req.user.id,
        parsedData.data.bio,
        parsedData.data.avatar_url,
        parsedData.data.birth,
      ],
    );
    console.log(rows[0]);
    return res.status(200).json(rows[0]);
  } catch (err) {
    console.log(err);
    return res
      .status(err.status || 500)
      .json(err.message || "Internal server error");
  }
});

router.get("/profile", isAuthenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM profiles WHERE user_id = $1",
      [req.user.id],
    );
    return res.status(200).json(rows[0]);
  } catch (err) {
    console.log(err);
    return res.status(500).json("Internal server error");
  }
});

module.exports = router;
