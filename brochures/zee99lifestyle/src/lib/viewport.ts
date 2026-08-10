/**
 * Viewport queries that more than one file has to agree on.
 *
 * The cover's poster and its video are the same picture, cropped the same way,
 * and they hand over to each other on screen — so the point at which each
 * switches to the vertical crop has to be one decision, not two that drift.
 * The poster reads it as a <source media>, the video script reads it through
 * matchMedia; both get it from here.
 */

/** A phone held upright: the case where 16:9 footage is unshowable. */
export const UPRIGHT_PHONE = '(orientation: portrait) and (max-width: 760px)';
