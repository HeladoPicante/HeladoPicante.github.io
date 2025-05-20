document.addEventListener('DOMContentLoaded', function(){
    desplegarNavegacion()
    cambiarEnlaceSegunResolucion()
    window.addEventListener('resize', cambiarEnlaceSegunResolucion)
    flipImg()
})

function desplegarNavegacion() {
    const burger = document.querySelector('.burger-button')
    const nav = document.querySelector('.navegacion-principal')

    burger.addEventListener('click', ()=>{
        burger.classList.toggle('active')
        nav.classList.toggle('active')
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

function cambiarEnlaceSegunResolucion(){
    const enlaces = document.querySelectorAll('.enlace')

    enlaces.forEach(enlace => {
        if(window.innerWidth <= 768){
            enlace.setAttribute('href', '#contacto')
        }else{
            enlace.setAttribute('href', '#footer')
        }
    })
}