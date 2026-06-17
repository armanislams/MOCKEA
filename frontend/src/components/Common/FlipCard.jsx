/**
 * FlipCard — Reusable 3-D flip card component.
 *
 * Props:
 *   front        — ReactNode  — content shown on the front face
 *   back         — ReactNode  — content shown on the back face (revealed on hover/tap)
 *   height       — string     — CSS height for the card (default "260px")
 *   duration     — string     — CSS transition duration (default "0.7s")
 *   frontClass   — string     — extra classes for the front face wrapper
 *   backClass    — string     — extra classes for the back face wrapper
 *   className    — string     — extra classes for the outer container
 *   as           — string     — HTML tag for the outer container (default "div")
 *   ...rest      — any additional props forwarded to the outer container (e.g. onClick, href)
 */

import { useEffect, useState, useCallback } from "react";

const STYLES = `
  .fc-root {
    perspective: 1000px;
    background-color: transparent;
  }
  .fc-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform var(--fc-duration, 0.7s) cubic-bezier(0.4, 0, 0.2, 1);
    transform-style: preserve-3d;
  }
  .fc-root:hover .fc-inner,
  .fc-root.fc-flipped .fc-inner {
    transform: rotateY(180deg);
  }
  .fc-face {
    position: absolute;
    inset: 0;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    border-radius: var(--fc-radius, 2rem);
    overflow: hidden;
  }
  .fc-back {
    transform: rotateY(180deg);
  }
  .fc-root:focus-visible {
    outline: 2px solid oklch(var(--p));
    outline-offset: 2px;
    border-radius: var(--fc-radius, 2rem);
  }
`;

let stylesInjected = false;

const injectStyles = () => {
  if (stylesInjected || typeof document === "undefined") return;
  if (document.querySelector("[data-flipcard-styles]")) {
    stylesInjected = true;
    return;
  }
  const tag = document.createElement("style");
  tag.setAttribute("data-flipcard-styles", "");
  tag.textContent = STYLES;
  document.head.appendChild(tag);
  stylesInjected = true;
};

/**
 * @param {object} props
 * @param {React.ReactNode} props.front
 * @param {React.ReactNode} props.back
 * @param {string}  [props.height="260px"]
 * @param {string}  [props.duration="0.7s"]
 * @param {string}  [props.radius="2rem"]
 * @param {string}  [props.frontClass=""]
 * @param {string}  [props.backClass=""]
 * @param {string}  [props.className=""]
 * @param {string}  [props.as="div"]
 */
const FlipCard = ({
  front,
  back,
  height = "260px",
  duration = "0.7s",
  radius = "2rem",
  frontClass = "",
  backClass = "",
  className = "",
  as: Tag = "div",
  ...rest
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    injectStyles();
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsFlipped((prev) => !prev);
    }
  }, []);

  const handleClick = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  return (
    <Tag
      className={`fc-root ${isFlipped ? "fc-flipped" : ""} ${className}`}
      style={{
        height,
        "--fc-duration": duration,
        "--fc-radius": radius,
      }}
      tabIndex={0}
      role="button"
      aria-label="Flip card. Press Enter or Space to toggle."
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      {...rest}
    >
      <div className="fc-inner">
        {/* Front face */}
        <div className={`fc-face ${frontClass}`} aria-hidden={isFlipped}>
          {front}
        </div>
        {/* Back face */}
        <div
          className={`fc-face fc-back ${backClass}`}
          aria-hidden={!isFlipped}
        >
          {back}
        </div>
      </div>
    </Tag>
  );
};

export default FlipCard;
