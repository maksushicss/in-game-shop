let shopIcon = document.querySelector(".shop-icon")
let cartArea = document.querySelector(".cart-area")
let products = document.querySelectorAll(".item")
let cartItemArea = document.querySelector(".cart-item-area")
let totalAmountEl = document.querySelector(".total-amount")
let allProductsData = []
let newArray = [] // itemleri tek tek tutuldugu array bu
let itemColorDiv
let cartItems = [] // sepetteki ürünleri tutacak array
let allProducts = []

let itemsArea = document.querySelector(".items-area") // itemlerin sıralandığı container

shopIcon.addEventListener("click", () => {
    //cart ıcona tılayınca sepet açılır
    cartArea.classList.toggle("active")
})

//api den ürünleri çek

window.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("./products.json")
        if (!response.ok) throw new Error("Dosya bulunamadı.")

        const responseData = await response.json()
        allProducts = [...responseData.products]
        renderProducts(allProducts)
    } catch (error) {
        console.log("Veri yükleme hatası", error)
    }
})

function renderProducts(datas) {
    const itemsArea = document.querySelector(".items-area")
    itemsArea.innerHTML = ""

    datas.forEach((data) => {
        let colorsHtml = data.color
            .map((color) => {
                try {
                    return `<div class="item-color" style="background-color: ${color}" title="${color}"></div>`
                } catch (e) {
                    return `<div class="item-color" style="background-color: #CCCCCC; border: 1px dashed red;" title="Geçersiz renk: ${color}"></div>`
                }
            })
            .join("")

        const itemElement = document.createElement("div")
        itemElement.className = "item"
        itemElement.dataset.id = data.id

        itemElement.innerHTML = `
            <div class="item-photo"><img src="" alt="${data.title}" /></div>
            <p class="item-name">${data.title}</p>
            <p class="item-category">${data.category}</p>
            <div class="item-colors">${colorsHtml}</div>
            <p class="item-stock">Stok: ${data.stock}</p>
            <p class="item-price">Fiyat: ${data.price} TL</p>
            <button class="buy-button" data-id="${data.id}">Sepete Ekle</button>
        `

        itemsArea.appendChild(itemElement)

        // Her ürün için ayrı event listener ekleyelim
        const buyButton = itemElement.querySelector(".buy-button")
        buyButton.addEventListener("click", (e) => {
            const productId = parseInt(e.target.getAttribute("data-id"))
            const selectedProduct = datas.find((product) => product.id === productId)

            if (selectedProduct) {
                addToCart(selectedProduct)

                // Feedback
                e.target.textContent = "Eklendi ✓"
                setTimeout(() => {
                    e.target.textContent = "Sepete Ekle"
                }, 1500)
            }
        })
    })
}
// apiden gelen ürünleri yazdırmak için fonksiyon

function showColorToItems(datas) {
    let colorArray = []

    datas.forEach((data) => {
        data.color.forEach((color) => {
            colorArray.push(color)
        })
    })
    return colorArray
}

function addItemToCart(datas) {
    const buyButtons = itemElement.querySelectorAll(".buy-button")

    buyButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
            const productId = parseInt(e.target.getAttribute("data-id"))
            const selectedProduct = datas.find((product) => product.id === productId) // tıklanan ürünü datas arrayden indexx i ile al
            if (selectedProduct) {
                addToCart(selectedProduct)
            }

            button.textContent = "Sepete Eklendi ✓"
            setTimeout(() => {
                button.textContent = "Satın Al"
            }, 1000)
        })
    })
}

function addToCart(product) {
    const existingItem = cartItems.find((item) => item.id === product.id)
    const originalProduct = allProducts.find((p) => p.id === product.id)

    if (existingItem) {
        if (existingItem.quantity >= originalProduct.stock) {
            alert("Stokta yeterli ürün yok")
            return
        }
        existingItem.quantity += 1
    } else {
        cartItems.push({ ...product, quantity: 1 })
    }
    updateCartUI()
    updateCartCount()
}

