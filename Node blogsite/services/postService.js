const Post = require('../models/Post');
const slugify = require('slugify');
const sanitizeHtml = require('sanitize-html');

const cleanPostHtml = (content) => sanitizeHtml(content, {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ['src', 'alt', 'width', 'height']
  },
  allowedSchemes: ['http', 'https']
});

const populatePost = (query) => query
  .populate('categoryId', 'name slug')
  .populate('authorId', 'name avatar');

async function createPost({ user, body }) {
  const isAdmin = user.role === 'admin';
  const post = await Post.create({
    title: body.title.trim(),
    excerpt: body.excerpt || (body.content || '').replace(/<[^>]*>/g, '').substring(0, 150),
    content: cleanPostHtml(body.content),
    categoryId: body.categoryId,
    image: body.image,
    authorId: user.id,
    authorName: user.name,
    status: isAdmin && ['draft', 'published', 'archived'].includes(body.status) ? body.status : 'draft',
    slug: body.slug || slugify(body.title, { lower: true, strict: true }),
    featured: isAdmin && Boolean(body.featured)
  });

  return populatePost(Post.findById(post._id));
}

async function updatePost({ id, payload }) {
  const post = await Post.findById(id);
  if (!post) {
    const err = new Error('Post not found');
    err.statusCode = 404;
    throw err;
  }

  Object.assign(post, {
    title: payload.title ?? post.title,
    excerpt: payload.excerpt ?? post.excerpt,
    content: payload.content === undefined ? post.content : cleanPostHtml(payload.content),
    categoryId: payload.categoryId ?? post.categoryId,
    image: payload.image ?? post.image,
    status: payload.status ?? post.status,
    slug: payload.slug ?? post.slug,
    views: payload.views ?? post.views,
    featured: payload.featured ?? post.featured
  });

  await post.save();
  return populatePost(Post.findById(post._id));
}

module.exports = {
  createPost,
  updatePost,
  cleanPostHtml
};
