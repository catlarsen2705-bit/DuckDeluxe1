document.addEventListener("DOMContentLoaded", function () {
    // Cookie consent functionality
    const cookieBox = document.getElementById("cookie-box");
    const acceptBtn = document.getElementById("accept-cookies");

    if (cookieBox && acceptBtn) {
        // Tjek om der allerede er accepteret cookies
        const accepted = localStorage.getItem("cookiesAccepted");

        if (!accepted) {
            cookieBox.style.display = "block"; // Vis boksen
        }

        // Når brugeren klikker "Accepter"
        acceptBtn.addEventListener("click", function () {
            localStorage.setItem("cookiesAccepted", "true"); // Gem valg
            cookieBox.style.display = "none"; // Skjul boksen
        });
    }

    // Carousel navigation functionality (seamless loop with clones)
    const scrollLeft = document.getElementById("scroll-left");
    const scrollRight = document.getElementById("scroll-right");
    const carouselScroll = document.getElementById("carousel-scroll");

    if (scrollLeft && scrollRight && carouselScroll) {
        const originalItems = Array.from(carouselScroll.querySelectorAll('.carousel-item'));
        const n = originalItems.length;
        if (n > 0) {
            // clone items to both ends for seamless looping
            originalItems.forEach(node => {
                const c = node.cloneNode(true);
                c.classList.add('clone');
                carouselScroll.appendChild(c);
            });
            for (let i = n - 1; i >= 0; i--) {
                const c = originalItems[i].cloneNode(true);
                c.classList.add('clone');
                carouselScroll.insertBefore(c, carouselScroll.firstChild);
            }

            const allItems = Array.from(carouselScroll.querySelectorAll('.carousel-item'));
            const startIndex = n; // index of the first real item after prepended clones

            // compute step (distance between two adjacent items)
            const computeStep = () => {
                const a = allItems[startIndex];
                const b = allItems[startIndex + 1] || a;
                return Math.max(1, b.offsetLeft - a.offsetLeft);
            };

            let step = computeStep();
            let currentIndex = startIndex;

            // position to the first real item
            carouselScroll.scrollLeft = currentIndex * step;

            // helpers
            const goTo = (index, smooth = true) => {
                const left = index * step;
                carouselScroll.scrollTo({ left, behavior: smooth ? 'smooth' : 'auto' });
                currentIndex = index;
            };

            const adjustIfNeeded = () => {
                const idx = Math.round(carouselScroll.scrollLeft / step);
                if (idx >= startIndex + n) {
                    // moved into appended clones — jump back to equivalent real item
                    const target = idx - n;
                    carouselScroll.scrollLeft = target * step;
                    currentIndex = target;
                } else if (idx < startIndex) {
                    // moved into prepended clones — jump forward
                    const target = idx + n;
                    carouselScroll.scrollLeft = target * step;
                    currentIndex = target;
                } else {
                    currentIndex = idx;
                }
            };

            const next = () => goTo(currentIndex + 1);
            const prev = () => goTo(currentIndex - 1);

            // click handlers
            scrollRight.addEventListener('click', () => { next(); resetAuto(); setTimeout(adjustIfNeeded, 420); });
            scrollLeft.addEventListener('click', () => { prev(); resetAuto(); setTimeout(adjustIfNeeded, 420); });

            // auto-scroll
            let autoInterval = null;
            const startAuto = () => { stopAuto(); autoInterval = setInterval(() => { next(); setTimeout(adjustIfNeeded, 420); }, 3000); };
            const stopAuto = () => { if (autoInterval) { clearInterval(autoInterval); autoInterval = null; } };
            const resetAuto = () => { stopAuto(); startAuto(); };

            // pause/resume on hover/focus
            [carouselScroll, scrollLeft, scrollRight].forEach(el => {
                el.addEventListener('mouseenter', stopAuto);
                el.addEventListener('mouseleave', startAuto);
            });

            // handle manual scroll end (debounced) to adjust if user drags
            let scrollDebounce = null;
            carouselScroll.addEventListener('scroll', () => {
                if (scrollDebounce) clearTimeout(scrollDebounce);
                scrollDebounce = setTimeout(() => {
                    step = computeStep();
                    adjustIfNeeded();
                }, 120);
            });

            // recalc on resize
            window.addEventListener('resize', () => {
                step = computeStep();
                carouselScroll.scrollLeft = currentIndex * step;
            });

            // start
            startAuto();
        }
    }

    // Design Selv - Atelier Customizer functionality
    const basePrice = 499;
    const engravingPrice = 99;
    const priceEl = document.getElementById("price");
    const engravingInput = document.getElementById("engraving");

    if (priceEl && engravingInput) {
        function updatePrice() {
            let price = basePrice;
            if (engravingInput.value.length > 0) {
                price += engravingPrice;
            }
            priceEl.textContent = `Pris: ${price} kr.`;
        }

        engravingInput.addEventListener("input", updatePrice);
    }

    // Simple cart functionality (uses localStorage)
    function getCart() {
        try { return JSON.parse(localStorage.getItem('duck_cart') || '[]'); } catch (e) { return []; }
    }

    function saveCart(cart) {
        localStorage.setItem('duck_cart', JSON.stringify(cart));
    }

    window.addToCart = function (product) {
        const cart = getCart();
        // if product with same id exists, increase quantity
        const existing = cart.find(p => p.id === product.id);
        if (existing) {
            existing.quantity = (existing.quantity || 1) + (product.quantity || 1);
        } else {
            cart.push(Object.assign({}, product));
        }
        saveCart(cart);
        // quick user feedback
        alert(product.title + ' er tilføjet til din kurv.');
        // update header indicator if present
        if (window.updateCartIndicator) window.updateCartIndicator();
    };

    // expose cart helpers globally
    window.getCart = getCart;
    window.saveCart = saveCart;

    // header cart indicator render
    window.updateCartIndicator = function () {
        const cart = getCart();
        const count = cart.reduce((s, p) => s + (p.quantity || 1), 0);
        let el = document.querySelector('.header-cart .cart-bubble');
        if (!el) return;
        el.textContent = count;
    };

    // inject header cart button if header exists
    (function injectHeaderCart(){
        const header = document.querySelector('header');
        if (!header) return;
        if (document.querySelector('.header-cart')) return; // already injected
        const div = document.createElement('div');
        div.className = 'header-cart';
        div.innerHTML = ` <button id="open-cart" aria-label="Åbn kurv">🛒 <span class="cart-bubble">0</span></button>`;
        header.appendChild(div);
        document.getElementById('open-cart').addEventListener('click', function(){ window.location.href = 'cart.html'; });
        // initial count
        window.updateCartIndicator();
    })();
});
