import { ref, computed, watch } from 'vue'
import { postsAPI, commentsAPI } from '../api/index.js'

function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9)
}

export function usePosts(currentUser) {
    const currentView = ref('home')
    const currentCategory = ref('all')
    const currentPost = ref(null)
    const editingPost = ref(null)
    const newComment = ref('')
    const loading = ref(false)
    const error = ref('')
    const notification = ref('')
    const searchQuery = ref('')
    const sortBy = ref('newest')

    // Enhanced sample posts data matching the BlogCard structure
    const posts = ref([
        {
            id: '1',
            title: 'Getting Started with Vue 3 Composition API',
            excerpt: 'Learn how to use the new Composition API in Vue 3 to build more maintainable and scalable applications. This comprehensive guide covers everything from basic setup to advanced patterns.',
            content: `
                <h2>Introduction to Vue 3 Composition API</h2>
                <p>Vue 3 introduces the Composition API as a new way to organize and reuse logic in your components. Unlike the Options API, the Composition API provides more flexibility and better TypeScript support.</p>
                
                <h3>Key Benefits</h3>
                <ul>
                    <li>Better logic reuse with composables</li>
                    <li>Improved TypeScript integration</li>
                    <li>More flexible code organization</li>
                    <li>Better performance with tree-shaking</li>
                </ul>
                
                <h3>Basic Example</h3>
                <pre><code>const { ref, computed } = require('vue')</code></pre>
                
                <p>Start using Composition API today to build more maintainable Vue applications!</p>
            `,
            category: 'technology',
            image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop',
            author: 'Jane Doe',
            status: 'approved',
            authorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            authorColor: '#3B82F6',
            date: '2024-01-15T10:30:00Z',
            readTime: '5 min',
            likes: 42,
            comments: 8,
            views: 1250,
            featured: true,
            tags: ['vue', 'javascript', 'frontend', 'composition-api', 'web-development'],
            createdAt: '2024-01-15T08:00:00Z',
            updatedAt: '2024-01-15T08:00:00Z'
        },
        {
            id: '2',
            title: 'The Future of Web Development in 2024',
            excerpt: 'Exploring the latest trends and technologies shaping the future of web development, from AI integration to new frameworks.',
            content: `
                <h2>Web Development Trends 2024</h2>
                <p>The web development landscape continues to evolve rapidly. Here are the key trends to watch:</p>
                
                <h3>AI-Powered Development</h3>
                <p>AI tools are becoming essential for developers, helping with code generation, debugging, and optimization.</p>
                
                <h3>Serverless Architecture</h3>
                <p>More companies are adopting serverless solutions for better scalability and cost efficiency.</p>
                
                <h3>Web3 and Blockchain</h3>
                <p>Decentralized applications are gaining traction in various industries.</p>
            `,
            category: 'technology',
            image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=600&h=400&fit=crop',
            author: 'Admin User',
            status: 'approved',
            authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            authorColor: '#10B981',
            date: '2024-01-12T14:20:00Z',
            readTime: '8 min',
            likes: 156,
            comments: 23,
            views: 3400,
            trending: true,
            tags: ['webdev', 'trends', 'technology', 'ai', 'serverless'],
            createdAt: '2024-01-12T10:00:00Z',
            updatedAt: '2024-01-12T10:00:00Z'
        },
        {
            id: '3',
            title: 'Healthy Lifestyle Tips for Developers',
            excerpt: 'Practical advice for maintaining a healthy lifestyle while working long hours as a developer.',
            content: `
                <h2>Staying Healthy as a Developer</h2>
                <p>Sitting for long periods and staring at screens can take a toll on your health. Here are some tips:</p>
                
                <h3>Ergonomics Matters</h3>
                <p>Invest in a good chair and set up your workstation properly to avoid back and neck pain.</p>
                
                <h3>Take Regular Breaks</h3>
                <p>Follow the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds.</p>
                
                <h3>Stay Active</h3>
                <p>Incorporate physical activity into your daily routine, even if it's just a short walk.</p>
            `,
            category: 'lifestyle',
            image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
            author: 'Jane Doe',
            status: 'approved',
            authorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            authorColor: '#3B82F6',
            date: '2024-01-10T09:15:00Z',
            readTime: '6 min',
            likes: 89,
            comments: 12,
            views: 2100,
            tags: ['health', 'lifestyle', 'productivity', 'wellness', 'developers'],
            createdAt: '2024-01-10T08:00:00Z',
            updatedAt: '2024-01-10T08:00:00Z'
        },
        {
            id: '4',
            title: 'Complete Guide to Starting Your Own Tech Business',
            excerpt: 'Step-by-step guide to launching and growing a successful tech startup from idea to product launch.',
            content: '<h2>Starting a Tech Business</h2><p>Learn the essential steps to turn your tech idea into a profitable business.</p>',
            category: 'business',
            image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop',
            author: 'Mike Johnson',
            status: 'approved',
            authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            authorColor: '#F59E0B',
            date: '2024-01-08T11:00:00Z',
            readTime: '12 min',
            likes: 124,
            comments: 18,
            views: 2850,
            featured: true,
            tags: ['startup', 'business', 'entrepreneurship', 'tech'],
            createdAt: '2024-01-08T08:00:00Z',
            updatedAt: '2024-01-08T08:00:00Z'
        },
        {
            id: '5',
            title: 'Top 10 Travel Destinations for Tech Nomads',
            excerpt: 'Discover the best places in the world for remote work, with great internet, affordable living, and amazing culture.',
            content: '<h2>Best Digital Nomad Destinations</h2><p>Here are the top 10 places to live and work remotely as a tech professional.</p>',
            category: 'travel',
            image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop',
            author: 'Sarah Airlines',
            status: 'approved',
            authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            authorColor: '#EF4444',
            date: '2024-01-06T15:30:00Z',
            readTime: '9 min',
            likes: 203,
            comments: 31,
            views: 4500,
            trending: true,
            tags: ['travel', 'digital-nomad', 'remote-work', 'destinations'],
            createdAt: '2024-01-06T12:00:00Z',
            updatedAt: '2024-01-06T12:00:00Z'
        },
        {
            id: '6',
            title: 'Delicious and Easy Recipes for Busy Developers',
            excerpt: 'Quick and nutritious recipes that take less than 30 minutes to prepare, perfect for busy tech professionals.',
            content: '<h2>Quick Recipes for Developers</h2><p>Cooking doesn\'t have to be complicated or time-consuming.</p>',
            category: 'food',
            image: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600&h=400&fit=crop',
            author: 'Chef Robert',
            status: 'approved',
            authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
            authorColor: '#8B5CF6',
            date: '2024-01-05T10:20:00Z',
            readTime: '8 min',
            likes: 156,
            comments: 22,
            views: 3100,
            tags: ['food', 'recipes', 'cooking', 'quick-meals'],
            createdAt: '2024-01-05T09:00:00Z',
            updatedAt: '2024-01-05T09:00:00Z'
        },
        {
            id: '7',
            title: 'React Hooks Deep Dive: Custom Hooks Tutorial',
            excerpt: 'Master custom React hooks and learn how to create reusable logic for your React applications.',
            content: '<h2>Creating Custom Hooks</h2><p>Custom hooks are a powerful way to reuse stateful logic in React components.</p>',
            category: 'technology',
            image: 'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=600&h=400&fit=crop',
            author: 'Jane Doe',
            status: 'approved',
            authorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            authorColor: '#3B82F6',
            date: '2024-01-04T14:10:00Z',
            readTime: '10 min',
            likes: 178,
            comments: 25,
            views: 3650,
            tags: ['react', 'javascript', 'hooks', 'frontend'],
            createdAt: '2024-01-04T13:00:00Z',
            updatedAt: '2024-01-04T13:00:00Z'
        },
        {
            id: '8',
            title: 'Mindfulness and Meditation for Better Mental Health',
            excerpt: 'Explore proven techniques to reduce stress, improve focus, and enhance overall mental wellbeing.',
            content: '<h2>Mindfulness For Better Health</h2><p>Simple meditation practices that can transform your mental health.</p>',
            category: 'lifestyle',
            image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop',
            author: 'Wellness Coach Lisa',
            status: 'approved',
            authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            authorColor: '#10B981',
            date: '2024-01-03T09:45:00Z',
            readTime: '7 min',
            likes: 234,
            comments: 45,
            views: 5200,
            featured: true,
            tags: ['mindfulness', 'health', 'meditation', 'wellness'],
            createdAt: '2024-01-03T08:00:00Z',
            updatedAt: '2024-01-03T08:00:00Z'
        },
        {
            id: '9',
            title: 'Building Scalable Systems with Node.js and Express',
            excerpt: 'Learn best practices for building robust, scalable backend systems using Node.js and Express.js frameworks.',
            content: '<h2>Scalable Backend Systems</h2><p>Node.js and Express enable developers to build fast, scalable servers.</p>',
            category: 'technology',
            image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop',
            author: 'Backend Expert Dave',
            status: 'approved',
            authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
            authorColor: '#06B6D4',
            date: '2024-01-02T13:20:00Z',
            readTime: '15 min',
            likes: 267,
            comments: 38,
            views: 6100,
            trending: true,
            tags: ['nodejs', 'express', 'backend', 'scalability'],
            createdAt: '2024-01-02T12:00:00Z',
            updatedAt: '2024-01-02T12:00:00Z'
        },
        {
            id: '10',
            title: 'Personal Finance Tips: Building Wealth as a Developer',
            excerpt: 'Financial strategies specifically designed for software developers to build long-term wealth and security.',
            content: '<h2>Wealth Building for Developers</h2><p>Smart financial decisions can accelerate your path to financial freedom.</p>',
            category: 'business',
            image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop',
            author: 'Finance Advisor John',
            status: 'approved',
            authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            authorColor: '#F97316',
            date: '2024-01-01T11:00:00Z',
            readTime: '11 min',
            likes: 198,
            comments: 29,
            views: 4200,
            featured: true,
            tags: ['finance', 'wealth', 'investing', 'personal-growth'],
            createdAt: '2024-01-01T10:00:00Z',
            updatedAt: '2024-01-01T10:00:00Z'
        },
        {
            id: '11',
            title: 'Backpacking Through Southeast Asia on a Budget',
            excerpt: 'Complete guide to exploring Thailand, Vietnam, and Cambodia on less than $30 per day.',
            content: '<h2>Budget Travel in Southeast Asia</h2><p>Travel smart and save money with these insider tips.</p>',
            category: 'travel',
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
            author: 'Adventure Blogger Tom',
            status: 'approved',
            authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
            authorColor: '#EC4899',
            date: '2023-12-30T16:15:00Z',
            readTime: '13 min',
            likes: 312,
            comments: 52,
            views: 7200,
            trending: true,
            tags: ['travel', 'backpacking', 'asia', 'budget'],
            createdAt: '2023-12-30T14:00:00Z',
            updatedAt: '2023-12-30T14:00:00Z'
        },
        {
            id: '12',
            title: 'Michelin-Starred Restaurant Review: Modern Cuisine',
            excerpt: 'A detailed review of a five-star dining experience that redefines modern culinary excellence.',
            content: '<h2>Culinary Excellence</h2><p>Discover what makes this restaurant stand out in the world of fine dining.</p>',
            category: 'food',
            image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop',
            author: 'Food Critic Emma',
            status: 'approved',
            authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            authorColor: '#06B6D4',
            date: '2023-12-29T12:30:00Z',
            readTime: '6 min',
            likes: 89,
            comments: 14,
            views: 1950,
            tags: ['food', 'dining', 'restaurant', 'review', 'cuisine'],
            createdAt: '2023-12-29T11:00:00Z',
            updatedAt: '2023-12-29T11:00:00Z'
        },
        {
            id: '13',
            title: 'TypeScript Advanced Types and Generics',
            excerpt: 'Master advanced TypeScript concepts including generics, mapped types, and conditional types.',
            content: '<h2>Advanced TypeScript</h2><p>Level up your TypeScript skills with these advanced patterns.</p>',
            category: 'technology',
            image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop',
            author: 'Code Ninja Chris',
            status: 'approved',
            authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
            authorColor: '#3B82F6',
            date: '2023-12-28T10:00:00Z',
            readTime: '14 min',
            likes: 245,
            comments: 33,
            views: 5100,
            featured: true,
            tags: ['typescript', 'javascript', 'advanced', 'generics'],
            createdAt: '2023-12-28T09:00:00Z',
            updatedAt: '2023-12-28T09:00:00Z'
        },
        {
            id: '14',
            title: 'Remote Work Productivity: 7 Habits of Highly Effective Remote Workers',
            excerpt: 'Proven strategies to maintain focus, productivity, and work-life balance while working from home.',
            content: '<h2>Remote Work Excellence</h2><p>Build habits that enhance your productivity in a remote environment.</p>',
            category: 'lifestyle',
            image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop',
            author: 'Productivity Expert Rachel',
            status: 'approved',
            authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            authorColor: '#10B981',
            date: '2023-12-27T14:45:00Z',
            readTime: '9 min',
            likes: 267,
            comments: 41,
            views: 6300,
            featured: true,
            tags: ['productivity', 'remote-work', 'habits', 'work-life-balance'],
            createdAt: '2023-12-27T13:00:00Z',
            updatedAt: '2023-12-27T13:00:00Z'
        },
        {
            id: '15',
            title: 'Machine Learning for Web Developers: Getting Started',
            excerpt: 'Introduction to machine learning concepts and practical applications using JavaScript libraries.',
            content: '<h2>ML for Web Developers</h2><p>Explore how machine learning can enhance web applications.</p>',
            category: 'technology',
            image: 'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=600&h=400&fit=crop',
            author: 'AI Specialist Alex',
            status: 'approved',
            authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            authorColor: '#8B5CF6',
            date: '2023-12-26T09:20:00Z',
            readTime: '12 min',
            likes: 198,
            comments: 27,
            views: 4100,
            trending: true,
            tags: ['machine-learning', 'ai', 'javascript', 'web-development'],
            createdAt: '2023-12-26T08:00:00Z',
            updatedAt: '2023-12-26T08:00:00Z'
        },
        {
            id: '16',
            title: 'Startup Funding 101: How to Raise Capital',
            excerpt: 'Complete guide to understanding different funding options and how to successfully pitch to investors.',
            content: '<h2>Raising Startup Capital</h2><p>Navigate the complex world of startup funding with confidence.</p>',
            category: 'business',
            image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop',
            author: 'Venture Capitalist Paul',
            status: 'approved',
            authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
            authorColor: '#F59E0B',
            date: '2023-12-25T11:30:00Z',
            readTime: '13 min',
            likes: 223,
            comments: 36,
            views: 5400,
            featured: true,
            tags: ['startup', 'funding', 'business', 'investment'],
            createdAt: '2023-12-25T10:00:00Z',
            updatedAt: '2023-12-25T10:00:00Z'
        },
        {
            id: '17',
            title: 'Island Hopping in Greece: Budget Travel Guide',
            excerpt: 'Explore the beautiful Greek islands without breaking the bank with this comprehensive travel guide.',
            content: '<h2>Exploring Greece on a Budget</h2><p>Create unforgettable memories while keeping your budget intact.</p>',
            category: 'travel',
            image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&h=400&fit=crop',
            author: 'Travel Writer Sophie',
            status: 'approved',
            authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            authorColor: '#EF4444',
            date: '2023-12-24T15:10:00Z',
            readTime: '11 min',
            likes: 289,
            comments: 44,
            views: 6800,
            trending: true,
            tags: ['travel', 'greece', 'islands', 'budget-travel'],
            createdAt: '2023-12-24T14:00:00Z',
            updatedAt: '2023-12-24T14:00:00Z'
        },
        {
            id: '18',
            title: 'Plant-Based Protein Recipes for Vegans',
            excerpt: 'Delicious and nutritious plant-based recipes packed with protein to support a vegan lifestyle.',
            content: '<h2>Vegan Protein Solutions</h2><p>Get all the protein you need from plant-based sources.</p>',
            category: 'food',
            image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop',
            author: 'Vegan Chef Maria',
            status: 'approved',
            authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            authorColor: '#10B981',
            date: '2023-12-23T10:45:00Z',
            readTime: '8 min',
            likes: 145,
            comments: 19,
            views: 3200,
            tags: ['food', 'vegan', 'recipes', 'nutrition', 'protein'],
            createdAt: '2023-12-23T09:00:00Z',
            updatedAt: '2023-12-23T09:00:00Z'
        },
        {
            id: '19',
            title: 'CSS Grid Deep Dive: Modern Layout Techniques',
            excerpt: 'Master CSS Grid and learn how to create complex, responsive layouts with ease.',
            content: '<h2>CSS Grid Mastery</h2><p>Build powerful grid-based layouts with CSS Grid.</p>',
            category: 'technology',
            image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop',
            author: 'CSS Expert Kevin',
            status: 'approved',
            authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            authorColor: '#3B82F6',
            date: '2023-12-22T13:15:00Z',
            readTime: '10 min',
            likes: 212,
            comments: 31,
            views: 4700,
            featured: true,
            tags: ['css', 'layout', 'grid', 'responsive-design'],
            createdAt: '2023-12-22T12:00:00Z',
            updatedAt: '2023-12-22T12:00:00Z'
        },
        {
            id: '20',
            title: 'Digital Detox: Reclaiming Your Life from Technology',
            excerpt: 'Strategies to reduce screen time and reconnect with yourself and nature through a digital detox.',
            content: '<h2>The Power of Digital Detox</h2><p>Learn how to create a healthier relationship with technology.</p>',
            category: 'lifestyle',
            image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop',
            author: 'Wellness Coach Nina',
            status: 'approved',
            authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            authorColor: '#EC4899',
            date: '2023-12-21T09:30:00Z',
            readTime: '7 min',
            likes: 178,
            comments: 26,
            views: 3900,
            tags: ['lifestyle', 'digital-detox', 'wellness', 'mental-health'],
            createdAt: '2023-12-21T08:00:00Z',
            updatedAt: '2023-12-21T08:00:00Z'
        },
        {
            id: '21',
            title: 'E-commerce Optimization: Increasing Sales Conversions',
            excerpt: 'Proven strategies and techniques to optimize your e-commerce store and boost conversion rates.',
            content: '<h2>E-commerce Growth</h2><p>Transform browsers into buyers with these optimization techniques.</p>',
            category: 'business',
            image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop',
            author: 'Marketing Expert Lisa',
            status: 'approved',
            authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            authorColor: '#F97316',
            date: '2023-12-20T14:20:00Z',
            readTime: '11 min',
            likes: 167,
            comments: 24,
            views: 3700,
            tags: ['ecommerce', 'conversion', 'business', 'marketing'],
            createdAt: '2023-12-20T13:00:00Z',
            updatedAt: '2023-12-20T13:00:00Z'
        },
        {
            id: '22',
            title: 'Hiking the Appalachian Trail: A Journey of Discovery',
            excerpt: 'Personal account of hiking the famous Appalachian Trail and lessons learned along the way.',
            content: '<h2>The AT Experience</h2><p>An inspiring story of adventure, challenges, and personal growth.</p>',
            category: 'travel',
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
            author: 'Adventure Writer Mark',
            status: 'approved',
            authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
            authorColor: '#10B981',
            date: '2023-12-19T11:45:00Z',
            readTime: '16 min',
            likes: 256,
            comments: 42,
            views: 5900,
            featured: true,
            tags: ['travel', 'hiking', 'adventure', 'appalachian-trail'],
            createdAt: '2023-12-19T10:00:00Z',
            updatedAt: '2023-12-19T10:00:00Z'
        },
        {
            id: '23',
            title: 'Homemade Pasta: Art and Science Combined',
            excerpt: 'Learn the traditional art of making fresh pasta from scratch with simple ingredients and techniques.',
            content: '<h2>Making Fresh Pasta</h2><p>Discover the joy of homemade pasta and impress your guests.</p>',
            category: 'food',
            image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=400&fit=crop',
            author: 'Italian Chef Marco',
            status: 'approved',
            authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            authorColor: '#F59E0B',
            date: '2023-12-18T10:00:00Z',
            readTime: '9 min',
            likes: 134,
            comments: 16,
            views: 2800,
            tags: ['food', 'pasta', 'cooking', 'italian', 'homemade'],
            createdAt: '2023-12-18T09:00:00Z',
            updatedAt: '2023-12-18T09:00:00Z'
        }
    ])

    // Posts are loaded from the backend; mock data remains available for development inspection only.
    const fetchPosts = async (params = {}) => {
        loading.value = true
        error.value = ''
        
        try {
            const response = await postsAPI.getPosts(params)
            posts.value = response.posts || response
            return posts.value
        } catch (apiError) {
            error.value = apiError.response?.data?.message || 'Unable to load posts from the server.'
            posts.value = []
            throw apiError
        } finally {
            loading.value = false
        }
    }

    const comments = ref([
        {
            id: '1',
            postId: '1',
            author: 'John Smith',
            content: 'Great introduction to Composition API! Very helpful for beginners.',
            date: '2024-01-15T14:30:00Z',
            likes: 5,
            dislikes: 0,
            edited: false,
            replies: [
                {
                    id: '1-1',
                    author: 'Jane Doe',
                    content: 'Thanks John! Glad you found it helpful.',
                    date: '2024-01-15T15:00:00Z',
                    likes: 2,
                    dislikes: 0
                }
            ]
        },
        {
            id: '2',
            postId: '1',
            author: 'Sarah Wilson',
            content: 'When should we use Composition API over Options API?',
            date: '2024-01-15T16:45:00Z',
            likes: 3,
            dislikes: 0,
            edited: false,
            replies: []
        }
    ])

    const likes = ref([])
    const savedPosts = ref([])
    const drafts = ref([])

    // Computed properties
    const filteredPosts = computed(() => {
        let filtered = posts.value.filter(post => !post.draft)

        // Filter by category
        if (currentCategory.value !== 'all') {
            filtered = filtered.filter(post => post.category === currentCategory.value)
        }

        // Filter by search query
        if (searchQuery.value) {
            const query = searchQuery.value.toLowerCase()
            filtered = filtered.filter(post => 
                post.title.toLowerCase().includes(query) ||
                post.excerpt.toLowerCase().includes(query) ||
                post.tags.some(tag => tag.toLowerCase().includes(query)) ||
                post.author.toLowerCase().includes(query)
            )
        }

        // Sort posts
        return sortPosts(filtered, sortBy.value)
    })

    const featuredPosts = computed(() => {
        return posts.value.filter(post => post.featured && !post.draft)
    })

    const trendingPosts = computed(() => {
        return posts.value.filter(post => post.trending && !post.draft)
    })

    const userPosts = computed(() => {
        if (!currentUser.value) return []
        return posts.value.filter(post => post.author === currentUser.value.name)
    })

    const userDrafts = computed(() => {
        if (!currentUser.value) return []
        return posts.value.filter(post => post.draft && post.author === currentUser.value.name)
    })

    const categories = computed(() => {
        const categoriesSet = new Set(posts.value.map(post => post.category))
        return ['all', ...Array.from(categoriesSet)]
    })

    const postComments = computed(() => {
        if (!currentPost.value) return []
        return comments.value
            .filter(comment => comment.postId === currentPost.value.id)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
    })

    const isLiked = (postId) => {
        if (!currentUser.value || !postId) return false
        return likes.value.some(like => like.postId === postId && like.userId === currentUser.value.id)
    }

    const isSaved = (postId) => {
        if (!currentUser.value || !postId) return false
        return savedPosts.value.some(saved => saved.postId === postId && saved.userId === currentUser.value.id)
    }

    const postLikeCount = computed(() => {
        if (!currentPost.value) return 0
        return likes.value.filter(like => like.postId === currentPost.value.id).length
    })

    // Methods
    const setCategory = (category) => {
        currentCategory.value = category
    }

    const setSortBy = (sort) => {
        sortBy.value = sort
    }

    const setSearchQuery = (query) => {
        searchQuery.value = query
    }

    const showHomeView = () => {
        currentView.value = 'home'
        currentPost.value = null
        editingPost.value = null
        error.value = ''
    }

    const showProfileView = () => {
        if (!currentUser.value) {
            error.value = 'You must be logged in to view your profile.'
            return
        }
        currentView.value = 'profile'
        currentPost.value = null
        editingPost.value = null
        error.value = ''
    }

    const viewPost = (postId) => {
        const post = posts.value.find(post => post.id === postId)
        if (post) {
            currentPost.value = post
            currentView.value = 'post'
            error.value = ''
            
            // Increment views
            if (!post.views) post.views = 0
            post.views++
        } else {
            error.value = 'Post not found'
        }
    }

    const writePost = () => {
        if (!currentUser.value) {
            error.value = 'You must be logged in to write a post.'
            return false
        }
        editingPost.value = null
        currentView.value = 'editor'
        error.value = ''
        return true
    }

    const editPost = (postId) => {
        if (!currentUser.value) {
            error.value = 'You must be logged in to edit a post.'
            return false
        }
        const post = posts.value.find(p => p.id === postId)
        if (post && (post.author === currentUser.value.name || currentUser.value.role === 'admin')) {
            editingPost.value = { ...post }
            currentView.value = 'editor'
            error.value = ''
        } else {
            error.value = 'You can only edit your own posts.'
        }
    }

    const deletePost = (postId) => {
        if (!currentUser.value) {
            error.value = 'You must be logged in to delete a post.'
            return false
        }
        
        const postIndex = posts.value.findIndex(p => p.id === postId)
        if (postIndex !== -1) {
            const post = posts.value[postIndex]
            if (post.author === currentUser.value.name || currentUser.value.role === 'admin') {
                posts.value.splice(postIndex, 1)
                notification.value = 'Post deleted successfully!'
                
                // Clear current post if it's the one being deleted
                if (currentPost.value && currentPost.value.id === postId) {
                    showHomeView()
                }
            } else {
                error.value = 'You can only delete your own posts.'
            }
        } else {
            error.value = 'Post not found.'
        }
    }

    // Admin can approve posts
    const approvePost = (postId) => {
        if (!currentUser.value || currentUser.value.role !== 'admin') {
            error.value = 'Only admins can approve posts.'
            return
        }
        const post = posts.value.find(p => p.id === postId)
        if (post) {
            post.status = 'approved'
            notification.value = 'Post approved!'
        }
    }

    // Admin can reject posts
    const rejectPost = (postId) => {
        if (!currentUser.value || currentUser.value.role !== 'admin') {
            error.value = 'Only admins can reject posts.'
            return
        }
        const post = posts.value.find(p => p.id === postId)
        if (post) {
            post.status = 'rejected'
            notification.value = 'Post rejected!'
        }
    }

    const savePost = async (postData, isDraft = false) => {
        loading.value = true
        error.value = ''
        try {
            if (!currentUser.value) throw new Error('Not authenticated')
            if (!postData.title || !postData.content) throw new Error('Title and content are required')
            
            if (editingPost.value) {
                // Edit existing post
                const idx = posts.value.findIndex(p => p.id === editingPost.value.id)
                if (idx !== -1) {
                    posts.value[idx] = { 
                        ...posts.value[idx], 
                        ...postData, 
                        draft: isDraft,
                        updatedAt: new Date().toISOString(),
                        // If admin edits, keep status; if user edits, revert to pending
                        status: currentUser.value.role === 'admin' ? posts.value[idx].status : 'pending'
                    }
                    notification.value = isDraft ? 'Draft updated successfully!' : 'Post updated successfully!'
                }
            } else {
                // New post
                const newPost = {
                    ...postData,
                    id: generateId(),
                    author: currentUser.value.name,
                    authorAvatar: currentUser.value.avatar,
                    authorId: currentUser.value.id,
                    draft: isDraft,
                    date: new Date().toISOString(),
                    readTime: `${Math.ceil(postData.content.length / 1000)} min`,
                    likes: 0,
                    comments: 0,
                    views: 0,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    tags: postData.tags || [],
                    featured: postData.featured || false,
                    trending: false,
                    status: currentUser.value.role === 'admin' ? 'approved' : 'pending'
                }
                posts.value.unshift(newPost)
                notification.value = isDraft ? 'Draft saved successfully!' : (currentUser.value.role === 'admin' ? 'Post published successfully!' : 'Post submitted for approval!')
            }
            showHomeView()
        } catch (e) {
            error.value = e.message
        } finally {
            loading.value = false
        }
    }

    const toggleLike = (postId) => {
        if (!currentUser.value) {
            error.value = 'You must be logged in to like posts.'
            return
        }
        const likeIndex = likes.value.findIndex(like => like.postId === postId && like.userId === currentUser.value.id)
        if (likeIndex !== -1) {
            likes.value.splice(likeIndex, 1)
            // Decrement like count
            const post = posts.value.find(p => p.id === postId)
            if (post && post.likes > 0) post.likes--
            notification.value = 'Like removed.'
        } else {
            likes.value.push({ id: generateId(), postId, userId: currentUser.value.id })
            // Increment like count
            const post = posts.value.find(p => p.id === postId)
            if (post) post.likes = (post.likes || 0) + 1
            notification.value = 'Post liked!'
        }
    }

    const toggleSave = (postId) => {
        if (!currentUser.value) {
            error.value = 'You must be logged in to save posts.'
            return
        }
        const saveIndex = savedPosts.value.findIndex(saved => saved.postId === postId && saved.userId === currentUser.value.id)
        if (saveIndex !== -1) {
            savedPosts.value.splice(saveIndex, 1)
            notification.value = 'Post removed from saved.'
        } else {
            savedPosts.value.push({ id: generateId(), postId, userId: currentUser.value.id })
            notification.value = 'Post saved to favorites!'
        }
    }

    const addComment = (content, parentId = null) => {
        if (!currentUser.value) {
            error.value = 'You must be logged in to comment.'
            return
        }
        if (!content.trim()) {
            error.value = 'Comment cannot be empty.'
            return
        }
        if (!currentPost.value) {
            error.value = 'No post selected.'
            return
        }
        
        if (parentId) {
            // Add reply to existing comment
            const parentComment = comments.value.find(c => c.id === parentId)
            if (parentComment) {
                const newReply = {
                    id: generateId(),
                    author: currentUser.value.name,
                    content,
                    date: new Date().toISOString(),
                    likes: 0,
                    dislikes: 0
                }
                parentComment.replies.push(newReply)
                notification.value = 'Reply added successfully!'
            }
        } else {
            // Add new comment
            const newCommentObj = {
                id: generateId(),
                postId: currentPost.value.id,
                author: currentUser.value.name,
                content,
                date: new Date().toISOString(),
                likes: 0,
                dislikes: 0,
                edited: false,
                replies: []
            }
            comments.value.push(newCommentObj)
            currentPost.value.comments += 1
            notification.value = 'Comment added successfully!'
        }
        newComment.value = ''
    }

    const editComment = (commentId, newContent) => {
        const comment = comments.value.find(c => c.id === commentId)
        if (comment && comment.author === currentUser.value?.name) {
            comment.content = newContent
            comment.edited = true
            notification.value = 'Comment updated successfully!'
        } else {
            error.value = 'You can only edit your own comments.'
        }
    }

    const deleteComment = (commentId) => {
        const commentIndex = comments.value.findIndex(c => c.id === commentId)
        if (commentIndex !== -1) {
            const comment = comments.value[commentIndex]
            if (comment.author === currentUser.value?.name) {
                comments.value.splice(commentIndex, 1)
                if (currentPost.value) {
                    currentPost.value.comments = Math.max(0, currentPost.value.comments - 1)
                }
                notification.value = 'Comment deleted successfully!'
            } else {
                error.value = 'You can only delete your own comments.'
            }
        }
    }

    const sharePost = (post) => {
        if (!post) return
        // Simulate sharing
        const postUrl = `${window.location.origin}/post/${post.id}`
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(postUrl).then(() => {
                notification.value = 'Post link copied to clipboard!'
            }).catch(() => {
                notification.value = 'Post shared!'
            })
        } else {
            notification.value = 'Post shared!'
        }
    }

    const startWriting = () => {
        if (currentUser.value) {
            return writePost()
        } else {
            error.value = 'Please log in to write a post.'
            return false
        }
    }

    const userAvatarClick = () => {
        notification.value = 'User profile clicked.'
    }

    const clearNotification = () => {
        notification.value = ''
    }

    const clearError = () => {
        error.value = ''
    }

    // Helper functions
    const sortPosts = (postsToSort, sortType) => {
        const sorted = [...postsToSort]
        switch (sortType) {
            case 'newest':
                return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            case 'oldest':
                return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            case 'most-liked':
                return sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0))
            case 'most-viewed':
                return sorted.sort((a, b) => (b.views || 0) - (a.views || 0))
            case 'most-commented':
                return sorted.sort((a, b) => (b.comments || 0) - (a.comments || 0))
            default:
                return sorted
        }
    }

    // Watch for changes to automatically clear notifications after 3 seconds
    watch(notification, (newVal) => {
        if (newVal) {
            setTimeout(() => {
                if (notification.value === newVal) {
                    clearNotification()
                }
            }, 3000)
        }
    })

    watch(error, (newVal) => {
        if (newVal) {
            setTimeout(() => {
                if (error.value === newVal) {
                    clearError()
                }
            }, 5000)
        }
    })

    return {
        posts,
        comments,
        likes,
        savedPosts,
        drafts,
        currentView,
        currentCategory,
        currentPost,
        editingPost,
        filteredPosts,
        featuredPosts,
        trendingPosts,
        userPosts,
        userDrafts,
        categories,
        postComments,
        isLiked,
        isSaved,
        postLikeCount,
        newComment,
        loading,
        error,
        notification,
        searchQuery,
        sortBy,
        fetchPosts,
        setCategory,
        setSortBy,
        setSearchQuery,
        showHomeView,
        showProfileView,
        viewPost,
        writePost,
        editPost,
        deletePost,
        savePost,
        approvePost,
        rejectPost,
        toggleLike,
        toggleSave,
        addComment,
        editComment,
        deleteComment,
        sharePost,
        startWriting,
        userAvatarClick,
        clearNotification,
        clearError
    }
}