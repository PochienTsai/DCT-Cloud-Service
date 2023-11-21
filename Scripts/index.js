var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl)
{
    return new bootstrap.Tooltip(tooltipTriggerEl);
});
var mySwiper = new Swiper('.swiper', {
    // Optional parameters
    direction: 'horizontal',
    speed: 3000,
    loop: true,
    autoplay: {
        delay: 6000,
        disableOnInteraction: false,
    },
    effect: 'slide',
    // If we need pagination
    pagination: {
        el: '.swiper-pagination',
    },

    // Navigation arrows
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
});
