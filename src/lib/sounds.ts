
// Sound URLs from mixkit.co (free sound effects)
const SOUND_URLS = {
  intro: 'https://assets.mixkit.co/music/preview/mixkit-game-level-music-689.mp3',
  click: 'https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3',
  taskComplete: 'https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3',
  victory: 'https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3'
};

class SoundManager {
  private static audioElements: { [key: string]: HTMLAudioElement } = {};
  private static initialized = false;
  private static muted = false;

  static preloadSounds() {
    if (this.initialized) return;
    
    Object.entries(SOUND_URLS).forEach(([key, url]) => {
      const audio = new Audio();
      audio.src = url;
      audio.preload = 'auto';
      
      // Force load the audio
      audio.load();
      
      this.audioElements[key] = audio;
    });
    
    this.initialized = true;
    console.log('Sound Manager: All sounds preloaded');
  }

  static playSound(soundName: keyof typeof SOUND_URLS) {
    if (this.muted) return;
    
    // If not initialized, initialize first
    if (!this.initialized) {
      this.preloadSounds();
    }
    
    try {
      // Create a new audio element each time to allow for overlapping sounds
      const tempAudio = new Audio(SOUND_URLS[soundName]);
      tempAudio.volume = soundName === 'intro' ? 0.5 : 0.8;
      
      // Play with a promise and catch any errors
      tempAudio.play()
        .catch(err => {
          console.error(`Audio play failed for ${soundName}:`, err);
          
          // Fallback to native browser audio API as alternative
          if (window.AudioContext || window["webkitAudioContext"]) {
            try {
              const AudioContextClass = window.AudioContext || window["webkitAudioContext"];
              const audioCtx = new AudioContextClass();
              const oscillator = audioCtx.createOscillator();
              oscillator.type = 'sine';
              oscillator.frequency.setValueAtTime(soundName === 'taskComplete' ? 800 : 500, audioCtx.currentTime);
              oscillator.connect(audioCtx.destination);
              oscillator.start();
              oscillator.stop(audioCtx.currentTime + 0.1);
            } catch (e) {
              console.warn('Fallback audio also failed');
            }
          }
        });
    } catch (err) {
      console.error(`Failed to create audio for ${soundName}:`, err);
    }
  }

  static playIntroMusic() {
    if (this.muted) return;
    
    // If not initialized, initialize first
    if (!this.initialized) {
      this.preloadSounds();
    }
    
    try {
      // Create a new audio for intro to avoid issues with reuse
      const tempAudio = new Audio(SOUND_URLS.intro);
      tempAudio.volume = 0.5; // Lower volume for background music
      
      tempAudio.play()
        .then(() => {
          console.log('Playing intro music');
          // Stop after 3 seconds
          setTimeout(() => {
            tempAudio.pause();
            tempAudio.currentTime = 0;
          }, 3000);
        })
        .catch(err => {
          console.error('Intro music play failed:', err);
          // No fallback for intro music
        });
    } catch (err) {
      console.error('Failed to create intro music:', err);
    }
  }
  
  static toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }
  
  static isMuted() {
    return this.muted;
  }
}

export default SoundManager;
