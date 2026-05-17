const z = require("zod");

const ValidateSignup = z.object({
  name: z.string().trim().nonempty(),
  username: z.string().trim().nonempty(),
  email: z.string().trim().nonempty().email(),
  password: z.string().trim().nonempty().min(6),
});

const validateLogin = z.object({
  email: z.string().trim().nonempty().email(),
  password: z.string().trim().nonempty().min(6),
});

const validateProfile = z.object({
  bio: z.string(),
  avatar_url: z.string().url(),
  birth: z.string(),
});

module.exports = { ValidateSignup, validateLogin, validateProfile };
