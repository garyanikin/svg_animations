/**
 * Проверка является ли клиент мобильным устройством
 * @type {boolean}
 */
var isMobile = !!navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i);

/**
 * возвращает обёртку, передающую вызов callback не чаще, чем раз в wait миллисекунд
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
    var LINK_BUBBLE = '<svg class="link_bubble" xmlns="http://www.w3.org/2000/svg" width="52" height="36" viewBox="0 0 51.1 35.3" preserveAspectRatio="xMidYMid slice"><g class="canvas-svg" data-name="link-blob"><g class="morph" data-name="link-blob-anim"><path class="morph-shape-start" fill="#3043CA" d="M11.6,5.4c-1.7,1.1-8.7,5.5-9.9,11.9c-1.5,7.8,6,14.7,14.2,17c10.1,2.8,23.4-0.7,29.6-8.7c0.6-0.8,4.5-6.1,3.1-12.2C46.4,4.6,34.3,0,24.1,1C17.6,1.7,13,4.6,11.6,5.4z"></path><path style="opacity: 0;" class="morph-shape-step" data-timing="0.7" fill="#3043CA" d="M11.6,5.4c-1.7,1.1-8.7,5.5-9.9,11.9c-1.5,7.8,6,14.7,14.2,17c10.1,2.8,23.4-0.7,29.6-8.7c0.6-0.8,4.5-6.1,3.1-12.2C46.4,4.6,34.3,0,24.1,1C17.6,1.7,13,4.6,11.6,5.4z"></path><path style="opacity: 0;" class="morph-shape-step" data-timing="0.7" fill="#3043CA" d="M8.1,8.9c-1.7,1.1-6.7,6.5-7.9,13c-1.5,7.8,6.9,12.3,14.7,9c16.9-7.3,22.4,3.3,28.6-4.7C44,25.3,48,18.3,50,12.4C55.3-3,38.8,1.1,28.6,1.5C18.3,2,9.5,8.1,8.1,8.9z"></path><path style="opacity: 0;" class="morph-shape-step" data-timing="0.7" fill="#3043CA" d="M6.5,8.9c-1.8,1.1-8.1,7.7-6,14c2.6,7.6,6.7,10.1,15.2,11c16.9,1.7,22.4-0.2,28.6-8.2c0.6-0.8,8.3-4.2,6.6-10.2C47.1,2.5,38.2-0.4,27.9,0C17.6,0.5,7.8,8.1,6.5,8.9z"></path></g></g></svg>';
    var LINK_BUBBLE_PARSED = new DOMParser().parseFromString(LINK_BUBBLE, 'text/html');
    var LINK_BUBBLE_SVG = LINK_BUBBLE_PARSED.body.firstChild;

    return {
        init: initLinks
    };

    function appendBubble(link) {
        var svg = LINK_BUBBLE_SVG.cloneNode(true);

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
        var canvas = link.getElementsByTagName('canvas')[0];

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
})();

var MorphSVG = function MorphSVG(svg, autoplay) {
    var shape;

    if (autoplay) {
        start();
    }

    return {
        start: start,
        stop: stop
    };

    function start() {
        animate();
    }

    function stop() {
        shape.stop();
    }

    function animate() {
        var s = Snap(svg);
        shape = s.select('.svg_morph__start');
        var steps = s.selectAll('.svg_morph__step');

        var layers = [];

        for (var i = 0; i < steps.length; i++) {
            var step = steps[i].node;

            layers.push({
                points: step.getAttribute('d'),
                duration: Number(step.getAttribute('data-duration')) || 700,
                delay: Number(step.getAttribute('data-delay')) || 0,
            });
        }

        var animation_step = 1;
        var loop = function () {
            var layer = layers[animation_step++];
            shape.animate({ d: layer.points }, layer.duration * 1000, mina.easeinout, function() {
                setTimeout(function () {
                    loop();
                }, layer.delay);
            });

            if (animation_step == layers.length) {
                animation_step = 0;
            }
        };

        loop();
    }
};

var parallaxOnMouse = {
    container: undefined,
    layers: undefined,
    layer_count: undefined,
    client_width_half: window.innerWidth * 0.5,

    addMouseMoveListener: function addMouseMoveListener() {
        var throttled_function = throttle(parallaxOnMouse.moveLayers, 100);

        document.addEventListener('mousemove', throttled_function);
    },

    moveLayers: function moveLayers(event) {
        var mouse_x = event.x;

        for (var i = 0; i < parallaxOnMouse.layer_count; i++) {
            var layer = parallaxOnMouse.layers[i];
            var momentum = layer.getAttribute('data-momentum');
            var offset = (mouse_x - parallaxOnMouse.client_width_half) * momentum;

            parallaxOnMouse.layers[i].style.transform = 'translateX(' + offset + 'px)';
        }
    },

    init: function init(container, layers) {
        parallaxOnMouse.container = container;
        parallaxOnMouse.layers = layers;
        parallaxOnMouse.layer_count = layers.length;

        parallaxOnMouse.addMouseMoveListener();
    }
};

var MorphPath = function MorphPath(path, path_end, duration) {
    var end_point = path_end.node.getAttribute('d');

    path.animate({ d: end_point}, duration, mina.easein, function() {
        console.log('end');
    });
};

var Loader = (function() {

    return {
        init: initLoaderLinks,
        resize: resizeLoader,
        open: loaderOpen,
        close: loaderClose
    };

    function resizeLoader() {
        var orig_width = 500;
        var orig_height = 270;
        var ratio = orig_width / orig_height;
        var window_height = window.outerHeight * 2;
        var window_width = window.outerWidth * 2;

        if (window_width > window_height) {
            document.getElementById('preloader').setAttribute('height', window_width * ratio + 'px');
            document.getElementById('preloader').setAttribute('width', window_width + 'px');
        } else {
            document.getElementById('preloader').setAttribute('height', window_height + 'px');
            document.getElementById('preloader').setAttribute('width', (window_height * ratio) + 'px');
        }
    }

    function loaderClose(callback) {
        var duration = 400;

        for (var i = 1; i <= 6; i++) {
            MorphPath(Snap('.preloader #group #Shape' + i), Snap('.preloader #group_end #Shape' + i), duration);
        }

        Snap('.preloader #group').animate({ transform: Snap('.preloader #group_end').node.getAttribute('transform')}, duration, mina.easein, function() {
            document.getElementsByClassName('preloader')[0].classList.add('hide');
            setTimeout(function() {
                document.getElementsByClassName('preloader')[0].classList.add('full-hide');
            }, 200);
            callback && callback();
        });
    }

    function loaderOpen(callback) {
        var duration = 400;

        Snap('.preloader #group').node.innerHTML = Snap('.preloader #group_start').node.innerHTML;
        Snap('.preloader #group').animate({
            transform: Snap('.preloader #group_start').node.getAttribute('transform')
        }, 1);
        document.getElementsByClassName('preloader')[0].classList.remove('full-hide');

        setTimeout(function() {
            document.getElementsByClassName('preloader')[0].classList.remove('hide');
            for (var i = 1; i <= 6; i++) {
                MorphPath(Snap('.preloader #group #Shape' + i), Snap('.preloader #group_center #Shape' + i), duration);
            }

            Snap('.preloader #group').animate({
                transform: Snap('.preloader #group_center').node.getAttribute('transform')
            }, duration, mina.easein, function() {
                callback && callback();
            });
        }, 50);
    }

    function initLoaderLinks() {
        var elements = document.getElementsByClassName('loader_link');
        for(var i = 0, len = elements.length; i < len; i++) {
            elements[i].addEventListener('click', function (e) {
                var link = this.getAttribute('href');

                loaderOpen(function() {
                    location.href = link;
                });

                e.preventDefault();
                e.stopPropagation();
            });
        }
    }
})();