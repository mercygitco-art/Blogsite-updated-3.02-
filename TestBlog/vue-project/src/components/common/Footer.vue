<template>
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-about">
                    <div class="footer-logo">
                        <i class="fas fa-blog"></i>
                        BlogSphere Pro
                    </div>
                    <p class="footer-description">
                        The next-generation blogging platform for writers, creators, and thinkers to share their stories with the world.
                    </p>
                    <div class="social-links">
                        <a
                            v-for="social in socials"
                            :key="social.name"
                            :href="social.url"
                            class="social-link"
                            :aria-label="social.label"
                            target="_blank"
                            rel="noopener noreferrer"
                            @click.prevent="handleSocialClick(social.name)"
                        >
                            <i :class="social.icon"></i>
                        </a>
                    </div>
                </div>

                <div
                    v-for="section in linkSections"
                    :key="section.title"
                    class="footer-links-container"
                >
                    <h3 class="footer-heading">{{ section.title }}</h3>
                    <ul class="footer-links">
                        <li
                            v-for="link in section.links"
                            :key="link.name"
                            class="footer-link"
                        >
                            <a
                                :href="link.url"
                                @click.prevent="handleLinkClick(link.name)"
                                :aria-label="link.label"
                            >{{ link.label }}</a>
                        </li>
                    </ul>
                </div>
            </div>

            <div class="footer-bottom">
                <p>&copy; {{ currentYear }} BlogSphere Pro. All rights reserved.</p>
            </div>
        </div>
    </footer>
</template>

<script>
export default {
    name: 'Footer',
    emits: ['social-click', 'link-click'],
    data() {
        return {
            currentYear: new Date().getFullYear(),
            socials: [
                {
                    name: 'twitter',
                    label: 'Twitter',
                    icon: 'fab fa-twitter',
                    url: 'https://twitter.com/',
                },
                {
                    name: 'facebook',
                    label: 'Facebook',
                    icon: 'fab fa-facebook-f',
                    url: 'https://facebook.com/',
                },
                {
                    name: 'instagram',
                    label: 'Instagram',
                    icon: 'fab fa-instagram',
                    url: 'https://instagram.com/',
                },
                {
                    name: 'linkedin',
                    label: 'LinkedIn',
                    icon: 'fab fa-linkedin-in',
                    url: 'https://linkedin.com/',
                },
            ],
            linkSections: [
                {
                    title: 'Platform',
                    links: [
                        { name: 'features', label: 'Features', url: '#' },
                        { name: 'pricing', label: 'Pricing', url: '#' },
                        { name: 'blog', label: 'Blog', url: '#' },
                        { name: 'support', label: 'Support', url: '#' },
                    ],
                },
                {
                    title: 'Company',
                    links: [
                        { name: 'about', label: 'About Us', url: '#' },
                        { name: 'careers', label: 'Careers', url: '#' },
                        { name: 'press', label: 'Press', url: '#' },
                        { name: 'contact', label: 'Contact', url: '#' },
                    ],
                },
                {
                    title: 'Legal',
                    links: [
                        { name: 'terms', label: 'Terms of Service', url: '#' },
                        { name: 'privacy', label: 'Privacy Policy', url: '#' },
                        { name: 'cookies', label: 'Cookie Policy', url: '#' },
                        { name: 'gdpr', label: 'GDPR', url: '#' },
                    ],
                },
            ],
        };
    },
    methods: {
        handleSocialClick(socialName) {
            this.$emit('social-click', socialName);
            // In a real app, you might want to track this or open in new window
            window.open(this.socials.find(s => s.name === socialName)?.url, '_blank');
        },
        handleLinkClick(linkName) {
            this.$emit('link-click', linkName);
            // In a real app, you would navigate to the appropriate page
            console.log(`Navigating to: ${linkName}`);
        },
    },
};
</script>

<style scoped>
.footer {
    padding: 3rem 0 1rem;
    margin-top: auto;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
}

.footer-content {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    justify-content: space-between;
    margin-bottom: 2rem;
}

.footer-about {
    flex: 1 1 250px;
    min-width: 220px;
}

.footer-logo {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--dark);
}

.footer-description {
    margin-bottom: 1rem;
    color: #6c757d;
    line-height: 1.5;
}

.social-links {
    display: flex;
    gap: 0.75rem;
}

.social-link {
    color: #555;
    font-size: 1.2rem;
    transition: color 0.2s, transform 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.social-link:hover {
    color: #007bff;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.footer-links-container {
    flex: 1 1 150px;
    min-width: 140px;
}

.footer-heading {
    font-size: 1.1rem;
    margin-bottom: 0.75rem;
    font-weight: 600;
    color: var(--dark);
}

.footer-links {
    list-style: none;
    padding: 0;
    margin: 0;
}

.footer-link a {
    color: #6c757d;
    text-decoration: none;
    display: block;
    padding: 0.35rem 0;
    transition: color 0.2s, padding-left 0.2s;
}

.footer-link a:hover {
    color: #007bff;
    padding-left: 5px;
}

.footer-bottom {
    text-align: center;
    margin-top: 2rem;
    color: #6c757d;
    font-size: 0.95rem;
    border-top: 1px solid #dee2e6;
    padding-top: 1rem;
}

@media (max-width: 768px) {
    .footer-content {
        flex-direction: column;
        gap: 1.5rem;
    }
    
    .footer-links-container,
    .footer-about {
        min-width: 0;
    }
    
    .newsletter-input-group {
        flex-direction: column;
    }
    
    .newsletter-btn {
        width: 100%;
    }
}

/* Dark mode styles */
body.dark-mode .footer-logo {
    color: var(--white);
}

body.dark-mode .footer-heading {
    color: var(--white);
}

body.dark-mode .footer-link a {
    color: #b0b0b0;
}

body.dark-mode .footer-link a:hover {
    color: var(--primary);
}

body.dark-mode .footer-bottom {
    color: #b0b0b0;
    border-top: 1px solid #444;
}

body.dark-mode .social-link {
    color: #b0b0b0;
    background-color: rgba(255, 255, 255, 0.1);
}

body.dark-mode .social-link:hover {
    color: var(--primary);
}
</style>