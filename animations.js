/**
 * Проверка является ли клиент мобильным устройством
 * @type {boolean}
 */
var isMobile = !!navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i);

/**
 * Не позволяет функции выполняться часто
 * @param callback
 * @param wait
 * @param context
 * @returns {Function}
 */
function throttle(callback, wait, context = this) {
    var timeout = null;
    var callbackArgs = null;

    var later = () => {
        callback.apply(context, callbackArgs);
        timeout = null;
    };

    return function() {
        if (!timeout) {
            callbackArgs = arguments;
            timeout = setTimeout(later, wait);
        }
    }
}

/**
 * Анимация ссылок, при наведении на ссылку под ней появляется анимированный пузырь
 * @type {{}}
 */
var LinkAnimation = (function () {
    var LINK_BUBBLE = '<svg class="link_bubble" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 51.1 35.3" preserveAspectRatio="xMidYMid slice"><g class="canvas-svg" data-name="link-blob"><g class="morph" data-name="link-blob-anim"><path class="morph-shape-start" fill="#3043CA" d="M11.6,5.4c-1.7,1.1-8.7,5.5-9.9,11.9c-1.5,7.8,6,14.7,14.2,17c10.1,2.8,23.4-0.7,29.6-8.7c0.6-0.8,4.5-6.1,3.1-12.2C46.4,4.6,34.3,0,24.1,1C17.6,1.7,13,4.6,11.6,5.4z"></path><path style="opacity: 0;" class="morph-shape-step" data-timing="0.7" fill="#3043CA" d="M11.6,5.4c-1.7,1.1-8.7,5.5-9.9,11.9c-1.5,7.8,6,14.7,14.2,17c10.1,2.8,23.4-0.7,29.6-8.7c0.6-0.8,4.5-6.1,3.1-12.2C46.4,4.6,34.3,0,24.1,1C17.6,1.7,13,4.6,11.6,5.4z"></path><path style="opacity: 0;" class="morph-shape-step" data-timing="0.7" fill="#3043CA" d="M8.1,8.9c-1.7,1.1-6.7,6.5-7.9,13c-1.5,7.8,6.9,12.3,14.7,9c16.9-7.3,22.4,3.3,28.6-4.7C44,25.3,48,18.3,50,12.4C55.3-3,38.8,1.1,28.6,1.5C18.3,2,9.5,8.1,8.1,8.9z"></path><path style="opacity: 0;" class="morph-shape-step" data-timing="0.7" fill="#3043CA" d="M6.5,8.9c-1.8,1.1-8.1,7.7-6,14c2.6,7.6,6.7,10.1,15.2,11c16.9,1.7,22.4-0.2,28.6-8.2c0.6-0.8,8.3-4.2,6.6-10.2C47.1,2.5,38.2-0.4,27.9,0C17.6,0.5,7.8,8.1,6.5,8.9z"></path></g></g></svg>';
    var LINK_BUBBLE_PARSED = new DOMParser().parseFromString(LINK_BUBBLE, 'text/html');
    var LINK_BUBBLE_SVG = LINK_BUBBLE_PARSED.body.firstChild;

    return {
        init: initLinks
    };

    function appendBubble(link) {
        var svg = LINK_BUBBLE_SVG.cloneNode(true);
        // var link_size = link.getBoundingClientRect();
        var link_size = {
            width: link.offsetWidth,
            height: link.offsetHeight
        };

        var size_attribute = link_size.width > link_size.height ? 'height' : 'width';
        svg.setAttribute(size_attribute, link_size[size_attribute]);

        link.appendChild(svg);
    }

    function initLinks() {

        // Не включаем анимацию на мобильных устройствах
        if (isMobile) {
            console.log('isMobile');
            return;
        }

        var links = Snap.selectAll('.morph_link'),
            links_length = links.length;

        for (var i = 0; i < links_length; i++) {
            var link = links[i].node;

            appendBubble(link);
            animate(link);
        }
    }

    function animate(link) {
        var svg = link.getElementsByClassName('link_bubble')[0];

        var s = Snap(svg);
        var shape = s.select('.morph-shape-start');
        var steps = s.selectAll('.morph-shape-step');

        var points = [];
        for (var i = 0; i < steps.length; i++) {
            points.push(steps[i].node.getAttribute('d'));
        }

        var animation_step = 1;
        var loop = function () {
            shape.animate({ d: points[animation_step++] }, 700, mina.easeout, loop);

            if (animation_step == points.length) {
                animation_step = 0;
            }
        };

        loop();
    }

    function stop(link) {
        var svg = link.getElementsByClassName('link_bubble')[0];

        var s = Snap(svg);
        var shape = s.select('.morph-shape-start');
        shape.stop();
    }
})();

LinkAnimation.init();
