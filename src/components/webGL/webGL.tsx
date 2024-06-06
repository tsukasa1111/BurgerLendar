import React, { useEffect } from "react";
import Unity, { UnityContext } from "react-unity-webgl";

function Webgl() {
  const unityContext = new UnityContext({
    loaderUrl: "unity/test8.loader.js",
    dataUrl: "unity/test8.data",
    frameworkUrl: "unity/test8.framework.js",
    codeUrl: "unity/test8.wasm",
  });

  const burgerConfig = {
    meatCount: 10,
    cheeseCount: 2,
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
      <Unity unityContext={unityContext} style={{ width: 640, height: 640 }} />
    </div>
  );
}

export default Webgl;