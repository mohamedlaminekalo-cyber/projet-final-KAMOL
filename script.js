/**
 * Script principal pour le Restaurant MOYAH
 */

// 1. Tableau des plats (Facilement modifiable : prix, descriptions, images, catégories)
const dishes = [
    {
        id: 1,
        name: "Kédjénou de poulet pondeuse",
        category: "traditionnel",
        price: 7000,
        description: "Poulet mijoté lentement avec des légumes et des épices traditionnelles. Accompagnements : riz ou attiéké.",
        image: "image/kedjenou-de-poulet-ivoirien.webp"

    },
    {
        id: 2,
        name: "Sauce graine",
        category: "sauces",
        price: 4000,
        description: "Sauce traditionnelle ivoirienne à base de noix de palme avec viande de brousse ou viande de bœuf. Accompagnements : riz ou foutou.",
        image: "image/foutou%20sauce%20graine.jpg"
    },
    {
        id: 3,
        name: "Placali sauce gombo",
        category: "traditionnel",
        price: 3000,
        description: "Placali bien onctueux accompagné d'une sauce gombo traditionnelle relevée avec escargot, crabes et poissons.",
        image: "image/Placali_avec_sauce_gombo.jpg"
    },
    {
        id: 4,
        name: "Poisson braisé ou grillé",
        category: "grillades",
        price: 5000,
        description: "Délicieux poisson frais braisé aux braises, accompagné d'attiéké, de frites.",
        image: "image/carpe%20brais%C3%A9.webp"
    },
    {
        id: 5,
        name: "Poulet braisé ou grillé",
        category: "grillades",
        price: 5000,
        description: "Poulet tendre mariné aux épices locales, braisé à perfection, servi avec attiéké, alloco ou frites.",
        image: "image/poulet%20brais%C3%A9.jpeg"
    }
];

// Configuration variable
const DELIVERY_FEE = 1500; // Frais de livraison indicatifs en FCFA
const WHATSAPP_NUMBER = "2250707596072"; // Numéro WhatsApp du restaurant (modifiable)

// État du panier (chargé depuis localStorage si disponible)
let cart = JSON.parse(localStorage.getItem('moyah_cart')) || [];

// Éléments du DOM
const menuGrid = document.getElementById('menu-grid');
const categoryFilters = document.getElementById('category-filters');
const searchInput = document.getElementById('search-input');
const cartBtn = document.getElementById('cart-btn');
const closeCartBtn = document.getElementById('close-cart');
const cartDrawer = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartCountSpan = document.getElementById('cart-count');
const cartSubtotalSpan = document.getElementById('cart-subtotal');
const cartDeliveryFeeSpan = document.getElementById('cart-delivery-fee');
const cartTotalSpan = document.getElementById('cart-total');
const clearCartBtn = document.getElementById('clear-cart-btn');
const checkoutBtn = document.getElementById('checkout-btn');
const checkoutModal = document.getElementById('checkout-modal');
const checkoutOverlay = document.getElementById('checkout-overlay');
const closeCheckoutBtn = document.getElementById('close-checkout');
const orderForm = document.getElementById('order-form');
const deliveryModeSelect = document.getElementById('delivery-mode');
const addressContainer = document.getElementById('address-container');
const clientAddressInput = document.getElementById('client-address');
const modalFinalTotalSpan = document.getElementById('modal-final-total');
const receiptModal = document.getElementById('receipt-modal');
const closeReceiptBtn = document.getElementById('close-receipt');
const printBtn = document.getElementById('print-btn');
const whatsappOrderBtn = document.getElementById('whatsapp-order-btn');
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const currentYearSpan = document.getElementById('current-year');
const heroOrderBtn = document.getElementById('hero-order-btn');

// Variable globale pour stocker la dernière commande générée
let lastOrderData = null;

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    currentYearSpan.textContent = new Date().getFullYear();
    renderMenu(dishes);
    updateCartUI();

    // Écouteurs d'événements
    setupEventListeners();
});

