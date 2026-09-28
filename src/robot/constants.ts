/**
 * Single source of truth for robot dimensions.
 *
 * Robot-local frame (identity rotation == "home" view):
 *   +X  right
 *   +Y  robot front (top of the screen in the home view)
 *   +Z  robot underside (faces the camera in the home view)
 *   -Z  robot top / lid (faces the camera once the robot is rolled over)
 */

/** Pixels of DOM per world unit for all printed panels. */
export const PX_PER_UNIT = 160
/** drei <Html distanceFactor> that yields PX_PER_UNIT (1px = distanceFactor/400 units). */
export const HTML_DISTANCE_FACTOR = 400 / PX_PER_UNIT

// Widths (body, belt, cards, displays) scale with the screen's aspect ratio;
// see dims.ts. Everything in this file is fixed.

// ---- Tread / belt -------------------------------------------------------
/** Number of card plates riding the belt. */
export const PLATE_COUNT = 6
/** Length of one plate along the belt (world units). */
export const PLATE_PITCH = 2
/** Front straight holds exactly two plates -> "~2 cards in focus". */
export const BELT_STRAIGHT = PLATE_PITCH * 2
/** Drum radius chosen so the loop length is exactly PLATE_COUNT * PLATE_PITCH. */
export const DRUM_RADIUS = ((PLATE_COUNT - 4) * PLATE_PITCH) / (2 * Math.PI)
export const BELT_LENGTH = PLATE_COUNT * PLATE_PITCH
export const BELT_THICKNESS = 0.07
export const BELT_SEGMENTS = 48

// ---- Card plates --------------------------------------------------------
/** Leaves a gap between plates for the raised lug bars. */
export const CARD_HEIGHT = PLATE_PITCH - 0.3
/** How far card faces sit above the belt surface. */
export const CARD_LIFT = BELT_THICKNESS + 0.03

// ---- Chassis (height / depth) --------------------------------------------
export const BODY_HEIGHT = 2.3
export const BODY_WALL = 0.12
/** Gap between the belt's back run and the body floor. */
export const BODY_CLEARANCE = 0.12
/** z of the body's belly plate (just behind the belt's back run). */
export const BODY_BOTTOM_Z = -(DRUM_RADIUS + BELT_THICKNESS + BODY_CLEARANCE)
export const BODY_TOP_Z = BODY_BOTTOM_Z - BODY_HEIGHT

// ---- Lid ----------------------------------------------------------------
export const LID_THICKNESS = 0.16
export const LID_OPEN_ANGLE = (110 * Math.PI) / 180

// ---- Bumpers ------------------------------------------------------------
export const FRONT_BUMPER_HEIGHT = 1.15
export const REAR_BUMPER_HEIGHT = 0.8
const beltEndY = BELT_STRAIGHT / 2 + DRUM_RADIUS + BELT_THICKNESS
export const FRONT_BUMPER_Y = beltEndY + 0.12 + FRONT_BUMPER_HEIGHT / 2
export const REAR_BUMPER_Y = -(beltEndY + 0.12 + REAR_BUMPER_HEIGHT / 2)
/** z of the bumper face that carries the printed UI (flush with the card faces). */
export const BUMPER_FACE_Z = DRUM_RADIUS + CARD_LIFT

/** Bumpers are solid blocks bolted to the belly, reaching out to the card plane. */
export const BUMPER_DEPTH = BUMPER_FACE_Z - BODY_BOTTOM_Z

/** Extents of what the home view needs to frame (robot-local Y). */
export const HOME_TOP_Y = FRONT_BUMPER_Y + FRONT_BUMPER_HEIGHT / 2
export const HOME_BOTTOM_Y = REAR_BUMPER_Y - REAR_BUMPER_HEIGHT / 2

// ---- Chassis (length) ---------------------------------------------------
/** The body runs the full length of the bumpers, like the sketch's top view. */
export const BODY_LENGTH = HOME_TOP_Y - HOME_BOTTOM_Y + 0.1
export const BODY_CENTER_Y = (HOME_TOP_Y + HOME_BOTTOM_Y) / 2

// ---- Top deck (navbar on the top side) -----------------------------------
/** Rear strip of the top that the lid never covers, carrying the second navbar. */
export const DECK_LENGTH = REAR_BUMPER_HEIGHT + 0.2
export const LID_LENGTH = BODY_LENGTH - DECK_LENGTH
export const BODY_FRONT_Y = BODY_CENTER_Y + BODY_LENGTH / 2
export const BODY_REAR_Y = BODY_CENTER_Y - BODY_LENGTH / 2

/** Point the robot rolls over around (middle of its full depth). */
export const PIVOT_Z = (BUMPER_FACE_Z + BODY_TOP_Z - LID_THICKNESS) / 2

// ---- Palette (Starship-style: white shell, charcoal skirt, orange flag) ----
export const COLORS = {
  shell: '#f7f8fa',
  skirt: '#2b2f36',
  rubber: '#23262b',
  tread: '#33373e',
  hub: '#d9dde2',
  interior: '#e4e8ec',
  glass: '#1e2228',
  flag: '#ff6b1a',
}

/** Corner radius of the body tub and lid, in world units. */
export const SHELL_RADIUS = 0.45
/** Height of the charcoal skirt band at the bottom of the body. */
export const SKIRT_HEIGHT = 0.8
