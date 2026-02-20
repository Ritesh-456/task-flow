const { z } = require('zod');

// Middleware to catch Zod Error formats cleanly
const validate = (schema) => async (req, res, next) => {
    try {
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Validation Error",
            error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        });
    }
};

// Common Schemas
const registerSchema = z.object({
    body: z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email format"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        inviteCode: z.string().optional()
    })
});

const loginSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email format"),
        password: z.string().min(1, "Password is required")
    })
});

module.exports = { validate, registerSchema, loginSchema };
