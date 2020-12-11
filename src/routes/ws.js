const express = require('express');
const router = express.Router({mergeParams: true});

router.ws('/', (ws, req) => {
  const wss = req.wsInstance.getWss();
  console.log('Starting new websocket connection...');
  
  ws.on('message', data => {
    data = JSON.parse(data);
    console.log('Websocket message received', data);
    
    switch (data.type) {
      case 'stale':
        console.log(`Flagging ${data.videoId} as stale`);
        req.appData.flagVideoAsStale(data.kioskId, data.videoId, data.errorCode);
        break;
      default:
        break;
    }
  });
    
  console.log('Client connected!');
  ws.send(JSON.stringify({type: 'diagnostic', connected: true}));
});

module.exports = router;
