const express = require("express");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./src/docs/swagger");

const authRoute = require("./src/routes/auth.route");
const profileRoute = require("./src/routes/profile.route");
const uploadRoute = require("./src/routes/upload.route");
const postRoute = require("./src/routes/post.route");
const app = express();

const PORT = 8000;

app.use(cookieParser());
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /test:
 *   get:
 *     summary: Check server health
 *     description: Returns a simple response confirming the server is running.
 *     tags:
 *       - Health
 *     security: []
 *     responses:
 *       200:
 *         description: Server is running.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messgae:
 *                   type: string
 *                   example: server ok
 */
app.use("/test", (req, res) => {
  res.send({ messgae: "server ok" });
});
app.use("/api", authRoute);
app.use("/api", profileRoute);
app.use("/api", uploadRoute);
app.use("/api", postRoute);

app.listen(PORT, () => {
  console.log("server is running on port " + PORT);
});
