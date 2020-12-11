# Lil' YouTube Player Thingy

Goofy little application for playing YouTube videos, that rotate every hour.

## How It Works

Tech:

- Express.js server
- [YouTube IFrame Player API](https://developers.google.com/youtube/iframe_api_reference)
- Websocket (used to get video to play, and report stale videos)

Flow:

- On page load, start a websocket, which immediately sends a random video to play.
- Every hour, the page is reloaded.
  - Reloading, versus changing the video via code, is done to overcome the video player crashing, which occassionally happens and can't be easily detected.
- If the currently playing video is, or becomes unplayable, send a websocket message to flag the video as "stale" and reload the page.

List of videos are stored in a local JSON file:

```json
{
  "kiosks": {
    "1": {
      "videos": [
        {
          "videoId": "51skM6WA-dg",
          "name": "Spongebob trap remix 10 hours",
          "lastPlayed": 1607661800211,
          "stale": false
        }
      ],
      "current": "51skM6WA-dg"
    }
  }
}
```

If a video has become stale, it's JSON will look like:

```json
{
  ...
  "stale": true,
  "errorCode": #
}
```

## API

_Since this is just a personal project, the API is only secured by a simple bearer token (in .env)._

### Immediately change the currently playing video

_Note, the video is not saved to the video list._

```
POST /kiosk/[kioskId]/videos/interrupt
{"videoId": "..."}
```

Response:

- `204 No Content`
- `400` if `videoId` is not provided

### Get the video list

```
GET /kiosk/[kioskId]/videos
```

Response: `200 Success` with JSON `[{<video object}, ...]`.

### Add a video

```
POST /kiosk/[kioskId]/videos
{"videoId": "...", "name": "<name of video>"}
```

Resonse:

- `201 Created` with JSON `{<video object>}`
- `400` if `videoId` is not provided

### Delete a video

```
DELETE /kiosk/[kioskId]/videos/[videoId]
```

Response:

- `204 No Content`
- `400` if `videoId` not provided

### Remove "stale" videos

```
POST /kiosk/[kioskId]/videos/clean
```

Response: `200 Success` with JSON `["<videoId", ...]`

## Misc

Todo:

- allow weighting videos
- secure websocket via auth
