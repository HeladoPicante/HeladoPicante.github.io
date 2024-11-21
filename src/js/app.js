document.addEventListener('DOMContentLoaded', function(){
    desplegarNavegacion()
})

function desplegarNavegacion() {
    const burger = document.querySelector('.burger')
    const nav = document.querySelector('.navegacion-principal')

    burger.addEventListener('click', ()=>{
        nav.classList.toggle('activo')
    })
}