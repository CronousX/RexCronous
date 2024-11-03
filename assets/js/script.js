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
let iterationsLimit = 1;

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
    setTimeout(()=> {animateLogo()}, 300);
    preloader.addEventListener('click', () => {
      createMeteorShower(46);
      window.scrollTo(0, 0);
      preloader.style.pointerEvents = "none";
      bgmPlay();
      preloader.style.scale = "1.5";
      preloader.style.opacity = "0";
      iterationsLimit = 0;
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

// Glitch effect
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const logo = document.querySelector("#logo");
let glitchInterval;

function animateLogo() {
  clearInterval(glitchInterval);

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
    
    if (iterationsLimit == 1) iterations += 1 / 3;
    else iterations = 0;
    if (iterations < 7) {
      logo.classList.add("glitch");
    } else {
      logo.classList.remove("glitch");
    }
  }, 50);
  startGlitchInterval()
}

//Replay glitch

function startGlitchInterval() {
  glitchInterval = setInterval(() => {
    animateLogo()
  }, 8000);
}

logo.addEventListener('mouseover', ()=> {
  iterationsLimit = 0;
  animateLogo()
})
logo.addEventListener('mouseleave', ()=> {
  iterationsLimit = 1;
})