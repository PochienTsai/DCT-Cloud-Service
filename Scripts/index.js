var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl)
{
    return new bootstrap.Tooltip(tooltipTriggerEl);
});
// var mySwiper = new Swiper('.swiper', {
//     // Optional parameters
//     direction: 'horizontal',
//     speed: 3000,
//     loop: true,
//     autoplay: {
//         delay: 6000,
//         disableOnInteraction: false,
//     },
//     effect: 'slide',
//     // If we need pagination
//     pagination: {
//         el: '.swiper-pagination',
//     },

//     // Navigation arrows
//     navigation: {
//         nextEl: '.swiper-button-next',
//         prevEl: '.swiper-button-prev',
//     },
// });
function adjustImageSize()
{
    const swiperSlides = document.querySelectorAll('.swiper-slide');

    swiperSlides.forEach((slide) =>
    {
        // 獲取 swiper-slide 的大小而不是整個 swiper 容器的大小
        const slideWidth = slide.offsetWidth;
        const slideHeight = slide.offsetHeight;
        console.log(`slideWidth = ${slideWidth}`);
        console.log(`slideHeight = ${slideHeight}`);
        const img = slide.querySelector('img');

        // 確保圖片加載完成後再進行操作
        function onImageLoad()
        {
            // 比較圖片原始尺寸與 swiper-slide 的尺寸
            if (img.naturalWidth > slideWidth)
            {
                img.style.width = `${slideWidth}px`;
                img.style.objectFit = 'cover';
            }
            else
            {
                img.style.width = '100%';
            }
            if (img.naturalHeight > slideHeight)
            {
                img.style.height = `${slideHeight}px`;
            }
            else
            {
                img.style.height = '100%';
            }
            // if (img.naturalWidth / img.naturalHeight > slideWidth / slideHeight)
            // {
            //     img.style.width = `${slideWidth}px`;
            //     img.style.height = 'auto';
            // } else
            // {
            //     img.style.width = 'auto';
            //     img.style.height = `${slideHeight}px`;
            // }

            // // 防止圖片在另一維度上小於容器尺寸
            // if (img.height < slideHeight)
            // {
            //     img.style.width = 'auto';
            //     img.style.height = `${slideHeight}px`;
            // }
            // if (img.width < slideWidth)
            // {
            //     img.style.width = `${slideWidth}px`;
            //     img.style.height = 'auto';
            // }
        }

        if (img.complete)
        {
            onImageLoad();
        } else
        {
            img.addEventListener('load', onImageLoad);
        }
    });
}

// 在 Swiper 初始化之後調用 adjustImageSize
// 並在窗口大小改變時重新調整
window.addEventListener('load', () =>
{
    // 此處初始化 Swiper
    var mySwiper = new Swiper('.swiper', {
        // Optional parameters
        direction: 'horizontal',
        speed: 3000,
        loop: true,
        // autoplay: {
        //     delay: 6000,
        //     disableOnInteraction: false,
        // },
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

    adjustImageSize();
});
window.addEventListener('resize', adjustImageSize);
