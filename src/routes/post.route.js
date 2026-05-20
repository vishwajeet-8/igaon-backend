const { Router } = require("express");
const isAuthenticate = require("../middlewares/authentication");
const {
  validatePost,
  validateUpdatePost,
} = require("../schemas/validation.schema");
const pool = require("../db/db");
const router = Router();

router.post("/post", isAuthenticate, async (req, res) => {
  try {
    const { url, title, description } = req.body;
    const isValidate = validatePost.safeParse({ url, title, description });

    if (!isValidate.success) {
      throw { status: 400, message: isValidate.error.issues };
    }
    const { rows } = await pool.query(
      "INSERT INTO posts ( user_id, post_url, post_title, post_description ) VALUES ($1, $2, $3, $4) RETURNING id, post_url, post_title, post_description, likes",
      [req.user.id, url, title, description],
    );

    const posts = rows[0];
    return res.status(200).json({ message: posts });
  } catch (err) {
    console.log(err);
    return res
      .status(err.status || 500)
      .json({ message: err.message || "Internal server error" });
  }
});

router.get("/post/:id", isAuthenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query("SELECT * FROM posts WHERE id = $1", [
      id,
    ]);
    const post = rows[0];
    return res.status(200).json({ message: "Success", post });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/post/:id", isAuthenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, likes } = req.body;
    const isValidated = validateUpdatePost.safeParse({
      title,
      description,
      likes,
    });
    if (!isValidated.success) {
      throw { status: 400, message: isValidated.error.issues };
    }

    let fields = [];
    let values = [];
    let index = 1;

    if (title !== undefined) {
      fields.push(`post_title = $${index}`);
      values.push(title);
      index++;
    }
    if (description !== undefined) {
      fields.push(`post_description = $${index}`);
      values.push(description);
      index++;
    }
    if (likes !== undefined) {
      fields.push(`likes = $${index}`);
      values.push(likes);
      index++;
    }

    values.push(id);
    const { rows } = await pool.query(
      `UPDATE posts SET ${fields.join(", ")} WHERE id = $${index} RETURNING *`,
      values,
    );
    const post = rows[0];
    return res.status(200).json({ message: post });
  } catch (err) {
    console.log(err);
    return res
      .status(err.status || 500)
      .json(err.message || { message: "Internal server error" });
  }
});

router.delete("/post/:id", isAuthenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      "DELETE FROM posts WHERE id = $1 RETURNING *",
      [id],
    );
    const deletedPost = rows[0];
    return res.status(200).json({ message: "Deleted Successfully" });
  } catch (err) {
    console.log(err);
    return res.status(200).json({ message: "Internal server error" });
  }
});

router.get("/all/posts", isAuthenticate, async (req, res) => {
  try {
    const id = req.user.id;
    const { rows } = await pool.query(
      "SELECT * FROM posts WHERE user_id = $1",
      [id],
    );
    const posts = rows;
    return res.status(200).json({ message: "Success", posts });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/feed/posts", isAuthenticate, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM posts");
    const posts = rows;
    return res.status(200).json({ message: "Success", posts });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
