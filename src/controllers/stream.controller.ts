import { Request, Response } from 'express';
import { createReadStream } from 'fs';
import * as streamService from '../services/stream.service';

export const stream = async (req: Request, res: Response) => {
  const songId = Number(req.params.id);
  const rangeHeader = req.headers.range;
  const result = await streamService.getStreamInfo(songId, rangeHeader);

  res.status(result.statusCode);

  for (const [key, value] of Object.entries(result.headers)) {
    res.setHeader(key, value);
  }

  if (result.statusCode === 206) {
    const stream = createReadStream(result.filePath, { start: result.start, end: result.end });
    stream.on('error', (err) => {
      console.error('Stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ code: 500, data: null, message: 'Stream error' });
      } else {
        res.end();
      }
    });
    stream.pipe(res);
  } else {
    const stream = createReadStream(result.filePath);
    stream.on('error', (err) => {
      console.error('Stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ code: 500, data: null, message: 'Stream error' });
      } else {
        res.end();
      }
    });
    stream.pipe(res);
  }
};
