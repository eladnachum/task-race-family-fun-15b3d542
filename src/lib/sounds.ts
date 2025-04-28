
// Sound URLs from mixkit.co (free sound effects)
const SOUND_URLS = {
  intro: 'https://assets.mixkit.co/music/preview/mixkit-game-level-music-689.mp3',
  click: 'https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3',
  taskComplete: 'https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3',
  victory: 'https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3'
};

class SoundManager {
  private static audioElements: { [key: string]: HTMLAudioElement } = {};

  static preloadSounds() {
    Object.entries(SOUND_URLS).forEach(([key, url]) => {
      const audio = new Audio(url);
      audio.preload = 'auto';
      this.audioElements[key] = audio;
    });
  }

  static playSound(soundName: keyof typeof SOUND_URLS) {
    const audio = this.audioElements[soundName];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(err => console.log('Audio play failed:', err));
    }
  }

  static playIntroMusic() {
    const audio = this.audioElements.intro;
    if (audio) {
      audio.currentTime = 0;
      audio.volume = 0.5; // Lower volume for background music
      audio.play().catch(err => console.log('Audio play failed:', err));
      
      // Stop after 3 seconds
      setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
      }, 3000);
    }
  }
}

export default SoundManager;