function updateCartUI() {
    cartItemArea.innerHTML = ""
    if (cartItems.length === 0) {
        cartItemArea.innerHTML = ""
        totalAmountEl.textContent = `0 TL`
        return
    }

    cartItems.forEach((item) => {
        const cartItem = document.createElement("div")
        cartItem.classList.add("cart-item")
        cartItem.setAttribute("data-id", item.id)

        cartItem.innerHTML = `
                            <div class="cart-l-side">
                                <div class="cart-item-photo"><img src ="${item.image}" alt ="${
            item.title
        }"></div>
                                <div class="cart-infos">
                                    <p class="cart-item-name">${item.title}</p>
                                    <p class="cart-item-price">${Math.floor(
                                        item.price * item.quantity,
                                    )} TL</p>
                                </div>
                            </div>
                            <div class="cart-r-side">
                                <div class="amount-section">
                                    <button class="decrease-button">-</button>
                                    <div class="amount-number">${item.quantity}</div>
                                    <button class="increase-button">+</button>
                                </div>
                                <div class="delete-btn">
                                    <i class="fa-solid fa-trash"></i>
                                </div>
                            </div>
        `
        cartItemArea.appendChild(cartItem)
    })
    //toplam tutarı güncelle
    updateTotalAmount()

    //butonlara eventleri ekle
    setupCartButtons()

    //sepet ikonundaki sayıyı güncelle
    updateCartCount()
}

function setupCartButtons() {
    // Arttırma butonları

    document.querySelectorAll(".increase-button").forEach((button) => {
        button.addEventListener("click", (e) => {
            const cartItem = e.target.closest(".cart-item")
            const productId = parseInt(cartItem.getAttribute("data-id"))
            const item = cartItems.find((item) => item.id === productId)

            if (item.quantity >= item.stock) {
                alert("Stokta yeterli ürün yok!")
                return
            }

            item.quantity += 1
            updateCartUI()
        })
    })

    document.querySelectorAll(".decrease-button").forEach((button) => {
        button.addEventListener("click", (e) => {
            const cardItem = e.target.closest(".cart-item")
            const productId = parseInt(cardItem.getAttribute("data-id"))
            const item = cartItems.find((item) => item.id === productId)

            if (item.quantity > 1) {
                item.quantity -= 1
                updateCartUI()
            } else {
                removeFromCart(productId)
            }
        })
    })

    //silme butonları

    document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", (e) => {
            const cartItem = e.target.closest(".cart-item")
            const productId = parseInt(cartItem.getAttribute("data-id"))
            removeFromCart(productId)
        })
    })
}

function removeFromCart(productId) {
    cartItems = cartItems.filter((item) => item.id !== productId)
    updateCartUI()
    updateCartCount()
}

function updateTotalAmount() {
    totalAmountEl.textContent = `${calculateTotal()} TL`
}

function calculateTotal() {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)
}

//ödeme butonu
document.querySelector(".pay-button").addEventListener("click", () => {
    checkout()
    if (cartItems.length > 0) {
        console.log(`Ödeme başarılı! Toplam Tutar: ${calculateTotal()} TL`)
        cartItems = []
        updateCartUI()
        updateCartCount()
    } else {
        return console.log("Sepetiniz boş!")
    }
})

function updateCartCount() {
    const cartCountEl = document.querySelector(".in-cart-item-number")
    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0)
    cartCountEl.textContent = totalItems
    cartCountEl.style.display = totalItems > 0 ? "flex" : "none"
}

function checkout() {
    if (cartItems.length === 0) {
        console.log("Sepetiniz boş!")
    }

    let receipt = `SATIN ALIM ÖZETİ:\n\n`
    cartItems.forEach((item) => {
        receipt += `${item.title} - ${item.quantity} x ${item.price} TL = ${
            item.quantity * item.price
        } TL \n`
    })
    receipt += `\nTOPLAM: ${calculateTotal()} TL`

    console.log(receipt)
    updateStock()
    //sepeti temizle ve UI güncelle
    cartItems = [] // sepeti boşalt
    updateCartUI() // sepet görünümünü güncelle
    updateCartCount() // sepet sayacını düzenle
}

function updateStock() {
    cartItems.forEach((item) => {
        const product = allProducts.find((p) => p.id === item.id)
        if (product) {
            product.stock -= item.quantity //stoktan düşür
        }
    })
    renderProducts(allProducts) // ürün listesini yenile (stoklar güncellensin)
}
