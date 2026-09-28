# BearCarts frontend (proof of concept)

A delivery-robot app UI where every page is printed onto a 3D robot, built with React Three Fiber. Styling is inspired by Starship delivery robots. GrubHub integration is planned.

- **Home** is the robot's underside. Search sits on the front bumper, the store cards are printed on the tread, and the navbar is on the rear bumper. The belt shows about two cards at a time and loops through them in A→Z order.
- **Orders** are printed on the lid (the robot rolls over).
- **Settings** are inside the cargo bay (the lid opens and the camera drops in).
- The navbar also sits in a deck on top of the robot, so it's visible from every view.
- The robot's width follows the screen's aspect ratio, so wider phones like a Fold get a wider body.

## Run

```sh
npm install
npm run dev        # http://localhost:5173
npm run build      # production build to dist/
```

To test on a phone, run `npx vite --host`, or tunnel with `ngrok http 5173`.

## Run in Docker

The image builds the app, then serves the static files with an unprivileged nginx on port 8080.

```sh
docker compose up -d --build   # http://localhost:8080
docker compose down            # stop it
```

Or without Compose:

```sh
docker build -t bearcarts-frontend .
docker run -d -p 8080:8080 bearcarts-frontend
```

After code changes, rebuild with `docker compose up -d --build`. The container serves a fixed build, so it doesn't hot-reload like `npm run dev`.

## Where things live

| Path | What |
| --- | --- |
| `src/robot/constants.ts` | Fixed dimensions (heights, depths, belt loop) and colours |
| `src/robot/dims.ts` | Widths that scale with the screen's aspect ratio |
| `src/robot/BeltSurface.tsx` | Tread surface, card slots and ordering, tap hit-testing |
| `src/robot/cardTexture.ts` | How a store card is drawn into the tread texture |
| `src/robot/Tread.tsx` | Drums, belt links and raised lugs |
| `src/camera/viewpoints.ts` | Camera poses per view and the transition routes between them |
| `src/data/` | Mock stores and orders, the seam for a real GrubHub API |
