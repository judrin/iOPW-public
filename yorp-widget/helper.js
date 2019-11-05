(function() {
    // Util class
    var Util = {};

    Util.isString = function (str) {
        return typeof str === 'string';
    };

    Util.isHTMLElement = function (el) {
        return el instanceof HTMLElement || el instanceof Element;
    };

    Util.isFunction = function (fuc) {
        return fuc && {}.toString.call(fuc) === '[object Function]';
    };

    Util.params = function (obj) {
        var str = "";
        for (var key in obj) {
            if (str != "") {
                str += "&";
            }
            str += key + "=" + encodeURIComponent(obj[key]);
        }

        console.log(str);

        return str;
    };

    // DOM controller
    var DOMController = function (selector) {
        if (Util.isString(selector)) {
            this._el = Array.prototype.slice.call(document.querySelectorAll(selector));
        }
        else if (Util.isHTMLElement(selector)) {
            this._el = [selector];
        }
        else {
            this._el = [];
        }

        return this;
    };

    DOMController.prototype.each = function (callback) {
        for (var i = 0; i < this._el.length; i++) {
            callback.call(this._el[i], i);
        }
    };

    DOMController.prototype.get = function (index) {
        return typeof index === 'number' && index < this._el.length ? this._el[index] : null;
    };

    DOMController.prototype.data = function (name, value) {
        if (typeof name === undefined) {
            return this;
        }

        if (typeof value !== undefined && value) {
            this.each(function () {
                this.setAttribute('data-' + name, value);
            });
        }
        else if (this._el.length) {
            var val = this._el[0].getAttribute('data-' + name);

            if (val) {
                if (val.toLowerCase() === "true") {
                    val = true;
                }
                else if (val.toLowerCase() === "false") {
                    val = false;
                }
                else if (!isNaN(val)) {
                    val = parseFloat(val);
                }
            }

            return val;
        }

        return this;
    };

    DOMController.prototype.size = function () {
        return this._el.length;
    }

    DOMController.prototype.append = function (child) {
        if (Util.isString(child)) {
            this.each(function () {
                this.insertAdjacentHTML('beforeend', child.trim());
            });
        }
        else {
            var childElement = child instanceof this.constructor ? child.get(0) : child;

            if (Util.isHTMLElement(childElement)) {
                this.each(function () {
                    this.appendChild(childElement);
                });
            }
        }

        return this;
    };

    DOMController.prototype.prepend = function (child) {
        if (Util.isString(child)) {
            this.each(function () {
                this.insertAdjacentHTML('afterbegin', child.trim());
            });
        }
        else {
            var childElement = child instanceof this.constructor ? child.get(0) : child;

            if (Util.isHTMLElement(childElement)) {
                this.each(function () {
                    this.firstChild ? this.insertBefore(childElement, this.firstChild) : this.appendChild(childElement);
                });
            }
        }

        return this;
    };

    DOMController.prototype.before = function (content) {
        if (Util.isString(content)) {
            this.each(function () {
                this.insertAdjacentHTML('beforebegin', content.trim());
            });
        }
        else {
            var el = content instanceof this.constructor ? content.get(0) : content;

            if (Util.isHTMLElement(el)) {
                this.each(function () {
                    this.parentNode.insertBefore(el, this);
                });
            }
        }

        return this;
    }

    DOMController.prototype.after = function (content) {
        if (Util.isString(content)) {
            this.each(function () {
                this.insertAdjacentHTML('afterend', content.trim());
            });
        }
        else {
            var el = content instanceof this.constructor ? content.get(0) : content;

            if (Util.isHTMLElement(el)) {
                this.each(function () {
                    this.parentNode.insertBefore(el, this.nextSibling);
                });
            }
        }

        return this;
    }

    DOMController.prototype.attr = function (name, value) {
        if (arguments.length == 2 || typeof value !== 'undefined') {
            this.each(function () {
                this.setAttribute(name, value);
            });

            return this;
        }

        return this._el.length > 0 ? this._el[0].getAttribute(name) : null;
    }

    DOMController.prototype.style = function (name, value) {
        if (arguments.length == 2 || typeof value !== 'undefined') {
            this.each(function () {
                this.style[name] = value;
            });
        }
        else if (typeof name === 'object') {
            this.each(function () {
                for (var key in name) {
                    this.style[key] = name[key];
                }
            });
        }
        
        return this;
    }

    DOMController.prototype.remove = function () {
        this.each(function () {
            this.parentElement.removeChild(this);
        });

        this._el = [];
    }

    DOMController.prototype.on = function (event, selector, handler) {
        this.each(function () {
            this.addEventListener(event, function (e) {
                var t = e.target;

                while (t && t !== this) {
                    if (t.matches(selector)) {
                        handler.call(t, e);
                        return this;
                    }

                    t = t.parentNode;
                }
            });
        });

        return this;
    };

    DOMController.prototype.click = function (handler) {
        this.each(function () {
            this.addEventListener("click", function (e) {
                handler.call(e.target, e);
                return this;
            });
        });

        return this;
    }

    DOMController.prototype.find = function (selector) {
        var result = [], child = new DOMController();
        if (Util.isString(selector) && this._el.length > 0) {
            this.each(function () {
                result = result.concat(Array.prototype.slice.call(this.querySelectorAll(selector)));
            });
        }

        child._el = result;

        return child;
    };

    DOMController.prototype.hide = function () {
        this.each(function () {
            this.style.display = 'none';
        });

        return this;
    };

    DOMController.prototype.show = function () {
        this.each(function () {
            this.style.display = 'block';
        });

        return this;
    };

    DOMController.prototype.text = function (text) {
        if (Util.isString(text) || !isNaN(text)) {
            this.each(function () {
                this.textContent = text;
            });

            return this;
        }

        return this._el.length ? this._el[0].textContent : "";
    };

    DOMController.prototype.empty = function () {
        this.each(function () {
            while (this.firstChild) {
                this.removeChild(this.firstChild)
            }
        });

        return this;
    };

    DOMController.prototype.closest = function (selector) {
        return this._el.length ? new DOMController(this._el[0].closest(selector)) : [];
    };

    DOMController.prototype.lightbox = function (settings) {
        var lightbox = new yorpLightbox(this, settings);
        this.click(function (e) {
            e.preventDefault();
        });

        return this;
    }

    var el = function (selector) {
        return new DOMController(selector);
    };

    el.createElement = function (tag, attr) {
        var el = document.createElement(tag);

        if (typeof attr === 'object') {
            for (key in attr) {
                if (key === 'class') {
                    el.className = (el.className + ' ' + attr[key]).trim();
                }
                else if (key in el) {
                    el[key] = attr[key];
                }
            }
        }

        return new DOMController(el);
    };

    // YORP lightbox

    var yorpLightbox = function (target, settings) {
        this._object;
        this._body = el('body');
        this._settings = {
            maxWidth: 1200,
            maxHeight: 1200,
        }

        this._target = target instanceof DOMController.constructor ? target : el(target);

        if (typeof settings === 'object') {
            if ('maxWidth' in settings && !isNaN(setting.maxWidth)) {
                this._settings.maxWidth = settings.maxWidth;
            }

            if ('maxHeight' in settings && !isNaN(setting.maxHeight)) {
                this._settings.maxHeight = settings.maxHeight;
            }

            if ('video' in settings && typeof settings.video === 'object') {
                this._settings.video = settings.video;
            }
        }
    };

    yorpLightbox._typeMapping = {
        image: 'jpg,jpeg,gif,png,bmp',
        video: 'mp4,mov,ogv,ogg,webm',
        iframe: 'html,php',
        inline: '#'
    };

    yorpLightbox.overlay = el.createElement('div', { id: 'lightbox-overlay' });

    yorpLightbox.loadingTag = el.createElement('img', {
        src: '//fileserver.rwardz.com/verview/default/spinner.gif',
        class: 'lightbox-loading'
    });

    yorpLightbox.container = el.createElement('div', { class: 'lightbox-container' })
        .append(el.createElement('div', { class: 'lightbox-content' })
                .append(el.createElement('div', { class: 'lightbox-content-inner' }))
    );

    yorpLightbox._checkType = function(url) {
        for (var key in yorpLightbox._typeMapping) {
            if (yorpLightbox._typeMapping.hasOwnProperty(key)) {
                var suffixArr = yorpLightbox._typeMapping[key].split(',');

                for (var i = 0; i < suffixArr.length; i++) {
                    var suffix = suffixArr[i].toLowerCase(),
                        regexp = new RegExp('\.(' + suffix + ')$', 'i'),
                        str = url.toLowerCase().split('?')[0].substr(-5);


                    if (regexp.test(str) === true || (key === 'inline' && (url.indexOf(suffix) > -1))) {
                        return key;
                    }
                }
            }
        }

        return 'iframe';
    };

    yorpLightbox._calculateAspectRatioFit = function(srcWidth, srcHeight, maxWidth, maxHeight) {
        var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);

        return ratio >= 1 ? { width: srcWidth, height: srcHeight} : { width: srcWidth * ratio, height: srcHeight * ratio };
    };

    yorpLightbox.prototype._imageResize = function() {
        var object = this._object, originWidth = 0, origiHeight = 0, ratio = 0;

        object.get(0).onload = function () {
            var image = this;
            originWidth = image.width;
            origiHeight = image.height;
            ratio = originWidth / origiHeight;

            var resize = function() {
                var currDocWidth = document.documentElement.clientWidth || document.body.clientWidth,
                    currDocHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
                    containerElement = yorpLightbox.container.get(0),
                    containerInnerElement = yorpLightbox.container.find(".lightbox-content-inner").get(0);

                if (isNaN(currDocWidth) || isNaN(currDocHeight)) {
                    if (ratio >= 1) {
                        image.style.maxWidth = "75%";
                    }
                    else {
                        image.style.maxHeight = "75%";
                    }
                }
                else {                    
                    var newSize = yorpLightbox._calculateAspectRatioFit(originWidth, origiHeight, currDocWidth * 0.75, currDocHeight * 0.75);
                    image.width = newSize.width;
                    image.height = newSize.height;
                }

                containerElement.style.width = image.width + "px";
                containerElement.style.height = image.height + "px";
                containerElement.style.marginTop = -(image.width / 2) + "px";
                containerElement.style.marginBottom = -(image.height / 2) + "px";

                if (containerInnerElement) {
                    containerInnerElement.style.width = image.width + "px";
                    containerInnerElement.style.height = image.height + "px";
                }
            }

            resize();

            window.onresize = function(e) {
                resize();
            };
        };
    };

    yorpLightbox.prototype.start = function (url) {
        if (yorpLightbox.overlay.get(0).parentNode === null) {
            this._body.append(yorpLightbox.overlay);
        }

        if (yorpLightbox.loadingTag.get(0).parentNode === null) {
            this._body.append(yorpLightbox.loadingTag);
        }

        if (yorpLightbox.container.get(0).parentNode === null) {
            this._body.append(yorpLightbox.container);
        }

        if (typeof url === 'undefined' || !url) {
            yorpLightbox.overlay.hide();
            yorpLightbox.loadingTag.hide();
            yorpLightbox.container.hide();

            return false;
        }

        switch (yorpLightbox._checkType(url)) {
            case 'image':
                this._object = el(new Image());
                this._object.attr("src", url);
                this._imageResize();
                break;
            case 'video':
                this._object = el.createElement("video", { src: url });
                break;
            default:
                this._object = el.createElement("iframe", { src: url });
                break;
        }

        yorpLightbox.container.append(this._object);
        yorpLightbox.overlay.show();
        yorpLightbox.loadingTag.hide();
        yorpLightbox.container.show();
    };
})();
