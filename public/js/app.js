// Detectar Scroll para cambiar estilo del Navbar
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mensaje de prueba para botones (solo para desarrollo)
const botones = document.querySelectorAll('button');
botones.forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Evitamos que recargue la página si es un form
        if(e.target.type !== 'submit') {
            console.log('Click en botón:', e.target.innerText);
        }
    });
});



