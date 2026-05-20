const swaggerJsDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "IGAON API",
      version: "1.0.0",
      description: "Instagram Clone Backend APIs",
    },

    servers: [
      {
        url: "http://localhost:8000",
      },
    ],

    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token", // your cookie name
        },
      },
      schemas: {
        SignupRequest: {
          type: "object",
          required: ["name", "username", "email", "password"],
          properties: {
            name: {
              type: "string",
              example: "John Doe",
            },
            username: {
              type: "string",
              example: "johndoe",
            },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            password: {
              type: "string",
              minLength: 6,
              example: "secret123",
            },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            password: {
              type: "string",
              minLength: 6,
              example: "secret123",
            },
          },
        },
        ProfileRequest: {
          type: "object",
          required: ["bio", "avatar_url", "birth"],
          properties: {
            bio: {
              type: "string",
              example: "Building and sharing village stories.",
            },
            avatar_url: {
              type: "string",
              format: "uri",
              example:
                "https://res.cloudinary.com/demo/image/upload/avatar.jpg",
            },
            birth: {
              type: "string",
              example: "2000-01-01",
            },
          },
        },
        Profile: {
          type: "object",
          properties: {
            // id: {
            //   type: "integer",
            //   example: 1,
            // },
            user_id: {
              type: "integer",
              example: 1,
            },
            bio: {
              type: "string",
              example: "Building and sharing village stories.",
            },
            avatar_url: {
              type: "string",
              nullable: true,
              format: "uri",
              example:
                "https://res.cloudinary.com/demo/image/upload/avatar.jpg",
            },
            birth: {
              type: "string",
              example: "2000-01-01",
            },
          },
        },
        MessageResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Operation Successfull",
            },
          },
        },
        ErrorResponse: {
          oneOf: [
            {
              type: "object",
              additionalProperties: {
                type: "string",
              },
              example: {
                email: "Invalid email",
              },
            },
            {
              type: "object",
              properties: {
                error: {
                  type: "string",
                  example: "Resource already exists",
                },
              },
            },
            {
              type: "string",
              example: "Internal Server Error",
            },
          ],
        },
        AvatarUploadResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Successfully uploaded avatar",
            },
            result: {
              type: "object",
              additionalProperties: true,
            },
          },
        },
      },
    },

    security: [
      {
        cookieAuth: [],
      },
    ],
  },

  apis: ["./index.js", "./src/routes/*.js"],
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = swaggerSpec;
