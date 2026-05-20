const { Router } = require("express");
const isAuthenticate = require("../middlewares/authentication");
const upload = require("../middlewares/multer");
const cloudinaryUpload = require("../utils/cloudinaryUpload");
const pool = require("../db/db");

const router = Router();

/**
 * @swagger
 * /api/upload/avatar:
 *   post:
 *     summary: Upload an avatar image
 *     description: Uploads an avatar file for the authenticated user and returns the Cloudinary upload result.
 *     tags:
 *       - Upload
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AvatarUploadResponse'
 *       401:
 *         description: Missing, invalid, or expired token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: Internal Server Error
 */
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

/**
 * @swagger
 * /api/delete/avatar:
 *   delete:
 *     summary: Delete the current user's avatar
 *     description: Sets the authenticated user's profile avatar URL to null.
 *     tags:
 *       - Upload
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Avatar deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *             example:
 *               message: Deleted Avatar
 *       401:
 *         description: Missing, invalid, or expired token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: Internal server error
 */
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

router.post(
  "/upload/post",
  isAuthenticate,
  upload.array("post"),
  async (req, res) => {
    try {
      const files = req.files;
      const filesData = [];
      for (let file of files) {
        const { buffer } = file;
        const result = await cloudinaryUpload(buffer);
        filesData.push(result);
      }

      // res.json({ message: "Successfully uploaded avatar", result });
      res.json({ message: "Successfully uploaded posts", posts: filesData });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
);

module.exports = router;
