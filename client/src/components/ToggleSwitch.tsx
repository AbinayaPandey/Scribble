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
      <label className="switch">
        <input type="checkbox" checked={checked} onChange={handleChange} />
        <span className="slider" />
      </label>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  /* The switch - the box around the slider */
  .switch {
    display: block;
    --width-of-switch: 3.5em;
    --height-of-switch: 2em;
    /* size of sliding icon -- sun and moon */
    --size-of-icon: 1.4em;
    /* it is like a inline-padding of switch */
    --slider-offset: 0.3em;
    position: relative;
    width: var(--width-of-switch);
    height: var(--height-of-switch);
  }

  /* Hide default HTML checkbox */
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  /* The slider */
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #f4f4f5;
    transition: 0.4s;
    border-radius: 30px;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: var(--size-of-icon, 1.4em);
    width: var(--size-of-icon, 1.4em);
    border-radius: 20px;
    left: var(--slider-offset, 0.3em);
    top: 50%;
    transform: translateY(-50%);
    background: linear-gradient(40deg, #ff0080, #ff8c00 70%);
    transition: 0.4s;
  }

  input:checked + .slider {
    background-color: #303136;
  }

  input:checked + .slider:before {
    left: calc(
      100% - (var(--size-of-icon, 1.4em) + var(--slider-offset, 0.3em))
    );
    background: #303136;
    /* change the value of second inset in box-shadow to change the angle and direction of the moon  */
    box-shadow:
      inset -3px -2px 5px -2px #8983f7,
      inset -10px -4px 0 0 #a3dafb;
  }
`;

export default ToggleSwitch;
