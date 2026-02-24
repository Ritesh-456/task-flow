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
            error: error.errors ? error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') : error.message
        });
    }
};

// Common Schemas
const registerSchema = z.object({
    body: z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email format"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        gender: z.string().optional(),
        role: z.string().optional(),
        inviteCode: z.string().min(1, "Invite code is required for normal registration")
    })
});

const superAdminRegisterSchema = z.object({
    body: z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email format"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        companyName: z.string().min(2, "Company name must be at least 2 characters"),
        registrationNumber: z.string().min(2, "Registration number is required"),
        phoneNumber: z.string().min(5, "Valid phone number is required"),
        plan: z.string().optional(),
        gender: z.string().optional(),
        industry: z.string().optional(),
        country: z.string().optional(),
        avatar: z.string().optional(),
        companySize: z.string().optional()
    })
});

const loginSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email format"),
        password: z.string().min(1, "Password is required")
    })
});

module.exports = { validate, registerSchema, loginSchema, superAdminRegisterSchema };

