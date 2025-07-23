"use strict";

$(document).ready(function () {

    //
    // Constants & Global Variables
    //
    const WEATHER_CACHE_KEY = 'userWeatherCache';
    const WEATHER_CACHE_DURATION = 30 * 60 * 1000;
    const THEME_STORAGE_KEY = 'sitePreferredTheme';

    const $body = $('body');
    const $themeToggleButton = $('#theme-toggle-button');
    const $pageSections = $('.page-section');
    const $slides = $('.slideshow-container .slide');
    const $prevSlideButton = $('.slideshow-container .prev-slide');
    const $nextSlideButton = $('.slideshow-container .next-slide');
    const $accordionElement = $("#accordion");
    const $yearSpan = $('#current-year');
    const $weatherStatusMessage = $('.weather-info-container .weather-status');
    const $weatherCity = $('#weather-city');
    const $weatherTemp = $('#weather-temp');
    const $weatherConditions = $('#weather-conditions');
    const $weatherHumidity = $('#weather-humidity');
    const $menuToggleButton = $('#menu-toggle');
    const $menuToggleIcon = $('#menu-toggle-icon');
    const $mainNavList = $('#main-nav-list');

    let $currentVisibleSection = null;
    let isTransitioning = false;

    //
    // Accordion & Animations
    //
    function initializeAccordionIfNeeded() {
        if ($('#widget-section').is(':visible') && $accordionElement.length && !$accordionElement.hasClass('ui-accordion')) {
            $accordionElement.accordion({
                heightStyle: "content",
                collapsible: true,
                active: false,
                animate: 200
            });
        }
    }

    function animateAboutListItems() {
        const $listItems = $('#about-features-list li');
        if ($listItems.length && !$listItems.first().hasClass('is-visible')) {
            $listItems.each(function (index) {
                const $item = $(this);
                setTimeout(function () {
                    $item.addClass('is-visible');
                }, 150 * index);
            });
        }
    }

    //
    // Section Navigation & Display
    //
    function handleSectionDisplayCompletion(targetSectionId) {
        initializeAccordionIfNeeded();
        if (targetSectionId === '#weather-section') {
            loadWeather();
        }
        if (targetSectionId === '#about-section') {
            animateAboutListItems();
        }
    }

    function showSectionWithAnimation(targetSectionId, onComplete) {
        const $targetSection = $(targetSectionId);
        const outClass = 'wand-waving-out';
        const inClass = 'wand-waving-in';

        if (!$targetSection.length) {
            if (onComplete) onComplete();
            isTransitioning = false;
            return;
        }

        if (isTransitioning) {
            return;
        }
        if ($targetSection.is($currentVisibleSection) && !$targetSection.is('.' + inClass + ', .' + outClass)) {
            if (onComplete) onComplete();
            return;
        }

        isTransitioning = true;

        function animateIn() {
            $pageSections.not($targetSection).addClass('hidden');
            $targetSection.removeClass('hidden').addClass(inClass);

            $targetSection.one('animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd', function () {
                $(this).removeClass(inClass);
                $currentVisibleSection = $targetSection;
                isTransitioning = false;
                if (onComplete) {
                    onComplete();
                }
            });
        }

        if ($currentVisibleSection && $currentVisibleSection.length && !$currentVisibleSection.hasClass('hidden')) {
            const $sectionAnimatingOut = $currentVisibleSection;
            $sectionAnimatingOut.addClass(outClass);
            $sectionAnimatingOut.one('animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd', function () {
                $(this).removeClass(outClass).addClass('hidden');
                animateIn();
            });
        } else {
            animateIn();
        }
    }

    //
    // Theme Management
    //
    function applyTheme(theme) {
        const sunIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="theme-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/></svg>';
        const moonIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="theme-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278zM4.858 1.311A7.269 7.269 0 0 0 1.025 7.71c0 4.02 3.279 7.276 7.319 7.276a7.316 7.316 0 0 0 5.205-2.162c-.337.042-.68.063-1.029.063-4.61 0-8.343-3.714-8.343-8.29 0-1.167.242-2.278.681-3.286z"/></svg>';

        if (theme === 'dark') {
            $body.addClass('dark-mode');
            $themeToggleButton.html(sunIcon + ' Light Mode').attr('aria-pressed', 'true');
        } else {
            $body.removeClass('dark-mode');
            $themeToggleButton.html(moonIcon + ' Dark Mode').attr('aria-pressed', 'false');
        }
    }

    function saveThemePreference(theme) {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    }

    //
    // Initial Page Load
    //
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'light';
    applyTheme(savedTheme);

    if ($themeToggleButton.length) {
        $themeToggleButton.on('click', function () {
            if (isTransitioning) return;
            let newTheme = $body.hasClass('dark-mode') ? 'light' : 'dark';
            applyTheme(newTheme);
            saveThemePreference(newTheme);
        });
    }

    //
    // Mobile Menu
    //
    if ($menuToggleButton.length && $mainNavList.length) {
        $menuToggleButton.on('click', function () {
            const isExpanded = $(this).attr('aria-expanded') === 'true';

            $(this).attr('aria-expanded', !isExpanded);
            $mainNavList.toggleClass('nav-ul--open');

            if (!isExpanded) {
                $menuToggleIcon.text('close');
            } else {
                $menuToggleIcon.text('menu');
            }

            if ($mainNavList.hasClass('nav-ul--open') && $(window).width() <= 768) {
                $body.css('overflow', 'hidden');
            } else {
                $body.css('overflow', '');
            }
        });

        $mainNavList.find('a').on('click', function () {
            if ($mainNavList.hasClass('nav-ul--open')) {
                $menuToggleButton.attr('aria-expanded', 'false');
                $mainNavList.removeClass('nav-ul--open');
                $menuToggleIcon.text('menu');
                if ($(window).width() <= 768) {
                    $body.css('overflow', '');
                }
            }
        });

        $(document).on('click', function (event) {
            if ($(window).width() <= 768 && $mainNavList.hasClass('nav-ul--open') &&
                !$menuToggleButton.is(event.target) && $menuToggleButton.has(event.target).length === 0 &&
                !$mainNavList.is(event.target) && $mainNavList.has(event.target).length === 0) {

                $menuToggleButton.attr('aria-expanded', 'false');
                $mainNavList.removeClass('nav-ul--open');
                $menuToggleIcon.text('menu');
                $body.css('overflow', '');
            }
        });

    }

    //
    // Slideshow
    //
    let currentSlideIndex = 0;
    function showSlide(index) {
        if (!$slides.length) return;
        $slides.addClass('hidden');
        $($slides.get(index)).removeClass('hidden').hide().fadeIn(500);
        currentSlideIndex = index;
    }

    if ($slides.length > 0) {
        let initialVisibleSlideFound = false;
        $slides.each(function (i) {
            if (!$(this).hasClass('hidden')) {
                currentSlideIndex = i;
                initialVisibleSlideFound = true;
                return false;
            }
        });
        if (!initialVisibleSlideFound) {
            currentSlideIndex = 0;
        }
        showSlide(currentSlideIndex);

        if ($prevSlideButton.length && $nextSlideButton.length) {
            $nextSlideButton.on('click', function () {
                if (isTransitioning) return;
                let newIndex = (currentSlideIndex + 1) % $slides.length;
                showSlide(newIndex);
            });
            $prevSlideButton.on('click', function () {
                if (isTransitioning) return;
                let newIndex = (currentSlideIndex - 1 + $slides.length) % $slides.length;
                showSlide(newIndex);
            });
        }
    }

    //
    // Navigation Link Handling
    //
    let initialSectionToShow = window.location.hash ? window.location.hash : null;
    if (!initialSectionToShow || !$(initialSectionToShow).length || !$(initialSectionToShow).hasClass('page-section')) {
        const firstNavHref = $mainNavList.find('a').first().attr('href');
        if (firstNavHref && $(firstNavHref).length) {
            initialSectionToShow = firstNavHref;
        } else {
            initialSectionToShow = '#weather-section';
        }
    }

    $pageSections.addClass('hidden');

    $mainNavList.find('a').removeClass('active').removeAttr('aria-current');
    $mainNavList.find('a[href="' + initialSectionToShow + '"]').addClass('active').attr('aria-current', 'page');

    showSectionWithAnimation(initialSectionToShow, function () {
        handleSectionDisplayCompletion(initialSectionToShow);
    });

    $mainNavList.find('a').on('click', function (event) {
        const $clickedLink = $(this);
        const targetSectionId = $clickedLink.attr('href');

        if (targetSectionId && targetSectionId.startsWith('#') && $(targetSectionId).length && $(targetSectionId).hasClass('page-section')) {
            event.preventDefault();

            if (isTransitioning) {
                return;
            }

            if ($currentVisibleSection && $currentVisibleSection.attr('id') === targetSectionId.substring(1)) {
                return;
            }

            $mainNavList.find('a').removeClass('active').removeAttr('aria-current');
            $clickedLink.addClass('active').attr('aria-current', 'page');

            showSectionWithAnimation(targetSectionId, function () {
                handleSectionDisplayCompletion(targetSectionId);
            });
        }
    });

    $('#about-features-list').on('click', '.about-feature-link', function (event) {
        const $clickedLink = $(this);
        const targetSectionId = $clickedLink.attr('href');

        if (targetSectionId && targetSectionId.startsWith('#') && $(targetSectionId).length && $(targetSectionId).hasClass('page-section')) {
            event.preventDefault();

            if (isTransitioning) {
                return;
            }

            if ($currentVisibleSection && $currentVisibleSection.attr('id') === targetSectionId.substring(1)) {
                return;
            }

            $mainNavList.find('a').removeClass('active').removeAttr('aria-current');
            $mainNavList.find('a[href="' + targetSectionId + '"]').addClass('active').attr('aria-current', 'page');

            if ($mainNavList.hasClass('nav-ul--open') && $(window).width() <= 768) {
                $menuToggleButton.trigger('click');
            }

            showSectionWithAnimation(targetSectionId, function () {
                handleSectionDisplayCompletion(targetSectionId);
            });
        }
    });

    //
    // Footer
    //
    if ($yearSpan.length) {
        $yearSpan.text(new Date().getFullYear());
    }

    //
    // Weather API Logic
    //
    function updateWeatherStatus(message, type = 'info') {
        $weatherStatusMessage.removeClass('warning error');
        if (type === 'loading') {
            $weatherStatusMessage.html('<span class="spinner"></span> ' + message);
        } else {
            $weatherStatusMessage.text(message);
            if (type === 'warning') $weatherStatusMessage.addClass('warning');
            if (type === 'error') $weatherStatusMessage.addClass('error');
        }
        if (type === 'error' || (type === 'warning' && type !== 'loading')) {
            $weatherCity.text(''); $weatherTemp.text('');
            $weatherConditions.empty(); $weatherHumidity.text('');
        }
    }

    function displayWeatherData(data, isCached = false) {
        updateWeatherStatus(`Current weather in${isCached && data.timestamp ? ` (cached at ${new Date(data.timestamp).toLocaleTimeString()})` : ''}:`);
        let cityName = data.name;
        let country = data.sys ? data.sys.country : (data.country || '');
        let temp = data.main ? Math.round(data.main.temp) : (data.temp !== undefined ? Math.round(data.temp) : 'N/A');
        let conditionMain = (data.weather && data.weather[0] ? data.weather[0].main : (data.conditions_main || 'N/A')).toLowerCase();
        let conditionsDesc = (data.weather && data.weather[0] ? data.weather[0].description : (data.conditions_desc || 'N/A'));
        let apiIconCode = (data.weather && data.weather[0] ? data.weather[0].icon : null) || data.icon;
        let humidity = data.main ? data.main.humidity : (data.humidity !== undefined ? data.humidity : 'N/A');
        $weatherCity.text(cityName + (country ? `, ${country}` : ''));
        $weatherTemp.text(`Temperature: ${temp}°F`);

        const iconBasePath = 'media/weather_icons/';
        let selectedIconFilename = 'Cloudy.svg'; // Default icon
        const iconFileMap = {
            'clear_day': 'Clear_Day.svg',
            'clear_night': 'Clear_Night.svg',
            'clouds': 'Cloudy.svg',
            'rain': 'Rain.svg',
            'drizzle': 'Rain.svg',
            'snow': 'Snowing.svg',
            'thunderstorm': 'Thunder.svg',
            'fog': 'Fog.svg',
            'mist': 'Fog.svg',
            'smoke': 'Dust_Storm.svg',
            'haze': 'Dust_Storm.svg',
            'dust': 'Dust_Storm.svg',
            'sand': 'Dust_Storm.svg',
            'ash': 'Volcanic_Ash.svg',
            'squall': 'Storming.svg',
            'tornado': 'Tornado.svg',
            'atmosphere': 'Cloudy.svg'
        };

        if (conditionMain === 'clear') {
            selectedIconFilename = (apiIconCode && apiIconCode.includes('n')) ? iconFileMap.clear_night : iconFileMap.clear_day;
        } else if (iconFileMap[conditionMain]) {
            selectedIconFilename = iconFileMap[conditionMain];
        } else {
            selectedIconFilename = iconFileMap.atmosphere; // Fallback
        }

        $weatherConditions.empty();
        $('<img>', { src: iconBasePath + selectedIconFilename, alt: conditionsDesc, class: 'weather-condition-icon' }).appendTo($weatherConditions);
        const displayConditionText = conditionsDesc.charAt(0).toUpperCase() + conditionsDesc.slice(1);
        $weatherConditions.append(` ${displayConditionText}`);
        $weatherHumidity.text(`Humidity: ${humidity}%`);
    }

    function makeWeatherApiCall(apiUrl) {
        $.ajax({
            url: apiUrl,
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                if (data && data.name && data.main && data.weather && data.weather[0]) {
                    displayWeatherData(data, false);
                    const weatherToCache = { name: data.name, country: data.sys ? data.sys.country : '', temp: Math.round(data.main.temp), conditions_main: data.weather[0].main, conditions_desc: data.weather[0].description, humidity: data.main.humidity, icon: data.weather[0].icon, timestamp: new Date().getTime() };
                    localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(weatherToCache));
                } else {
                    let errorMessage = 'Error: Unexpected data format from API.';
                    if (data.error) { errorMessage = `Error: ${data.error}`; }
                    else if (data.message) { errorMessage = `Error: ${data.message}`; }
                    updateWeatherStatus(errorMessage, 'error');
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                let errorMessage = 'Error fetching weather data.';
                if (jqXHR.responseJSON) {
                    if (jqXHR.responseJSON.error) { errorMessage = `Error: ${jqXHR.responseJSON.error}`; }
                    else if (jqXHR.responseJSON.message) { errorMessage = `Error (${jqXHR.status}): ${jqXHR.responseJSON.message}`; }
                    else { errorMessage = `Error (${jqXHR.status}): ${textStatus || errorThrown}`; }
                } else if (jqXHR.status) {
                    errorMessage = `Error (${jqXHR.status}): ${textStatus || errorThrown}`;
                }
                updateWeatherStatus(errorMessage, 'error');
            }
        });
    }

    function fetchWeatherDataByCoords(latitude, longitude) {
        const proxyApiUrl = `https://fidzotxqwlhzgztnskbu.supabase.co/functions/v1/weather-proxy?lat=${latitude}&lon=${longitude}`;
        updateWeatherStatus('Fetching weather for your location...', 'loading');
        makeWeatherApiCall(proxyApiUrl);
    }

    function fetchWeatherDataByCity(city = 'Phoenix', stateCode = 'AZ', countryCode = 'US') {
        let queryParams = `city=${encodeURIComponent(city)}`;
        if (stateCode) queryParams += `&stateCode=${encodeURIComponent(stateCode)}`;
        if (countryCode) queryParams += `&countryCode=${encodeURIComponent(countryCode)}`;
        const proxyApiUrl = `https://fidzotxqwlhzgztnskbu.supabase.co/functions/v1/weather-proxy?${queryParams}`;
        updateWeatherStatus('Fetching weather for ' + city + '...', 'loading');
        makeWeatherApiCall(proxyApiUrl);
    }

    function getWeatherViaGeolocation() {
        updateWeatherStatus('Attempting to get your location...', 'loading');
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function (position) { fetchWeatherDataByCoords(position.coords.latitude, position.coords.longitude); },
                function (error) {
                    let message = "Could not get your location. ";
                    switch (error.code) {
                        case error.PERMISSION_DENIED: message += "Permission denied."; break;
                        case error.POSITION_UNAVAILABLE: message += "Location unavailable."; break;
                        case error.TIMEOUT: message += "Request timed out."; break;
                        default: message += "Unknown error."; break;
                    }
                    updateWeatherStatus(message + " Showing weather for Phoenix, AZ instead.", 'warning');
                    fetchWeatherDataByCity();
                }
            );
        } else {
            updateWeatherStatus("Geolocation not supported. Showing weather for Phoenix, AZ instead.", 'warning');
            fetchWeatherDataByCity();
        }
    }

    function loadWeather() {
        const cachedWeather = localStorage.getItem(WEATHER_CACHE_KEY);
        if (cachedWeather) {
            const weatherData = JSON.parse(cachedWeather);
            if (new Date().getTime() - weatherData.timestamp < WEATHER_CACHE_DURATION) {
                displayWeatherData(weatherData, true);
                return;
            }
        }
        getWeatherViaGeolocation();
    }

});