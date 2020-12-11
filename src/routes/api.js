const express = require('express');
const router = express.Router({mergeParams: true});

// Gets the list of videos
router.get('/', (req, res) => {
  const { kioskId }  = req.params;
  res.json(req.appData.getVideos(kioskId));
});

// Add video to list
router.post('/', (req, res) => {
  const { kioskId } = req.params;
  const { videoId, name } = req.body;
  console.log(`Adding video ${videoId}`);
  
  if (!videoId) {
    return res.status(400).end();
  }
  
  const video = req.appData.addVideo(kioskId, videoId, name);
  res.status(201).json(video);
});

// Remove video from list
router.delete('/:videoId', (req, res) => {
  const { kioskId, videoId } = req.params;
  console.log(`Removing video ${videoId}`);
  
  if (!videoId) {
    return res.status(400).end();
  }
  
  req.appData.removeVideo(kioskId, videoId);
  res.status(204).end();
});

// Remove all videos flagged as "stale", return removed videos
router.post('/clean', (req, res) => {
  const { kioskId } = req.params;
  const removed = req.appData.removeStaleVideos(kioskId);
  res.json(removed);
});

// Immediately interrupt the currently playing video.
// The video will not be added to the videos list, 
// but appData.current will be updated.
router.post('/interrupt', (req, res) => {
  if (!req.body.videoId) {
    return res.status(400).end();
  }
  
  const { kioskId } = req.params;
  const data = { type: 'interrupt', videoId: req.body.videoId };
  
  // updata currently playing video
  req.appData.updateCurrent(kioskId, data.videoId);
  
  // send new video through websocket
  console.log(`Clients: ${req.wsInstance.getWss().clients.size}`);
  req.wsInstance.getWss().clients.forEach(client => client.send(JSON.stringify(data)));
  
  res.status(204).end();
});

module.exports = router;