// Écouteurs d'événements principaux
function setupEventListeners() {
    // Menu Mobile Toggle
    menuToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    // Bouton Hero Commander
    heroOrderBtn.addEventListener('click', () => {
        openCart();
    });

    // Filtres par catégorie
    categoryFilters.addEventListener('click', (e) => {
        if (e.target.classList.contains('category-btn')) {
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.classList.remove('bg-moyahOrange', 'text-white', 'shadow');
                btn.classList.add('bg-white', 'text-moyahDark', 'border', 'border-gray-200');
            });
            e.target.classList.remove('bg-white', 'text-moyahDark', 'border', 'border-gray-200');
            e.target.classList.add('bg-moyahOrange', 'text-white', 'shadow');

            const category = e.target.getAttribute('data-category');
            filterMenu(category, searchInput.value);
        }
    });

    // Barre de recherche
    searchInput.addEventListener('input', (e) => {
        const activeCategoryBtn = document.querySelector('.category-btn.bg-moyahOrange');
        const category = activeCategoryBtn ? activeCategoryBtn.getAttribute('data-category') : 'tous';
        filterMenu(category, e.target.value);
    });

    // Ouverture / Fermeture du Panier
    cartBtn.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    // Vider le panier
    clearCartBtn.addEventListener('click', () => {
        cart = [];
        saveCart();
        updateCartUI();
    });

    // Bouton Valider la commande dans le panier
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert("Votre panier est vide.");
            return;
        }
        closeCart();
        openCheckoutModal();
    });

    // Fermeture modal de commande
    closeCheckoutBtn.addEventListener('click', closeCheckoutModal);
    checkoutOverlay.addEventListener('click', closeCheckoutModal);

    // Gestion du mode de livraison (Afficher/Masquer l'adresse)
    deliveryModeSelect.addEventListener('change', (e) => {
        if (e.target.value === 'retrait') {
            addressContainer.style.display = 'none';
            clientAddressInput.required = false;
        } else {
            addressContainer.style.display = 'block';
            clientAddressInput.required = true;
        }
        updateModalTotal();
    });

    // Soumission du formulaire de commande
    orderForm.addEventListener('submit', handleOrderSubmit);

    // Fermeture du reçu
    closeReceiptBtn.addEventListener('click', () => {
        receiptModal.classList.add('hidden');
    });

    // Impression
    printBtn.addEventListener('click', () => {
        window.print();
    });

    // Envoi sur WhatsApp
    whatsappOrderBtn.addEventListener('click', sendOrderToWhatsApp);
}

// Fonction d'affichage du menu
function renderMenu(itemsToRender) {
    menuGrid.innerHTML = '';

    if (itemsToRender.length === 0) {
        menuGrid.innerHTML = `
            <div class="col-span-full text-center py-12 text-gray-500">
                <i class="fa-solid fa-utensils text-4xl mb-3 text-gray-300"></i>
                <p>Aucun plat trouvé correspondant à votre recherche.</p>
            </div>
        `;
        return;
    }

    itemsToRender.forEach(dish => {
        const card = document.createElement('div');
        card.className = "bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition duration-300 border border-gray-100 flex flex-col";
        
        card.innerHTML = `
            <div class="relative overflow-hidden h-56 bg-gray-100">
                <img src="${dish.image}" alt="${escapeHtml(dish.name)}" class="dish-image group-hover:scale-105 transition duration-500" onerror="this.src='image/carpe%20brais%C3%A9.webp'">
                <span class="absolute top-4 right-4 bg-moyahGreen text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                    ${formatPrice(dish.price)}
                </span>
            </div>
            <div class="p-6 flex-1 flex flex-col justify-between">
                <div>
                    <h3 class="text-xl font-bold text-moyahDark mb-2">${escapeHtml(dish.name)}</h3>
                    <p class="text-gray-600 text-sm mb-6 leading-relaxed">${escapeHtml(dish.description)}</p>
                </div>
                <button onclick="addToCart(${dish.id})" class="w-full bg-moyahCream hover:bg-moyahOrange text-moyahDark hover:text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 border border-orange-100">
                    <i class="fa-solid fa-cart-plus"></i> Ajouter au panier
                </button>
            </div>
        `;
        menuGrid.appendChild(card);
    });
}

// Filtrage des plats
function filterMenu(category, searchQuery) {
    let filtered = dishes;

    if (category !== 'tous') {
        filtered = filtered.filter(dish => dish.category === category);
    }

    if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(dish => 
            dish.name.toLowerCase().includes(query) || 
            dish.description.toLowerCase().includes(query)
        );
    }

    renderMenu(filtered);
}

