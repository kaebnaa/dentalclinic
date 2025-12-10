import { z } from 'zod';

/**
 * Middleware factory for request validation using Zod
 */
export const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation Error',
          details: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};

// Validation schemas
export const schemas = {
  register: z.object({
    body: z.object({
      name: z.string().min(2).max(100),
      email: z.string().email(),
      phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
      password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password must be less than 128 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
      role: z.enum(['patient', 'doctor', 'admin']).optional().default('patient')
    })
  }),

  login: z.object({
    body: z.object({
      email: z.string().email(),
      password: z.string().min(1)
    })
  }),

  createBranch: z.object({
    body: z.object({
      name: z.string().min(2).max(100),
      address: z.string().min(5).max(200),
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180)
    })
  }),

  updateBranch: z.object({
    params: z.object({
      id: z.string().uuid()
    }),
    body: z.object({
      name: z.string().min(2).max(100).optional(),
      address: z.string().min(5).max(200).optional(),
      latitude: z.number().min(-90).max(90).optional(),
      longitude: z.number().min(-180).max(180).optional()
    })
  }),

  createDoctor: z.object({
    body: z.object({
      name: z.string().min(2).max(100),
      email: z.string().email(),
      phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
      password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password must be less than 128 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
      specialization: z.string().min(2).max(100),
      branch_ids: z.array(z.string().uuid()).optional().default([])
    })
  }),

  createAppointment: z.object({
    body: z.object({
      doctor_id: z.string().uuid(),
      branch_id: z.string().uuid(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      start_time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
      notes: z.string().max(500).transform((val) => {
        // Sanitize HTML - remove all HTML tags
        if (!val) return val;
        return val.replace(/<[^>]*>/g, '').trim();
      }).optional()
    })
  }),

  updateAppointment: z.object({
    params: z.object({
      id: z.string().uuid()
    }),
    body: z.object({
      status: z.enum(['booked', 'confirmed', 'cancelled', 'completed']).optional(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      start_time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).optional(),
      notes: z.string().max(500).transform((val) => {
        // Sanitize HTML - remove all HTML tags
        if (!val) return val;
        return val.replace(/<[^>]*>/g, '').trim();
      }).optional()
    })
  }),

  createRecord: z.object({
    body: z.object({
      patient_id: z.string().uuid(),
      appointment_id: z.string().uuid().optional(),
      notes: z.string().min(1).max(5000).transform((val) => {
        // Sanitize HTML - remove all HTML tags
        if (!val) return val;
        return val.replace(/<[^>]*>/g, '').trim();
      }),
      attachments: z.array(z.string().url()).optional()
    })
  }),

  getRecords: z.object({
    params: z.object({
      patientId: z.string().uuid()
    })
  })
};

