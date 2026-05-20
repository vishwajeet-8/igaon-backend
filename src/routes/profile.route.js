const { Router } = require("express");
const isAuthenticate = require("../middlewares/authentication");
const { validateProfile } = require("../schemas/validation.schema");
const pool = require("../db/db");
const router = Router();

/**
 * @swagger
 * /api/profile:
 *   post:
 *     summary: Create or update the current user's profile
 *     description: Creates a profile for the authenticated user or updates it when one already exists.
 *     tags:
 *       - Profile
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileRequest'
 *     responses:
 *       200:
 *         description: Profile saved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *             example:
 *               bio: Building and sharing village stories.
 *               avatar_url: https://res.cloudinary.com/demo/image/upload/avatar.jpg
 *               birth: "2000-01-01"
 *       400:
 *         description: Invalid profile data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 */
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

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get the current user's profile
 *     description: Returns the profile record for the authenticated user.
 *     tags:
 *       - Profile
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current user's profile.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
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
 */
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
