// =================
// Disable Scrolling
// =================

// left: 37, up: 38, right: 39, down: 40,
// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
var keys = {37: 1, 38: 1, 39: 1, 40: 1};
var mainWrapper = document.querySelector('.main-wrapper');

function preventDefault(e) {
  e.preventDefault();
}

function preventDefaultForScrollKeys(e) {
  if (keys[e.keyCode]) {
    preventDefault(e);
    return false;
  }
}

// modern Chrome requires { passive: false } when adding event
var supportsPassive = false;
try {
  window.addEventListener("test", null, Object.defineProperty({}, 'passive', {
    get: function () { supportsPassive = true; } 
  }));
} catch(e) {}

var wheelOpt = supportsPassive ? { passive: false } : false;
var wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

// call this to Disable
function disableScroll() {
  window.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
  window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
  window.addEventListener('touchmove', preventDefault, wheelOpt); // mobile
  window.addEventListener('keydown', preventDefaultForScrollKeys, false);
}

// call this to Enable
function enableScroll() {
  window.removeEventListener('DOMMouseScroll', preventDefault, false);
  window.removeEventListener(wheelEvent, preventDefault, wheelOpt); 
  window.removeEventListener('touchmove', preventDefault, wheelOpt);
  window.removeEventListener('keydown', preventDefaultForScrollKeys, false);
}

// Preload
var clock = document.querySelector(".clock");
var bgmPlayer = document.querySelector(".bgm-player");

document.addEventListener('DOMContentLoaded', () => {
  const preloader = document.querySelector('#preloader');
  const logo = document.querySelector(".logo");
  window.scrollTo(0, 0);
  disableScroll()
  if (preloader) {
    window.addEventListener('load', () => {
      const pace = document.querySelector(".pace");
      const callback = function(mutationsList, observer) {
        let classChangeTime = performance.now();
        for(const mutation of mutationsList) {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            if (pace.classList.contains('pace-inactive')) {
              const currentTime = performance.now();
              const timeDifference = currentTime - classChangeTime;
              if (timeDifference < 3000) {
                setTimeout(() => {
                  loaded()
                }, 2000);
              } else {
                loaded()
              }
              observer.disconnect();
            }
          }
        }
      };
      const observer = new MutationObserver(callback);
      const config = { attributes: true, attributeFilter: ['class'] };
      observer.observe(pace, config);
    });
  }
  function loaded() {
    logo.style.animationName = "PreloadEnd";
    logo.classList.add("loaded");
    logo.nextElementSibling.style.opacity = "1";
    window.scrollTo(0, 0);
    animateLogo();
    setInterval(animateLogo, 8000);
    preloader.addEventListener('click', () => {
      createMeteorShower(46);
      window.scrollTo(0, 0);
      preloader.style.pointerEvents = "none";
      // bgmPlay();
      preloader.style.scale = "1.5";
      preloader.style.opacity = "0";
      animateLogo();
      setTimeout(function() {
        preloader.style.display = "none";
        mainWrapper.style.opacity = "1";
        clock.style.opacity = "0.8";
        bgmPlayer.style.opacity = "1";
        setTimeout(() => {
          enableScroll()
        }, 2000);
      }, 1000);
    });
  }
});

//BGM Player
var bgm = document.querySelector(".music-background");
function BGMPlayer() {
  bgm.volume = 0.1;
  const progressBar = document.getElementById('bgmProgress');
  
  bgm.addEventListener('timeupdate', updateProgressBar);
  
  function updateProgressBar() {
    const percentage = (bgm.currentTime / bgm.duration) * 100;
    progressBar.style.width = percentage + '%';
  }
}
BGMPlayer()

function bgmPlay() {
  bgmPlayer.classList.toggle("bgm-play");
  if (bgmPlayer.classList.contains("bgm-play")) {
    bgm.play()
  } else {
    bgm.pause()
  }
}

function bgmSeek(event) {
  const seekPosition = (event.offsetX / event.target.clientWidth) * bgm.duration;
  bgm.currentTime = seekPosition;
}

function bgmInfo() {
  bgmPlayer.classList.toggle("info-opened")
}

