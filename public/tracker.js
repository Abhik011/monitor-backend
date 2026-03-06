(function () {

  const endpoint = "http://localhost:4000/track";
  const originalFetch = window.fetch;

  let lastEvent = {};
  const DEDUPE_TIME = 3000;

  function send(data) {

    const key = data.type + (data.api || data.message || "");

    const now = Date.now();

    if (lastEvent[key] && now - lastEvent[key] < DEDUPE_TIME) {
      return; // prevent duplicate
    }

    lastEvent[key] = now;

    try {

      originalFetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
          page: location.href,
          userAgent: navigator.userAgent
        })
      });

    } catch (e) {
      console.log("Monitor send failed");
    }

  }

  console.log("📡 Monitor tracker loaded");

  /* PAGE VIEW */

  send({ type: "pageview" });

  /* JS ERRORS */

  window.onerror = function (message, source, line, column, error) {

    send({
      type: "error",
      message,
      source,
      line,
      column,
      stack: error?.stack
    });

  };

  /* API MONITORING */

  window.fetch = async (...args) => {

    const url = args[0];

    if (typeof url === "string" && url.includes("/track")) {
      return originalFetch(...args);
    }

    const start = Date.now();

    try {

      const response = await originalFetch(...args);

      const latency = Date.now() - start;

      // only log slow or failed APIs
      if (response.status >= 400 || latency > 2000) {

        send({
          type: "api",
          api: url,
          status: response.status,
          latency
        });

      }

      return response;

    } catch (error) {

      send({
        type: "api_error",
        api: url,
        message: error.message
      });

      throw error;

    }

  };

})();