// Gestion du Panier
function addToCart(dishId) {
    const dish = dishes.find(d => d.id === dishId);
    if (!dish) return;

    const existingItem = cart.find(item => item.id === dishId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: dish.id,
            name: dish.name,
            price: dish.price,
            image: dish.image,
            quantity: 1
        });
    }

    saveCart();
    updateCartUI();
    openCart();
}

function updateCartItemQuantity(dishId, change) {
    const item = cart.find(i => i.id === dishId);
    if (!item) return;

    item.quantity += change;
    if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== dishId);
    }

    saveCart();
    updateCartUI();
}

function removeFromCart(dishId) {
    cart = cart.filter(i => i.id !== dishId);
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('moyah_cart', JSON.stringify(cart));
}

function updateCartUI() {
    // Nombre total d'articles
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountSpan.textContent = totalCount;

    // Rendu des articles dans le tiroir
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="text-center py-12 text-gray-400">
                <i class="fa-solid fa-basket-shopping text-5xl mb-3 text-gray-200"></i>
                <p class="font-medium text-gray-500">Votre panier est vide</p>
                <p class="text-xs text-gray-400 mt-1">Découvrez notre menu et ajoutez de délicieux plats.</p>
            </div>
        `;
        cartSubtotalSpan.textContent = formatPrice(0);
        cartDeliveryFeeSpan.textContent = formatPrice(0);
        cartTotalSpan.textContent = formatPrice(0);
        return;
    }

    let subtotal = 0;

    cart.forEach(item => {
        const itemSubtotal = item.price * item.quantity;
        subtotal += itemSubtotal;

        const cartItemEl = document.createElement('div');
        cartItemEl.className = "flex items-center justify-between gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100";
        cartItemEl.innerHTML = `
            <img src="${item.image}" alt="${escapeHtml(item.name)}" class="w-16 h-16 object-cover rounded-lg">
            <div class="flex-1 min-w-0">
                <h4 class="font-bold text-sm text-moyahDark truncate">${escapeHtml(item.name)}</h4>
                <p class="text-xs text-gray-500">${formatPrice(item.price)} l'unité</p>
                <div class="flex items-center gap-2 mt-2">
                    <button onclick="updateCartItemQuantity(${item.id}, -1)" class="w-6 h-6 bg-white border border-gray-200 rounded flex items-center justify-center text-xs font-bold hover:bg-gray-100">-</button>
                    <span class="text-xs font-bold">${item.quantity}</span>
                    <button onclick="updateCartItemQuantity(${item.id}, 1)" class="w-6 h-6 bg-white border border-gray-200 rounded flex items-center justify-center text-xs font-bold hover:bg-gray-100">+</button>
                </div>
            </div>
            <div class="text-right">
                <p class="font-bold text-sm text-moyahGreen">${formatPrice(itemSubtotal)}</p>
                <button onclick="removeFromCart(${item.id})" class="text-red-400 hover:text-red-600 text-xs mt-2"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItemEl);
    });

    const deliveryFee = deliveryModeSelect && deliveryModeSelect.value === 'retrait' ? 0 : DELIVERY_FEE;
    const total = subtotal + deliveryFee;

    cartSubtotalSpan.textContent = formatPrice(subtotal);
    cartDeliveryFeeSpan.textContent = formatPrice(deliveryFee);
    cartTotalSpan.textContent = formatPrice(total);
}

// Ouverture / Fermeture tiroir panier
function openCart() {
    cartDrawer.classList.remove('hidden');
}

function closeCart() {
    cartDrawer.classList.add('hidden');
}

// Gestion Modal de Commande
function openCheckoutModal() {
    updateModalTotal();
    checkoutModal.classList.remove('hidden');
}

function closeCheckoutModal() {
    checkoutModal.classList.add('hidden');
}

function updateModalTotal() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = deliveryModeSelect.value === 'retrait' ? 0 : DELIVERY_FEE;
    const total = subtotal + deliveryFee;
    modalFinalTotalSpan.textContent = formatPrice(total);
}

