document.addEventListener('DOMContentLoaded', () => {
    // --- Cinematic Intro with Canvas Particles ---
    const introScreen = document.getElementById('intro-screen');
    const mainContent = document.getElementById('main-content');
    const canvas = document.getElementById('intro-canvas');
    const ctx = canvas.getContext('2d');

    // Canvas setup
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Particle system
    const particles = [];
    const particleCount = 120;

    class Particle {
        constructor() {
            this.reset();
            // Start from random position for first frame
            this.y = Math.random() * canvas.height;
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = canvas.height + Math.random() * 100;
            this.size = Math.random() * 2 + 0.5;
            this.speedY = Math.random() * 1.5 + 0.3;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.fadeSpeed = Math.random() * 0.003 + 0.001;
        }
        update() {
            this.y -= this.speedY;
            this.x += this.speedX;
            this.opacity += Math.sin(Date.now() * this.fadeSpeed) * 0.01;
            if (this.y < -10) this.reset();
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, this.opacity)})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    // Connection lines between nearby particles
    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${0.03 * (1 - dist / 100)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    let animationId;
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        drawConnections();
        animationId = requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // Slide up after 4 seconds
    setTimeout(() => {
        mainContent.classList.remove('hidden');
        introScreen.classList.add('slide-up');
        setTimeout(() => {
            introScreen.style.display = 'none';
            cancelAnimationFrame(animationId); // Stop particle animation
        }, 1200);
    }, 4000);






    // --- Products Data & Rendering ---
    const baseProducts = [
        { id: 1, title: "Tracksuit", price: "89.99", oldPrice: "120.00", image1: "pr/1.avif", image2: "pr/11.avif" },
        { id: 2, title: "Tracksuit", price: "34.99", oldPrice: "50.00", image1: "pr/2.avif", image2: "pr/22.avif" },
        { id: 3, title: "Tracksuit", price: "129.99", oldPrice: "180.00", image1: "pr/3.avif", image2: "pr/33.avif" },
        { id: 4, title: "Tracksuit", price: "54.99", oldPrice: "80.00", image1: "pr/4.avif", image2: "pr/44.avif" },
        { id: 5, title: "Tracksuit", price: "64.99", oldPrice: "90.00", image1: "pr/5.avif", image2: "pr/55.avif" },
        { id: 6, title: "Tracksuit", price: "99.99", oldPrice: "140.00", image1: "pr/6.avif", image2: "pr/66.avif" },
        { id: 7, title: "Tracksuit", price: "59.99", oldPrice: "85.00", image1: "pr/7.avif", image2: "pr/77.avif" },
        { id: 8, title: "Tracksuit", price: "39.99", oldPrice: "55.00", image1: "pr/8.avif", image2: "pr/88.avif" },
    ];

    const products = [];
    // Duplicate to make 16 products
    for(let i = 0; i < 2; i++) {
        baseProducts.forEach((p) => {
            products.push({
                id: (i * 8) + p.id,
                title: p.title,
                price: parseFloat(p.price),
                oldPrice: parseFloat(p.oldPrice),
                image: p.image1,
                hoverImage: p.image2
            });
        });
    }

    const productsGrid = document.getElementById('products-grid');

    function renderProducts() {
        productsGrid.innerHTML = '';
        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.style.cursor = 'pointer';
            card.onclick = () => openProductModal(product);
            
            card.innerHTML = `
                <div class="product-img-container">
                    <img src="${product.image}" alt="${product.title}" class="product-img primary-img" loading="lazy">
                    <img src="${product.hoverImage}" alt="${product.title} Alternate" class="product-img hover-img" loading="lazy">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <div class="product-price-container">
                        <span class="old-price">$${product.oldPrice.toFixed(2)}</span>
                        <span class="new-price">$${product.price.toFixed(2)}</span>
                    </div>
                </div>
            `;
            productsGrid.appendChild(card);
        });
    }

    renderProducts();

    // --- Product Modal Logic ---
    const productModal = document.getElementById('product-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalPrice = document.getElementById('modal-price');
    const modalAddToCartBtn = document.getElementById('modal-add-to-cart');
    let currentSelectedProduct = null;

    window.openProductModal = function(product) {
        currentSelectedProduct = product;
        modalImg.src = product.image;
        modalImg.setAttribute('data-img1', product.image);
        modalImg.setAttribute('data-img2', product.hoverImage);
        modalTitle.textContent = product.title;
        modalPrice.innerHTML = `<span class="old-price">$${product.oldPrice.toFixed(2)}</span> <span class="new-price">$${product.price.toFixed(2)}</span>`;
        productModal.classList.add('active');
    };

    modalImg.style.cursor = 'pointer';
    modalImg.addEventListener('click', () => {
        const img1 = modalImg.getAttribute('data-img1');
        const img2 = modalImg.getAttribute('data-img2');
        if (modalImg.getAttribute('src') === img1) {
            modalImg.src = img2;
        } else {
            modalImg.src = img1;
        }
    });

    function closeProductModal() {
        productModal.classList.remove('active');
        currentSelectedProduct = null;
    }

    closeModalBtn.addEventListener('click', closeProductModal);
    productModal.addEventListener('click', (e) => {
        if (e.target === productModal) {
            closeProductModal();
        }
    });

    document.querySelectorAll('.color-circle').forEach(circle => {
        circle.addEventListener('click', (e) => {
            document.querySelectorAll('.color-circle').forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
        });
    });

    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        });
    });

    modalAddToCartBtn.addEventListener('click', () => {
        if (currentSelectedProduct) {
            window.addToCart(currentSelectedProduct.id);
            closeProductModal();
        }
    });


    // --- Shopping Cart Logic ---
    let cart = [];
    const cartToggleBtn = document.getElementById('cart-toggle');
    const cartSidebar = document.getElementById('cart-sidebar');
    const closeCartBtn = document.getElementById('close-cart');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartBadge = document.getElementById('cart-badge');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalPrice = document.getElementById('cart-total-price');

    // Toggle Sidebar
    function toggleCart() {
        cartSidebar.classList.toggle('active');
        cartOverlay.classList.toggle('active');
    }

    cartToggleBtn.addEventListener('click', toggleCart);
    closeCartBtn.addEventListener('click', toggleCart);
    cartOverlay.addEventListener('click', toggleCart);

    // Add to Cart Function
    window.addToCart = function(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        cart.push(product);
        updateCartUI();

        // Animate badge
        cartBadge.classList.add('bump');
        setTimeout(() => cartBadge.classList.remove('bump'), 300);
    };

    // Remove from Cart Function
    window.removeFromCart = function(index) {
        cart.splice(index, 1);
        updateCartUI();
    };

    function updateCartUI() {
        // Update badge count
        cartBadge.textContent = cart.length;

        // Render items
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Cart is currently empty</div>';
            cartTotalPrice.textContent = '$0.00';
            return;
        }

        cartItemsContainer.innerHTML = '';
        let total = 0;

        cart.forEach((item, index) => {
            total += item.price;
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.title}" class="cart-item-img">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">$${item.price}</div>
                </div>
                <button class="remove-item" onclick="removeFromCart(${index})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;
            cartItemsContainer.appendChild(cartItem);
        });

        cartTotalPrice.textContent = `$${total.toFixed(2)}`;
    }
    
    // Checkout Button
    const checkoutBtn = document.querySelector('.checkout-btn');
    checkoutBtn.addEventListener('click', () => {
        if(cart.length === 0) {
            alert('Cart is empty!');
            return;
        }
        alert(`Processing checkout for $${cartTotalPrice.textContent.replace('$', '')} ...`);
        cart = [];
        updateCartUI();
        toggleCart();
    });

});
