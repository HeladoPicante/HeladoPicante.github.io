document.addEventListener('DOMContentLoaded', function(){
    desplegarNavegacion()
    flipImg()

    crearGeleria()
})

function desplegarNavegacion() {
    const burger = document.querySelector('.burger')
    const nav = document.querySelector('.navegacion-principal')

    burger.addEventListener('click', ()=>{
        nav.classList.toggle('activo')
    })
}

function flipImg(){
    const btns = document.querySelectorAll('.btn-ver')

    btns.forEach(boton => {
        boton.addEventListener('click', ()=>{
            const card = boton.closest('.producto') // selecciono el producto más cercano
            boton.textContent = "Ver más"

            if (card){
                card.classList.toggle('flipped')
            }
            
            if(card.classList.contains('flipped')){
                boton.textContent = "Ver menos"
            }
        })
    })
}

function crearGeleria() {
    const CANT_IMG = 16
    const geleria = document.querySelector('.galeria-imagenes')

    for (let i = 1; i <= CANT_IMG; i++) {
        // const imagen = document.createElement('IMG')
        // imagen.loading = 'lazy'
        // imagen.with = '300'
        // imagen.height = '200'
        // imagen.src = `src/img/gallery/thumb/${i}.jpg`
        // imagen.alt = 'Imagen de galería'
        const imagen = document.createElement('PICTURE')
        imagen.innerHTML = `
            <source srcset="build/img/gallery/thumb/${i}.avif" type="image/avif">
            <source srcset="build/img/gallery/thumb/${i}.webp" type="image/webp">
            <img loading="lazy" width="200" height="300" src="build/img/gallery/thumb/${i}.jpg" alt="imagen galeria">
        `;

        // EVENT HANDLER
        imagen.onclick = function(){
            mostrarImagen(i)
        }

        geleria.appendChild(imagen)
    }
}

function mostrarImagen(i) {
    // const imagen = document.createElement('IMG')
    // imagen.src = `src/img/gallery/full/${i}.jpg`
    // imagen.alt = 'Imagen de galería'
    const imagen = document.createElement('PICTURE')
    imagen.innerHTML = `
    <source srcset="build/img/gallery/full/${i}.avif" type="image/avif">
    <source srcset="build/img/gallery/full/${i}.webp" type="image/webp">
    <img loading="lazy" width="200" height="300" src="build/img/gallery/full/${i}.jpg" alt="imagen galeria">
`;

    const modal = document.createElement('DIV')
    modal.classList.add('modal')
    modal.onclick = cerrarModal

    const cerrarModalBtn = document.createElement('BUTTON')
    cerrarModalBtn.textContent = 'X'
    cerrarModalBtn.classList.add('btn-cerrar')
    cerrarModalBtn.onclick = cerrarModal

    modal.appendChild(imagen)
    modal.appendChild(cerrarModalBtn)

    // agregar modal
    const body = document.querySelector('body')
    body.classList.add('overflow-hidden')
    body.appendChild(modal)
}

function cerrarModal() {
    const modal = document.querySelector('.modal')
    modal.classList.add('fade-out')

    setTimeout(() => {
        // if(modal){
        //     modal.remove()
        // }
    
        modal?.remove()

        const body = document.querySelector('body')
        body.classList.remove('overflow-hidden')
    }, 500);
}