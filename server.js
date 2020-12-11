const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const authMiddleware = require('./src/middleware/authenticate');
const globalsMiddleware = require('./src/middleware/globals');
const AppData = require('./src/AppData');

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.json()); // middleware to autoparse json
app.use(
  // secures express apps (not a silver bullet)
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'unsafe-inline'", "https://www.youtube.com"],
        "frame-src": ["https://www.youtube.com"]
      }
    }
  })
);
app.use(express.static('public'));

const wsInstance = require('express-ws')(app, null, {wsOptions: {clientTracking: true}}); // websocket
const apiRoutes = require('./src/routes/api');
const wsRoutes = require('./src/routes/ws'); // must be loaded after wsInstance
const appData = new AppData('./.data/app.json');

app.get('/', (req, res) => res.redirect('/kiosk/1'));

app.get('/kiosk/:kioskId(\\d+)', (req, res) => {
  const pageData = { kioskId: req.params.kioskId, videoId: '' };
  const startVideo = appData.getRandomVideo(pageData.kioskId);
  
  if (startVideo !== '') {
    pageData.videoId = startVideo.videoId;
    console.log(`Seeding kiosk ${pageData.kioskId} with video: ${startVideo.videoId}`);
    appData.updateCurrentlyPlayingVideo(pageData.kioskId, startVideo);
  }

  res.render('index', pageData);
});

app.use(
  '/ws',
  globalsMiddleware({ wsInstance, appData }),
  wsRoutes
);

app.use(
  '/kiosk/:kioskId(\\d+)/videos', 
  authMiddleware({secret: process.env.API_SECRET}),
  globalsMiddleware({ wsInstance, appData }),
  apiRoutes,
  (err, req, res, next) => {
    console.log('oops');
    res.status(500).json();
  }
);

const listener = app.listen(process.env.PORT, () => console.log('Your app is listening on port ' + listener.address().port));
