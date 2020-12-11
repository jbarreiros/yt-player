const fs = require('fs');

/**
 * App state
 */
module.exports = class AppData {
  constructor(path) {
    this.dataFilePath = path;
    
    try {
      this.appData = JSON.parse(fs.readFileSync(path, 'utf-8'));
      console.log('Loaded app data', this.appData);
    } catch (e) {
      this.appData = {};
      console.log('Could not load app data', e);
    }
  }
  
  getKiosk(id) {
    if (!this.appData.kiosks[id]) {
      this.appData.kiosks[id] = {current: null, videos: []};
    }
    
    return this.appData.kiosks[id];
  }
  
  getVideos(kioskId) {
    return this.getKiosk(kioskId).videos;
  }
  
  getActiveVideos(kioskId) {
    return this.getKiosk(kioskId).videos.filter(video => !video.stale);
  }
  
  getRandomVideo(kioskId) {
    const videoList = this.getActiveVideos(kioskId);
    if (videoList.length === 0) {
      return '';
    }
    return videoList[Math.floor(Math.random() * videoList.length)];
  }
  
  addVideo(kioskId, videoId, name) {
    const kiosk = this.getKiosk(kioskId); 
    const exists = kiosk.videos.find(video => videoId === video.videoId);
    
    if (exists) {
      throw new Error(`Video ${videoId} already exists!`)
    }
    
    const newVideo = {
      videoId,
      name,
      lastPlayed: null,
      stale: false
    };
    
    kiosk.videos.push(newVideo);
    this.save();
    
    return newVideo;
  }
  
  removeVideo(kioskId, videoId) {
    const kiosk = this.getKiosk(kioskId);
    kiosk.videos = kiosk.videos.filter(video => video.videoId !== videoId);
    
    this.save();
  }
  
  flagVideoAsStale(kioskId, videoId, errorCode) {
    const video = this.getKiosk(kioskId).videos.find(video => video.videoId === videoId);
    video.stale = true;
    video.errorCode = errorCode;
    
    this.save();
  }
  
  removeStaleVideos(kioskId) {
    const removed = [];
    const kiosk = this.getKiosk(kioskId);
    
    kiosk.videos = kiosk.videos.filter(video => {
      if (video.stale) {
        removed.push(video.videoId);
        return false;
      }
      
      return true;
    });
    
    this.save();
    
    return removed;
  }
  
  updateCurrent(kioskId, videoId) {
    this.getKiosk(kioskId).current = videoId;
    this.save();
  }
  
  updateCurrentlyPlayingVideo(kioskId, video) {
    this.getKiosk(kioskId).current = video.videoId;
    video.lastPlayed = new Date().getTime();
    this.save();
  }
  
  save() {
    try {
      fs.writeFileSync(this.dataFilePath, JSON.stringify(this.appData, null, 2));
    } catch (e) {
      console.log('Failed to save app data', e);
    }
  }
}