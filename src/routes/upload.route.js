const { Router } = require("express");
const isAuthenticate = require("../middlewares/authentication");
const upload = require("../middlewares/multer");
const cloudinaryUpload = require("../utils/cloudinaryUpload");
const pool = require("../db/db");

const router = Router();

router.post(
  "/upload/avatar",
  isAuthenticate,
  upload.single("avatar"),
  async (req, res) => {
    try {
      const { buffer } = req.file;
      const result = await cloudinaryUpload(buffer);

      res.json({ message: "Successfully uploaded avatar", result });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
);

router.delete("/delete/avatar", isAuthenticate, async (req, res) => {
  try {
    const id = req.user.id;
    const { rows } = await pool.query(
      "UPDATE profiles SET avatar_url = NULL WHERE user_id = $1 RETURNING bio, avatar_url, birth",
      [id],
    );
    console.log(rows);
    return res.status(200).json({ message: "Deleted Avatar" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
