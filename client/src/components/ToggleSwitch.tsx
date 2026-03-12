import React, { useState, useEffect } from "react";
import styled from "styled-components";

// the variable set the switch should apply when enabled
const altThemeVars: Record<string, string> = {
  "--background": "222 47% 11%",
  "--foreground": "210 40% 98%",
  "--primary": "217 91% 60%",
  "--primary-foreground": "222 47% 11%",
  "--secondary": "217 19% 27%",
  "--secondary-foreground": "210 40% 98%",
  "--muted": "217 19% 27%",
  "--muted-foreground": "215 20% 65%",
  "--accent": "262 83% 58%",
  "--accent-foreground": "210 40% 98%",
  "--destructive": "0 62% 30%",
  "--destructive-foreground": "210 40% 98%",
  "--border": "217 19% 27%",
  "--input": "217 19% 27%",
  "--ring": "224 76% 48%",
  "--radius": "0.75rem",
};

// capture defaults so we can restore them when toggling off
let defaultThemeVars: Record<string, string> | null = null;

function applyVars(vars: Record<string, string>) {
  const root = document.documentElement;
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
}
const STORAGE_KEY = "useAltTheme";

const ToggleSwitch: React.FC = () => {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!defaultThemeVars) {
      // record whatever is currently defined in :root (usually from index.css)
      const style = getComputedStyle(document.documentElement);
      defaultThemeVars = {};
      Object.keys(altThemeVars).forEach((k) => {
        defaultThemeVars![k] = style.getPropertyValue(k) || "";
      });
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "1") {
      setChecked(true);
      applyVars(altThemeVars); // immediately apply
    }
  }, []);

  const handleChange = () => {
    const next = !checked;
    setChecked(next);
    if (next) {
      applyVars(altThemeVars);
      localStorage.setItem(STORAGE_KEY, "1");
    } else if (defaultThemeVars) {
      applyVars(defaultThemeVars);
      localStorage.setItem(STORAGE_KEY, "0");
    }
  };

  return (
    <StyledWrapper>
      <label htmlFor="theme" className="theme">
        <span className="theme__toggle-wrap">
          <input
            id="theme"
            className="theme__toggle"
            type="checkbox"
            role="switch"
            name="theme"
            checked={checked}
            onChange={handleChange}
          />
          <span className="theme__fill" />
          <span className="theme__icon">
            <span className="theme__icon-part" />
            <span className="theme__icon-part" />
            <span className="theme__icon-part" />
            <span className="theme__icon-part" />
            <span className="theme__icon-part" />
            <span className="theme__icon-part" />
            <span className="theme__icon-part" />
            <span className="theme__icon-part" />
            <span className="theme__icon-part" />
          </span>
        </span>
      </label>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  /* Default */
  .theme {
    display: flex;
    align-items: center;
    -webkit-tap-highlight-color: transparent;
    font-size: 0.5em; /* Added to make the icon (and the switch) half of its current size */
    cursor: pointer;
  }

  .theme__fill,
  .theme__icon {
    transition: 0.3s;
  }

  .theme__fill {
    background-color: var(--bg);
    display: block;
    mix-blend-mode: difference;
    position: fixed;
    inset: 0;
    height: 100%;
    transform: translateX(-100%);
    pointer-events: none;
  }

  .theme__icon,
  .theme__toggle {
    z-index: 1;
  }

  /* =========================================================
     ICON DESIGN START
     The following snippets are responsible for the design of the 
     sun/moon icon itself, using CSS shapes and shadows.
     ========================================================= */
  .theme__icon,
  .theme__icon-part {
    position: absolute;
  }

  .theme__icon {
    display: block;
    top: 0.5em;
    left: 0.5em;
    width: 1.5em;
    height: 1.5em;
  }

  /* ► THIS SNIPPET DESIGNS THE SUN ◄
     It uses an inset box-shadow to carve out the sun shape */
  .theme__icon-part {
    border-radius: 50%;
    box-shadow: 0.4em -0.4em 0 0.5em hsl(0, 0%, 100%) inset;
    top: calc(50% - 0.5em + 3px);
    left: calc(50% - 0.5em + 0.5px);
    width: 1em;
    height: 1em;
    transition:
      box-shadow var(--transDur) ease-in-out,
      opacity var(--transDur) ease-in-out,
      transform var(--transDur) ease-in-out;
    transform: scale(0.5);
  }

  /* ► THIS SNIPPET DESIGNS THE SUN RAYS ◄
     These parts are positioned around the core to form rays */
  .theme__icon-part ~ .theme__icon-part {
    background-color: hsl(0, 0%, 100%);
    border-radius: 0.05em;
    top: calc(50% + 3px);
    left: calc(50% - 0.05em);
    transform: rotate(0deg) translateY(0.5em);
    transform-origin: 50% 0;
    width: 0.1em;
    height: 0.2em;
  }

  .theme__icon-part:nth-child(3) {
    transform: rotate(45deg) translateY(0.45em);
  }

  .theme__icon-part:nth-child(4) {
    transform: rotate(90deg) translateY(0.45em);
  }

  .theme__icon-part:nth-child(5) {
    transform: rotate(135deg) translateY(0.45em);
  }

  .theme__icon-part:nth-child(6) {
    transform: rotate(180deg) translateY(0.45em);
  }

  .theme__icon-part:nth-child(7) {
    transform: rotate(225deg) translateY(0.45em);
  }

  .theme__icon-part:nth-child(8) {
    transform: rotate(270deg) translateY(0.5em);
  }

  .theme__icon-part:nth-child(9) {
    transform: rotate(315deg) translateY(0.5em);
  }
  /* =========================================================
     ICON DESIGN END
     ========================================================= */

  .theme__label,
  .theme__toggle,
  .theme__toggle-wrap {
    position: relative;
  }

  .theme__toggle,
  .theme__toggle:before {
    display: block;
  }

  .theme__toggle {
    background-color: hsl(48, 90%, 85%);
    border-radius: 25% / 50%;
    box-shadow: 0 0 0 0.125em var(--primaryT);
    padding: 0.25em;
    width: 6em;
    height: 3em;
    -webkit-appearance: none;
    appearance: none;
    transition:
      background-color var(--transDur) ease-in-out,
      box-shadow 0.15s ease-in-out,
      transform var(--transDur) ease-in-out;
  }

  .theme__toggle:before {
    background-color: hsl(48, 90%, 55%);
    border-radius: 50%;
    content: "";
    width: 2.5em;
    height: 2.5em;
    transition: 0.3s;
  }

  .theme__toggle:focus {
    box-shadow: 0 0 0 0.125em var(--primary);
    outline: transparent;
  }

  /* Checked */
  .theme__toggle:checked {
    background-color: hsl(198, 90%, 15%);
  }

  .theme__toggle:checked:before,
  .theme__toggle:checked ~ .theme__icon {
    transform: translateX(3em);
  }

  .theme__toggle:checked:before {
    background-color: hsl(198, 90%, 55%);
  }

  .theme__toggle:checked ~ .theme__fill {
    transform: translateX(0);
  }

  /* ► THIS SNIPPET COMVERTS THE MOON INTO THE SUN ◄
     By changing the box-shadow, the crescent becomes a full circular sun */
  .theme__toggle:checked ~ .theme__icon .theme__icon-part:nth-child(1) {
    box-shadow: 0.2em -0.2em 0 0.2em hsl(0, 0%, 100%) inset;
    transform: scale(1);
    top: calc(50% - 0.5em + 3px);
    left: calc(50% - 0.5em + 3px);
  }

  /* ► THIS SNIPPET ANIMATES THE SUN RAYS OUTWARD ◄
     When checked, the rays spread out and fade to 0 opacity */
  .theme__toggle:checked ~ .theme__icon .theme__icon-part ~ .theme__icon-part {
    opacity: 0;
  }

  .theme__toggle:checked ~ .theme__icon .theme__icon-part:nth-child(2) {
    transform: rotate(45deg) translateY(0.8em);
  }

  .theme__toggle:checked ~ .theme__icon .theme__icon-part:nth-child(3) {
    transform: rotate(90deg) translateY(0.8em);
  }

  .theme__toggle:checked ~ .theme__icon .theme__icon-part:nth-child(4) {
    transform: rotate(135deg) translateY(0.8em);
  }

  .theme__toggle:checked ~ .theme__icon .theme__icon-part:nth-child(5) {
    transform: rotate(180deg) translateY(0.8em);
  }

  .theme__toggle:checked ~ .theme__icon .theme__icon-part:nth-child(6) {
    transform: rotate(225deg) translateY(0.8em);
  }

  .theme__toggle:checked ~ .theme__icon .theme__icon-part:nth-child(7) {
    transform: rotate(270deg) translateY(0.8em);
  }

  .theme__toggle:checked ~ .theme__icon .theme__icon-part:nth-child(8) {
    transform: rotate(315deg) translateY(0.8em);
  }

  .theme__toggle:checked ~ .theme__icon .theme__icon-part:nth-child(9) {
    transform: rotate(360deg) translateY(0.8em);
  }

  .theme__toggle-wrap {
    margin: 0 0.75em;
  }

  @supports selector(:focus-visible) {
    .theme__toggle:focus {
      box-shadow: 0 0 0 0.125em var(--primaryT);
    }

    .theme__toggle:focus-visible {
      box-shadow: 0 0 0 0.125em var(--primary);
    }
  }
`;

export default ToggleSwitch;
