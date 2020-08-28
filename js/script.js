window.addEventListener('DOMContentLoaded', () => {

    // Tabs

    const tabs = document.querySelectorAll('.tabheader__item'),
          tabsContent = document.querySelectorAll('.tabcontent'),
          tabsParent = document.querySelector('.tabheader__items');

    function hideTabContent() {
        tabsContent.forEach(item => {
            item.classList.add('hide');
            item.classList.remove('show', 'fade');
        });

        tabs.forEach(item => {
            item.classList.remove('tabheader__item_active');
        });
    }     
    
    function showTabContent(i = 0) {
        tabsContent[i].classList.add('show', 'fade'); // fade - класс из файла стилей style.css
        tabsContent[i].classList.remove('hide');
        tabs[i].classList.add('tabheader__item_active');
    }

    hideTabContent();
    showTabContent();

    tabsParent.addEventListener('click', (event) => {
        const target = event.target;

        if (target && target.classList.contains('tabheader__item')) {
            tabs.forEach((item, i) => {
                if (target == item) {
                    hideTabContent();
                    showTabContent(i);
                }
            });
        }
    });

    // Timer

    const deadline = '2020-08-20';

    function getTimeRemaining(endtime) {
        const t = Date.parse(endtime) - Date.parse(new Date()),
              days = Math.floor(t / (1000 * 60 * 60 * 24)),
              hours = Math.floor((t / (1000 * 60 * 60) % 24)), // нужно получить остаток от деления на сутки
              minutes = Math.floor((t / 1000 / 60) % 60),
              seconds =  Math.floor((t / 1000) % 60);

        return {
            'total': t,
            'days': days,
            'hours': hours,
            'minutes': minutes,
            'seconds': seconds
        };
    }

    function getZero(num) {
        if (num >= 0 && num < 10) {
            return `0${num}`;
        } else {
            return num;
        }
    }

    function setClock(selector, endtime) {
        const timer = document.querySelector(selector),
              days = timer.querySelector('#days'),
              hours = timer.querySelector('#hours'),
              minutes = timer.querySelector('#minutes'),
              seconds = timer.querySelector('#seconds'),
              timeInterval = setInterval(updateClock, 1000);

        updateClock(); // чтобы избежать мигания верстки

        function updateClock() {
            const t = getTimeRemaining(endtime);

            days.innerHTML = getZero(t.days);
            hours.innerHTML = getZero(t.hours);
            minutes.innerHTML = getZero(t.minutes);
            seconds.innerHTML = getZero(t.seconds);

            if (t.total <= 0) {
                clearInterval(timeInterval);
            }
        }
    }

    setClock('.timer', deadline);

    // Modal

    const modalTrigger = document.querySelectorAll('[data-modal]'), // поиск по кнопкам с data-атрибутами
          modal = document.querySelector('.modal');

    function openModal() {
        modal.classList.add('show'); // встроенные классы
        modal.classList.remove('hide');
        // modal.classList.toggle('show'); // то же самое с помощью toggle
        document.body.style.overflow = 'hidden'; // чтобы страница не прокручивалась, когда открыто модальное окно
        clearInterval(modalTimerId); // если пользователь сам открыл окно, то оно не всплывает
    }

    modalTrigger.forEach(btn => { // назначить всем кнопкам
        btn.addEventListener('click', openModal);
    });

    function closeModal() {
        modal.classList.add('hide');
        modal.classList.remove('show');
        // modal.classList.toggle('show');
        document.body.style.overflow = ''; // восстановить прокрутку страницы, когда модальное окно закрыто
    }

    modal.addEventListener('click', (e) => { // чтобы окно закрывалось при клике на подложку
        if (e.target === modal || e.target.getAttribute('data-close') == '') { // потому что модальное окно на весь экран, а маленькая форма для заполнения - это modal dialog
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => { // чтобы окно закрывалось при клике на esc
        if (e.code === "Escape" && modal.classList.contains('show')) { // второе условие чтобы работал только когда окно открыто
            closeModal();
        }
    });

    const modalTimerId = setTimeout(openModal, 50000); // модальное окно появляется через 3 секунды

    function showModalByScroll() {
        if (window.pageYOffset + document.documentElement.clientHeight >= document.documentElement.scrollHeight) { // если прокрутка сверху плюс высота видимого экрана больше или равно полной высоты сайта с учетом прокрутки (равно значит что пользователь долистал страницу до конца)
            openModal();
            window.removeEventListener('scroll', showModalByScroll); // чтобы окно не всплывало каждый раз
        }
    }

    window.addEventListener('scroll', showModalByScroll);

    // Используем классы для карточек

    class MenuCard {
        constructor(src, alt, title, descr, price, parentSelector, ...classes) {
            this.src = src;
            this.alt = alt;
            this.title = title;
            this.descr = descr;
            this.price = price;
            this.classes = classes;
            this.parent = document.querySelector(parentSelector);
            this.transfer = 27;
            this.changeToUAH(); // вызов метода
        }

        changeToUAH() {
            this.price = this.price * this.transfer;
        }

        render() {
            const element = document.createElement('div');

            if (this.classes.length === 0) {
                this.element = 'menu__item';
                element.classList.add(this.element);
            } else {
                this.classes.forEach(className => element.classList.add(className));
            }

            element.innerHTML = `
                <img src=${this.src} alt=${this.alt}>
                <h3 class="menu__item-subtitle">${this.title}</h3>
                <div class="menu__item-descr">${this.descr}</div>
                <div class="menu__item-divider"></div>
                <div class="menu__item-price">
                    <div class="menu__item-cost">Цена:</div>
                    <div class="menu__item-total"><span>${this.price}</span> грн/день</div>
                </div>
            `;
            this.parent.append(element);
        }
    }

    // используем asyns / await

    const getResource = async (url) => { // получаем данные для карточек с сервера
        const res = await fetch(url);

        if (!res.ok) {
            throw new Error(`Could not fetch ${url}, status: ${res.status}`);
        }

        return await res.json(); // возвращаем promise в формате json
    };


    // getResource('http://localhost:3000/menu')
    //     .then(data => {
    //         data.forEach(({img, altimg, title, descr, price}) => { // деструктуризация объекта из файла db.json
    //             new MenuCard(img, altimg, title, descr, price, '.menu .container').render(); // .menu .container - это родитель
    //         });
    //     });

    // создание карточек с использованием axios
    
    axios.get('http://localhost:3000/menu')
        .then(data => {
            data.data.forEach(({img, altimg, title, descr, price}) => { 
                new MenuCard(img, altimg, title, descr, price, '.menu .container').render(); 
            });
        });

    // динамическое создание верстки
    // getResource('http://localhost:3000/menu')
    //     .then(data => createCard(data));

    // function createCard(data) {
    //     data.forEach(({img, altimg, title, descr, price}) => {
    //         const element = document.createElement('div');

    //         element.classList.add('menu__item');

    //         element.innerHTML = `
    //             <img src=${img} alt=${altimg}>
    //             <h3 class="menu__item-subtitle">${title}</h3>
    //             <div class="menu__item-descr">${descr}</div>
    //             <div class="menu__item-divider"></div>
    //             <div class="menu__item-price">
    //                 <div class="menu__item-cost">Цена:</div>
    //                 <div class="menu__item-total"><span>${price}</span> грн/день</div>
    //             </div>
    //         `;

    //         document.querySelector('.menu .container').append(element);
    //     });
    // }

    // Forms

    const forms = document.querySelectorAll('form');

    const message = {
        loading: 'img/form/spinner.svg',
        success: 'Спасибо! Скоро мы с Вами свяжемся',
        failure: 'Что-то пошло не так...'
    }; // хранилище текстовых сообщений на разные случаи

    forms.forEach(item => { // добавляем каждой форме функцию отправки данных
        bindPostostData(item);
    });

    const postData = async (url, data) => { // выносим постинг данных на сервер с помощью fetch в отдельную функцию
        const res = await fetch(url, {
            method: "POST",
            headers: {
                'Content-type': 'application/json'
            },
            body: data
        });

        return await res.json(); // возвращаем promise в формате json
    };

    function bindPostostData(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const statusMessage = document.createElement('img');
            statusMessage.src = message.loading;
            statusMessage.style.cssText = `
                display: block;
                margin: 0 auto;
            `;
            form.insertAdjacentElement('afterend', statusMessage); // добавить спиннер после формы

            // const request = new XMLHttpRequest();
            // request.open('POST', 'server.php');

            // request.setRequestHeader('Content-type', 'application/json');
            const formData = new FormData(form);

            const json = JSON.stringify(Object.fromEntries(formData.entries()));

            // const json = JSON.stringify(object);

            // request.send(json);
  
            postData('http://localhost:3000/requests', json) // информация из формы добавляется в файл db.json в массив requests
            .then(data => {
                console.log(data);
                showThanksModal(message.success);
                statusMessage.remove();
            }).catch(() => {
                showThanksModal(message.failure);
            }).finally(() => {
                form.reset(); // выполняется всегда при любом исходе
            });

            // request.addEventListener('load', () => {
            //     if (request.status === 200) {
            //         console.log(request.response);
            //         showThanksModal(message.success);
            //         form.reset();
            //         statusMessage.remove();
            //     } else {
            //         showThanksModal(message.failure);
            //     }
            // });
        });
    }

    function showThanksModal(message) {
        const prevModalDialog = document.querySelector('.modal__dialog');

        prevModalDialog.classList.add('hide'); // скрываем модальное окно от пользователя
        openModal();

        const thanksModal = document.createElement('div'); // создаем окно благодарности
        thanksModal.classList.add('modal__dialog');
        thanksModal.innerHTML = `
            <div class="modal__content">
                <div class="modal__close" data-close>×</div>
                <div class="modal__title">${message}</div>
            </div>
        `;

        document.querySelector('.modal').append(thanksModal);
        setTimeout(() => {
            thanksModal.remove();
            prevModalDialog.classList.add('show'); 
            prevModalDialog.classList.remove('hide'); 
            closeModal(); // закрываем окно благодарности и возвращаем форму, но не показываем пользователю
        }, 4000);
    }

    // fetch('https://jsonplaceholder.typicode.com/posts', { // POST запрос
    //     method: "POST",
    //     body: JSON.stringify({name: 'Alex'}),
    //     headers: {
    //         'Content-type': 'application/json'
    //     }
    // })
    // .then(response => response.json())
    // .then(json => console.log(json));

    // fetch('http://localhost:3000/menu')
    //     .then(data => data.json())
    //     .then(res => console.log(res));

    // Slider

    const slides = document.querySelectorAll('.offer__slide'),
          prev = document.querySelector('.offer__slider-prev'),
          next = document.querySelector('.offer__slider-next'),
          total = document.querySelector('#total'), // общее количество слайдов
          current = document.querySelector('#current'), // текущий слайд
          slidesWrapper = document.querySelector('.offer__slider-wrapper'), // вся обертка
          slidesField = document.querySelector('.offer__slider-inner'), // окошко, через которое мы видим слайды
          width = window.getComputedStyle(slidesWrapper).width;

    let slideIndex = 1;
    let offset = 0; // отступ

    if (slides.length < 10) { // счетчик слайдов
        total.textContent = `0${slides.length}`;
        current.textContent = `0${slideIndex}`;
    } else {
        total.textContent = slides.length;
        current.textContent = slideIndex;
    }

    slidesField.style.width = 100 * slides.length + '%'; // сделать слайды одинаковыми по ширине
    slidesField.style.display = 'flex'; // чтобы слайды встали в одну линию
    slidesField.style.transition = '0.5s all';

    slidesWrapper.style.overflow = 'hidden';

    slides.forEach(slide => {
        slide.style.width = width;
    });

    next.addEventListener('click', () => {
        if (offset == +width.slice(0, width.length - 2) * (slides.length - 1)) { // если мы долистали до конца и нам необходимо вернуться в начало
            offset = 0; // width = 500px, пожтому два последних символа (px) вырезаем slice
        } else { // если мы не дошли до конца, то добавляем отступ
            offset += +width.slice(0, width.length - 2); // когда мы нажимаем стрелку вперед, к оффсету добавляется ширина еще одного слайда
        }

        slidesField.style.transform = `translateX(-${offset}px)`;

        if (slideIndex == slides.length) {
            slideIndex = 1; // если дошли до конца, то переходим на первый слайд
        } else {
            slideIndex++;
        }

        if (slides.length < 10) {
            current.textContent = `0${slideIndex}`;
        } else {
            current.textContent = slideIndex;
        }
    });

    prev.addEventListener('click', () => {
        if (offset == 0) { // когда мы на первом слайде нажимаем кнопку назад
            offset = +width.slice(0, width.length - 2) * (slides.length - 1); // мы перемещаемся в конец
        } else { 
            offset -= +width.slice(0, width.length - 2); 
        }

        slidesField.style.transform = `translateX(-${offset}px)`;

        if (slideIndex == 1) {
            slideIndex = slides.length; 
        } else {
            slideIndex--;
        }

        if (slides.length < 10) {
            current.textContent = `0${slideIndex}`;
        } else {
            current.textContent = slideIndex;
        }
    });

    // showSlides(slideIndex);

    // if (slides.length < 10) {
    //     total.textContent = `0${slides.length}`;
    // } else {
    //     total.textContent = slides.length;
    // }

    // function showSlides(n) {
    //     if (n > slides.length) { // если мы дошли до правой границы слайдера
    //         slideIndex = 1;      // то возвращаемся на первый слайд
    //     }

    //     if (n < 1) {                    // если уходим в левую сторону от первого слайда
    //         slideIndex = slides.length; // то перемещаемся в конец
    //     }

    //     slides.forEach(item => item.style.display = 'none'); // скрываем все слайды

    //     slides[slideIndex - 1].style.display = 'block';

    //     if (slides.length < 10) { // узнать и добавить в поле текущий слайд
    //         current.textContent = `0${slideIndex}`;
    //     } else {
    //         current.textContent = slideIndex;
    //     }
    // }

    // function plusSlides(n) {
    //     showSlides(slideIndex += n);
    // }

    // prev.addEventListener('click', () => {
    //     plusSlides(-1);
    // });

    // next.addEventListener('click', () => {
    //     plusSlides(1);
    // });
});