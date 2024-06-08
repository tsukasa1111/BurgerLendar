import React, { useEffect } from "react";
import Unity, { UnityContext } from "react-unity-webgl";

function Webgl() {
  const unityContext = new UnityContext({
    loaderUrl: "unity/test16.loader.js",
    dataUrl: "unity/test16.data",
    frameworkUrl: "unity/test16.framework.js",
    codeUrl: "unity/test16.wasm",
  });

  const burgerConfig = {
    meatCount: 5,
    cheeseCount: 4,
    tomatoCount: 2,
    lettuceCount: 2,
  };

  useEffect(() => {
    unityContext.on("loaded", () => {
      unityContext.send(
        "Scripts",
        "ConfigureBurger",
        JSON.stringify(burgerConfig)
      );
    });
  }, [unityContext]);

  return (
    <div style={{ position: "relative" }}>
      <Unity unityContext={unityContext} style={{ width: 1240, height: 1240 }} />
    </div>
  );
}

export default Webgl;