// Soumission Commande et Génération du Reçu
function handleOrderSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('client-name').value.trim();
    const phone = document.getElementById('client-phone').value.trim();
    const mode = deliveryModeSelect.value;
    const paymentMethod = document.getElementById('payment-method').value;
    const address = clientAddressInput.value.trim();
    const notes = document.getElementById('client-notes').value.trim();

    if (!name || !phone || (mode === 'livraison' && !address)) {
        alert("Veuillez remplir tous les champs obligatoires.");
        return;
    }

    const orderId = 'MOYAH-' + Math.floor(100000 + Math.random() * 900000);
    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR') + ' à ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = mode === 'retrait' ? 0 : DELIVERY_FEE;
    const total = subtotal + deliveryFee;

    // Stocker les données pour WhatsApp
    lastOrderData = {
        orderId,
        dateStr,
        name,
        phone,
        mode: mode === 'livraison' ? 'Livraison à domicile' : 'Retrait au restaurant',
        paymentMethod,
        address: mode === 'livraison' ? address : 'N/A (Retrait sur place)',
        notes: notes || 'Aucune',
        items: [...cart],
        subtotal,
        deliveryFee,
        total
    };

    // Remplir le reçu
    document.getElementById('receipt-order-id').textContent = orderId;
    document.getElementById('receipt-date').textContent = dateStr;
    document.getElementById('receipt-name').textContent = name;
    document.getElementById('receipt-phone').textContent = phone;
    document.getElementById('receipt-mode').textContent = lastOrderData.mode;
    document.getElementById('receipt-payment').textContent = paymentMethod;
    
    if (mode === 'livraison') {
        document.getElementById('receipt-address-wrapper').style.display = 'block';
        document.getElementById('receipt-address').textContent = address;
    } else {
        document.getElementById('receipt-address-wrapper').style.display = 'none';
    }

    if (notes) {
        document.getElementById('receipt-notes-wrapper').style.display = 'block';
        document.getElementById('receipt-notes').textContent = notes;
    } else {
        document.getElementById('receipt-notes-wrapper').style.display = 'none';
    }

    const receiptItemsList = document.getElementById('receipt-items-list');
    receiptItemsList.innerHTML = '';
    cart.forEach(item => {
        const row = document.createElement('div');
        row.className = "flex justify-between";
        row.innerHTML = `
            <span>${item.quantity}x ${escapeHtml(item.name)}</span>
            <span class="font-medium">${formatPrice(item.price * item.quantity)}</span>
        `;
        receiptItemsList.appendChild(row);
    });

    document.getElementById('receipt-subtotal').textContent = formatPrice(subtotal);
    document.getElementById('receipt-delivery').textContent = formatPrice(deliveryFee);
    document.getElementById('receipt-total').textContent = formatPrice(total);

    // Vider le panier et localStorage après validation de la commande
    cart = [];
    saveCart();
    updateCartUI();

    // Fermer le formulaire et ouvrir le reçu
    closeCheckoutModal();
    receiptModal.classList.remove('hidden');
}

// Envoi de la commande préremplie sur WhatsApp
function sendOrderToWhatsApp() {
    if (!lastOrderData) return;

    let message = `*NOUVELLE COMMANDE - RESTAURANT MOYAH*\n\n`;
    message += `📋 *N° de commande :* ${lastOrderData.orderId}\n`;
    message += `📅 *Date :* ${lastOrderData.dateStr}\n\n`;
    message += `👤 *Client :* ${lastOrderData.name}\n`;
    message += `📞 *Téléphone :* ${lastOrderData.phone}\n`;
    message += `📍 *Mode :* ${lastOrderData.mode}\n`;
    message += `💳 *Paiement :* ${lastOrderData.paymentMethod} au +225 07 07 59 60 72\n`;
    if (lastOrderData.mode === 'Livraison à domicile') {
        message += `🏠 *Adresse :* ${lastOrderData.address}\n`;
    }
    message += `💬 *Instructions :* ${lastOrderData.notes}\n\n`;
    message += `🛒 *Plats commandés :*\n`;

    lastOrderData.items.forEach(item => {
        message += `- ${item.quantity}x ${item.name} (${formatPrice(item.price * item.quantity)})\n`;
    });

    message += `\n💰 *Sous-total :* ${formatPrice(lastOrderData.subtotal)}`;
    message += `\n🚚 *Frais de livraison :* ${formatPrice(lastOrderData.deliveryFee)}`;
    message += `\n*TOTAL : ${formatPrice(lastOrderData.total)}*`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
}

// Fonctions utilitaires
function formatPrice(price) {
    return price.toLocaleString('fr-FR') + ' FCFA';
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}