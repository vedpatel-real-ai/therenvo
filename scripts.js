/* Subscribely Production Script
  Includes: Theme Toggle, Mobile Menu, Pricing Logic, Savings Calculator, Analytics
*/

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Theme Toggle Logic ---
    const themeToggle = document.getElementById('themeToggle');
    const htmlEl = document.documentElement;
    const storedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const setTheme = (theme) => {
        htmlEl.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    };

    // Initialize Theme
    if (storedTheme) {
        setTheme(storedTheme);
    } else {
        setTheme(systemPrefersDark ? 'dark' : 'light');
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlEl.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });

    // --- 2. Mobile Menu Toggle ---
    const menuBtn = document.querySelector('.mobile-menu-toggle');
    const nav = document.getElementById('mainNav');

    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
            menuBtn.setAttribute('aria-expanded', !isExpanded);
            nav.classList.toggle('open');
        });
    }

    // --- 3. Pricing Toggle Logic (Global across pages) ---
    const pricingToggle = document.getElementById('pricingToggle');
    
    // If on pricing page
    if (pricingToggle) {
        const updatePricingDisplay = () => {
            const isAnnual = pricingToggle.checked;
            
            // Logic for the specific 'Strict' 3-card layout elements if they exist
            // Note: The specific IDs for the strict layout cards weren't strictly enforced in HTML, 
            // so we will target via CTA attributes or data attributes if needed.
            // However, the Savings Calculator needs this state too.
            
            // Tracking event
            trackEvent('pricing_toggle', { plan: isAnnual ? 'annual' : 'monthly' });
            
            // Update Savings Calculator if it exists
            calculateSavings();
        };

        pricingToggle.addEventListener('change', updatePricingDisplay);
    }

    // --- 4. Interactive Savings Calculator ---
    const rangeInput = document.getElementById('monthlySpend');
    const spendDisplay = document.getElementById('spendValue');
    const savingsResult = document.getElementById('savingsResult');

    const calculateSavings = () => {
        if (!rangeInput || !savingsResult) return;

        const monthlySpend = parseInt(rangeInput.value);
        spendDisplay.textContent = monthlySpend;

        // Logic: 
        // 1. Direct Plan Savings: Monthly Premium ($4.99*12 = $59.88) - Annual ($39) = $20.88 saved.
        // 2. AI Optimizations: Assume conservative 10% savings on total spend found by AI.
        const planSavings = 20.88; 
        const aiSavings = monthlySpend * 12 * 0.10;
        const totalSavings = Math.floor(planSavings + aiSavings);

        savingsResult.textContent = totalSavings.toLocaleString();
    };

    if (rangeInput) {
        rangeInput.addEventListener('input', calculateSavings);
        calculateSavings(); // Init
    }

    // --- 5. Analytics / Data Layer Tracking ---
    window.dataLayer = window.dataLayer || [];

    function trackEvent(eventName, params) {
        window.dataLayer.push({
            event: eventName,
            ...params
        });
        // Console log for debugging during dev
        console.log('Event Pushed:', eventName, params);
    }

    // Attach listeners to all elements with data-cta attribute
    const ctaButtons = document.querySelectorAll('[data-cta]');
    ctaButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const ctaId = btn.getAttribute('data-cta');
            trackEvent('cta_click', { cta: ctaId });
            
            // Specific logic for pricing clicks
            if (ctaId.includes('pricing')) {
                let planType = 'free';
                if (ctaId.includes('annual')) planType = 'annual';
                if (ctaId.includes('monthly')) planType = 'monthly';
                trackEvent('pricing_click', { plan: planType });
            }
        });
    });
});