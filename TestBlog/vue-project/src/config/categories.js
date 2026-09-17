export const CATEGORY_DEFINITIONS = [
    { id: 'all', name: 'All', navName: 'Home', icon: 'fas fa-home' },
    { id: 'technology', name: 'Technology', icon: 'fas fa-laptop-code' },
    { id: 'lifestyle', name: 'Lifestyle', icon: 'fas fa-heart' },
    { id: 'business', name: 'Business', icon: 'fas fa-chart-line' },
    { id: 'travel', name: 'Travel', icon: 'fas fa-plane' },
    { id: 'food', name: 'Food', icon: 'fas fa-utensils' },
    { id: 'health', name: 'Health', icon: 'fas fa-heartbeat' },
    { id: 'science', name: 'Science', icon: 'fas fa-flask' },
    { id: 'entertainment', name: 'Entertainment', icon: 'fas fa-film' },
    { id: 'news', name: 'News', icon: 'fas fa-newspaper' }
]

export const CATEGORY_NAMES = Object.fromEntries(
    CATEGORY_DEFINITIONS.map(({ id, name }) => [id, name])
)
