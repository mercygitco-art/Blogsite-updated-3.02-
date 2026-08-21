import { ref, watch, onMounted, onUnmounted, readonly, computed } from 'vue'

export function useDarkMode() {
    const darkMode = ref(false)
    let mediaQuery = null

    const THEME_KEYS = {
        storage: 'blogsphere-theme',
        class: {
            dark: 'dark-mode',
            light: 'light-mode'
        }
    }

    const getSystemPref = () => {
        if (typeof window === 'undefined' || !window.matchMedia) {
            return false
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches
    }

    const applyTheme = (isDark) => {
        if (typeof document === 'undefined') return

        const { dark, light } = THEME_KEYS.class
        
        document.body.classList.add(isDark ? dark : light)
        document.body.classList.remove(isDark ? light : dark)
        document.body.setAttribute('data-theme', isDark ? 'dark' : 'light')
    }

    const toggleDarkMode = () => {
        darkMode.value = !darkMode.value
        localStorage.setItem(THEME_KEYS.storage, darkMode.value ? 'dark' : 'light')
    }

    const setDarkMode = (isDark) => {
        darkMode.value = isDark
        localStorage.setItem(THEME_KEYS.storage, isDark ? 'dark' : 'light')
    }

    const resetToSystem = () => {
        localStorage.removeItem(THEME_KEYS.storage)
        darkMode.value = getSystemPref()
    }

    const handleSystemChange = (e) => {
        if (!localStorage.getItem(THEME_KEYS.storage)) {
            darkMode.value = e.matches
        }
    }

    onMounted(() => {
        const savedTheme = localStorage.getItem(THEME_KEYS.storage)
        
        if (savedTheme === 'dark') {
            darkMode.value = true
        } else if (savedTheme === 'light') {
            darkMode.value = false
        } else {
            darkMode.value = getSystemPref()
        }
        
        applyTheme(darkMode.value)

        if (window.matchMedia) {
            mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
            mediaQuery.addEventListener('change', handleSystemChange)
        }
    })

    // Watch for darkMode changes and apply theme
    watch(darkMode, applyTheme)

    onUnmounted(() => {
        if (mediaQuery) {
            mediaQuery.removeEventListener('change', handleSystemChange)
        }
    })

    return {
        darkMode: readonly(darkMode),
        toggleDarkMode,
        setDarkMode,
        resetToSystem
    }
}