// Clock
const secondHand = document.querySelector('.second-hand');
const minsHand = document.querySelector('.min-hand');
const hourHand = document.querySelector('.hour-hand');

function setDate() {
  const now = new Date();

  const seconds = now.getSeconds();
  const secondsDegrees = ((seconds / 60) * 360);
  secondHand.style.transform = `rotate(${secondsDegrees}deg)`;

  const mins = now.getMinutes();
  const minsDegrees = ((mins / 60) * 360) + ((seconds/60)*6);
  minsHand.style.transform = `rotate(${minsDegrees}deg)`;

  const hour = now.getHours();
  const hourDegrees = ((hour / 12) * 360) + ((mins/60)*30);
  hourHand.style.transform = `rotate(${hourDegrees}deg)`;
}

setInterval(setDate, 1000);

setDate();

// Random #1
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function animateLogo() {
  const logo = document.querySelector("#logo");
  let iterations = 0;
  const interval = setInterval(() => {
    logo.innerText = logo.innerText.split("")
    .map((letter, index) => {
      if (index < iterations) {
          return logo.dataset.value[index];
        }
        
        return letters[Math.floor(Math.random() * 26)];
      })
      .join("");
      
      logo.setAttribute("data-content", logo.innerText);
      
      if (iterations >= logo.dataset.value.length) clearInterval(interval);
      
      iterations += 1 / 3;
      if (iterations < 7) {
        logo.classList.add("glitch");
      } else {
        logo.classList.remove("glitch");
    }
  }, 50);
}

// Costum Scrollbar

// JavaScript to control custom scrollbar
const container = document.querySelector('body');
const content = container.querySelector('.main-wrapper');
const track = container.querySelector('.scrollbar-track');
const thumb = track.querySelector('.scrollbar-thumb');

// Update thumb height based on content and container heights
function updateThumb() {
    const contentHeight = content.scrollHeight;
    const containerHeight = container.clientHeight;
    const scrollableHeight = contentHeight - containerHeight;

    if (scrollableHeight > 0) {
        const thumbHeight = Math.max(containerHeight / contentHeight * containerHeight, 30);
        thumb.style.height = thumbHeight + 'px';
        thumb.style.display = 'block';
    } else {
        thumb.style.display = 'none';
    }
}

// Update thumb position based on scroll
function updateThumbPosition() {
    const scrollOffset = content.scrollTop;
    const contentHeight = content.scrollHeight;
    const containerHeight = container.clientHeight;
    const scrollableHeight = contentHeight - containerHeight;
    const trackHeight = track.clientHeight;

    if (scrollableHeight > 0) {
        const thumbPosition = scrollOffset / scrollableHeight * (trackHeight - thumb.clientHeight);
        thumb.style.top = thumbPosition + 'px';
    }
}

// Handle thumb dragging
function onThumbMouseDown(event) {
    event.preventDefault();
    const startY = event.clientY;
    const startTop = parseFloat(thumb.style.top) || 0;

    function onMouseMove(event) {
        const deltaY = event.clientY - startY;
        const newTop = Math.min(track.clientHeight - thumb.clientHeight, Math.max(0, startTop + deltaY));
        thumb.style.top = newTop + 'px';
        thumb.classList.add("active");
        
        // Scroll content proportionally
        const scrollFraction = newTop / (track.clientHeight - thumb.clientHeight);
        content.scrollTop = scrollFraction * (content.scrollHeight - container.clientHeight);
      }
      
      function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        thumb.classList.remove("active");
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}

// Add event listeners
content.addEventListener('scroll', updateThumbPosition);
window.addEventListener('resize', () => {
    updateThumb();
    updateThumbPosition();
});

thumb.addEventListener('mousedown', onThumbMouseDown);

// Initial setup
updateThumb();
updateThumbPosition();

function scrollSeek(event) {
  if (event.srcElement == thumb) {
  } else {
    const scrollFraction = (event.offsetY / event.target.clientHeight);
    content.scrollTop = scrollFraction * (content.scrollHeight - container.clientHeight);
  }
}