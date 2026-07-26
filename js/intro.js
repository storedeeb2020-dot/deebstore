// ================================================
// 🎬 Cinematic Video Intro & Screen Module
// ================================================

import { analytics, logEvent } from './firebase-config.js';
import { initSiteAnimations } from './animations.js';

export function playIntroVideo() {
  const enterDiv = document.getElementById('intro-enter');
  const videoWrap = document.getElementById('intro-video-wrap');
  const video = document.getElementById('intro-video');
  const bar = document.getElementById('video-progress-bar');

  if (enterDiv) {
    enterDiv.classList.remove('active');
    enterDiv.style.display = 'none';
  }
  if (videoWrap) videoWrap.style.display = 'block';

  if (video) {
    video.muted = false;
    video.play().catch(() => { video.muted = true; video.play(); });

    video.addEventListener('timeupdate', () => {
      if (video.duration && bar) {
        bar.style.width = (video.currentTime / video.duration * 100) + '%';
      }
    });

    video.addEventListener('ended', enterMainSite);
  }
}

export function skipIntro() {
  const video = document.getElementById('intro-video');
  if (video) video.pause();
  enterMainSite();
}

export function enterMainSite() {
  const introScreen = document.getElementById('intro-screen');
  const mainSite = document.getElementById('main-site');
  const chatbot = document.getElementById('chatbot-widget');

  if (introScreen) {
    introScreen.style.opacity = '0';
    introScreen.style.transition = 'opacity 0.8s ease';
  }

  setTimeout(() => {
    if (introScreen) introScreen.style.display = 'none';
    if (mainSite) {
      mainSite.style.display = 'block';
      mainSite.style.opacity = '0';
      mainSite.style.transition = 'opacity 0.5s ease';
      setTimeout(() => { mainSite.style.opacity = '1'; }, 50);
    }
    if (chatbot) chatbot.style.display = 'block';

    setTimeout(initSiteAnimations, 100);
    logEvent(analytics, 'site_entered');
    sessionStorage.setItem('eldeeb_intro_seen', '1');
  }, 800);
}

export function initIntro() {
  const enter = document.getElementById('intro-enter');
  if (enter) {
    enter.classList.add('active');
    enter.style.display = 'flex';
  }
}

// Bind to window for HTML inline onclick attribute
window.playIntroVideo = playIntroVideo;
window.skipIntro = skipIntro;
