const { z } = require('zod');

const objectIdSchema = z.string().trim().regex(/^[a-f\d]{24}$/i, 'Invalid ID format');

const validateRequest = (schema, source = 'body') => (req, res, next) => {
  const payload = req[source] ?? {};
  const result = schema.safeParse(payload);

  if (!result.success) {
    const issue = result.error.issues[0];
    return res.status(400).json({
      success: false,
      message: issue?.message || 'Validation failed',
      errors: result.error.flatten().fieldErrors
    });
  }

  req.validatedBody = result.data;
  req[source] = result.data;
  next();
};

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name must be 100 characters or fewer'),
  email: z.string().trim().toLowerCase().email('Please provide a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password must be 128 characters or fewer')
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please provide a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password must be 128 characters or fewer')
});

const adminLoginSchema = loginSchema;

const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name must be 100 characters or fewer').optional(),
  bio: z.string().max(500, 'Bio must be 500 characters or fewer').optional(),
  website: z.string().trim().url('Website must be a valid URL').optional().or(z.literal('')),
  avatar: z.string().trim().url('Avatar must be a valid URL').optional().or(z.literal(''))
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one profile field is required'
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(8, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').max(128, 'Password must be 128 characters or fewer')
});

const adminPostSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(160, 'Title must be 160 characters or fewer'),
  content: z.string().min(1, 'Content is required').max(200000, 'Content must be 200,000 characters or fewer'),
  excerpt: z.string().trim().max(500, 'Excerpt must be 500 characters or fewer').optional(),
  categoryId: objectIdSchema.optional().nullable(),
  image: z.string().trim().url('Image must be a valid URL').optional().or(z.literal('')),
  status: z.enum(['draft', 'published', 'archived'], {
    message: 'Status must be one of draft, published, or archived'
  }).optional(),
  slug: z.string().trim().min(1, 'Slug cannot be empty').max(200, 'Slug must be 200 characters or fewer').optional(),
  views: z.number().int().nonnegative().optional(),
  featured: z.boolean().optional(),
  authorId: objectIdSchema.optional(),
  authorName: z.string().trim().max(100, 'Author name must be 100 characters or fewer').optional()
});

const adminPostUpdateSchema = adminPostSchema.partial();

const postCreateSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(160, 'Title must be 160 characters or fewer'),
  content: z.string().min(1, 'Content is required').max(200000, 'Content must be 200,000 characters or fewer'),
  excerpt: z.string().trim().max(500, 'Excerpt must be 500 characters or fewer').optional(),
  categoryId: objectIdSchema.optional().nullable(),
  image: z.string().trim().url('Image must be a valid URL').optional().or(z.literal('')),
  status: z.enum(['draft', 'published', 'archived'], {
    message: 'Status must be one of draft, published, or archived'
  }).optional(),
  slug: z.string().trim().min(1, 'Slug cannot be empty').max(200, 'Slug must be 200 characters or fewer').optional(),
  featured: z.boolean().optional()
});

const postUpdateSchema = postCreateSchema.partial();

const commentCreateSchema = z.object({
  content: z.string().trim().min(1, 'Comment must be between 1 and 5000 characters').max(5000, 'Comment must be between 1 and 5000 characters')
});

const commentUpdateSchema = z.object({
  content: z.string().trim().min(1, 'Comment must be between 1 and 5000 characters').max(5000, 'Comment must be between 1 and 5000 characters').optional(),
  status: z.enum(['approved', 'pending'], {
    message: 'Status must be either approved or pending'
  }).optional()
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field is required'
});

const categorySchema = z.object({
  name: z.string().trim().min(2, 'Category name must be at least 2 characters').max(100, 'Category name must be 100 characters or fewer'),
  slug: z.string().trim().min(1, 'Slug cannot be empty').max(100, 'Slug must be 100 characters or fewer').optional(),
  icon: z.string().trim().max(200, 'Icon must be 200 characters or fewer').optional(),
  description: z.string().trim().max(500, 'Description must be 500 characters or fewer').optional()
});

const categoryUpdateSchema = categorySchema.partial();

const tagSchema = z.object({
  name: z.string().trim().min(2, 'Tag name must be at least 2 characters').max(100, 'Tag name must be 100 characters or fewer'),
  slug: z.string().trim().min(1, 'Slug cannot be empty').max(100, 'Slug must be 100 characters or fewer').optional()
});

const tagUpdateSchema = tagSchema.partial();

const likeSchema = z.object({
  postId: objectIdSchema,
  type: z.enum(['like', 'love', 'laugh', 'angry'], {
    message: 'Type must be like, love, laugh, or angry'
  }).optional().default('like')
});

const likeUpdateSchema = z.object({
  type: z.enum(['like', 'love', 'laugh', 'angry'], {
    message: 'Type must be like, love, laugh, or angry'
  }).default('like')
});

const savedPostSchema = z.object({
  postId: objectIdSchema
});

const searchQuerySchema = z.object({
  q: z.string().trim().min(1, 'Search query is required').max(200, 'Search query must be 200 characters or fewer')
});

module.exports = {
  validateRequest,
  registerSchema,
  loginSchema,
  adminLoginSchema,
  profileSchema,
  changePasswordSchema,
  adminPostSchema,
  adminPostUpdateSchema,
  postCreateSchema,
  postUpdateSchema,
  commentCreateSchema,
  commentUpdateSchema,
  categorySchema,
  categoryUpdateSchema,
  tagSchema,
  tagUpdateSchema,
  likeSchema,
  likeUpdateSchema,
  savedPostSchema,
  searchQuerySchema
};
