$('.owl-carousel').owlCarousel({
    autoplay: true,
    autoplayHoverPause: true,
    autoplayTimeout: 5000,
    loop: true,
    slideBy: 3,
    nav: true,
    dots: false,
    responsive: {
        0: {
            items: 1
        },
        600: {
            items: 3
        },
        1200: {
            items: 4
        }
    }
})

window.screen = () => {
    if (this.screen < 600) {
        console.log(this.screen)
    }
}


