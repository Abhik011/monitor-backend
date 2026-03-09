(function () {

  let endpoint = "";
  let apiKey = "";
  let userId = null;

  const originalFetch = window.fetch;

  const lastEvent = {};
  const DEDUPE_TIME = 3000;

  /* -----------------------------
     BATCH SETTINGS
  ----------------------------- */

  let eventQueue = [];

  const MAX_BATCH = 20;
  const FLUSH_INTERVAL = 5000;

  /* -----------------------------
     SESSION
  ----------------------------- */

  const sessionId =
    sessionStorage.getItem("creonox_session") ||
    Math.random().toString(36).substring(2);

  sessionStorage.setItem("creonox_session", sessionId);

  /* -----------------------------
     INIT
  ----------------------------- */

  window.Creonox = {

    init(config) {

      if (!config || !config.apiKey) {
        console.error("Creonox: apiKey required");
        return;
      }

      apiKey = config.apiKey;

      endpoint =
        (config.endpoint || "https://monitor.creonox.com/track") +
        "/" +
        apiKey;

      console.log("📡 Creonox Monitor Loaded");

      queueEvent({ type: "pageview" });

    },

    setUser(id) {
      userId = id;
    }

  };

  /* -----------------------------
     QUEUE EVENT
  ----------------------------- */

  function queueEvent(data) {

    if (!endpoint) return;

    const key = data.type + (data.api || data.message || "");

    const now = Date.now();

    if (lastEvent[key] && now - lastEvent[key] < DEDUPE_TIME) {
      return;
    }

    lastEvent[key] = now;

    eventQueue.push({
      ...data,
      sessionId,
      userId,
      page: location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });

    if (eventQueue.length >= MAX_BATCH) {
      flush();
    }

  }

  /* -----------------------------
     FLUSH EVENTS
  ----------------------------- */

  function flush() {

    if (!eventQueue.length) return;

    const payload = JSON.stringify({
      events: eventQueue
    });

    eventQueue = [];

    try {

      if (navigator.sendBeacon) {

        const blob = new Blob([payload], {
         type: "text/plain"
        });

        navigator.sendBeacon(endpoint, blob);

      } else {

        originalFetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: payload,
          keepalive: true,
          credentials: "omit"
        });

      }

    } catch (e) {}

  }

  /* -----------------------------
     AUTO FLUSH
  ----------------------------- */

  setInterval(() => {
    flush();
  }, FLUSH_INTERVAL);

  window.addEventListener("beforeunload", flush);

  console.log("📡 Creonox SDK Initialized");

  /* -----------------------------
     JS ERRORS
  ----------------------------- */

  window.onerror = function (message, source, line, column, error) {

    queueEvent({
      type: "error",
      message,
      source,
      line,
      column,
      stack: error?.stack
    });

  };

  /* -----------------------------
     PROMISE ERRORS
  ----------------------------- */

  window.addEventListener("unhandledrejection", function (event) {

    queueEvent({
      type: "promise_error",
      message: event.reason?.message || "Unhandled promise rejection",
      stack: event.reason?.stack
    });

  });

  /* -----------------------------
     CONSOLE ERRORS
  ----------------------------- */

  const originalConsoleError = console.error;

  console.error = function (...args) {

    queueEvent({
      type: "console_error",
      message: args.join(" ")
    });

    originalConsoleError.apply(console, args);

  };

  /* -----------------------------
     RESOURCE ERRORS
  ----------------------------- */

  window.addEventListener(
    "error",
    function (event) {

      if (event.target && (event.target.src || event.target.href)) {

        queueEvent({
          type: "resource_error",
          resource: event.target.src || event.target.href
        });

      }

    },
    true
  );

  /* -----------------------------
     PERFORMANCE
  ----------------------------- */

  window.addEventListener("load", function () {

    setTimeout(() => {

      const perf = performance.timing;

      const loadTime = perf.loadEventEnd - perf.navigationStart;

      queueEvent({
        type: "performance",
        loadTime
      });

      if (loadTime > 3000) {

        queueEvent({
          type: "slow_page",
          loadTime
        });

      }

    }, 0);

  });

  /* -----------------------------
     CLICK TRACKING
  ----------------------------- */

  document.addEventListener("click", function (e) {

    const el = e.target;

    if (!el) return;

    queueEvent({
      type: "click",
      tag: el.tagName,
      id: el.id,
      class: el.className?.toString()
    });

  });

  /* -----------------------------
     NETWORK STATUS
  ----------------------------- */

  window.addEventListener("offline", () => {
    queueEvent({ type: "network", status: "offline" });
  });

  window.addEventListener("online", () => {
    queueEvent({ type: "network", status: "online" });
  });

  /* -----------------------------
     MEMORY MONITOR
  ----------------------------- */

  if (performance.memory) {

    setInterval(() => {

      queueEvent({
        type: "memory",
        used: performance.memory.usedJSHeapSize
      });

    }, 30000);

  }

  /* -----------------------------
     API MONITORING
  ----------------------------- */

  window.fetch = async (...args) => {

    const url = args[0];

    if (typeof url === "string" && url.includes("/track")) {
      return originalFetch(...args);
    }

    const start = Date.now();

    try {

      const response = await originalFetch(...args);

      const latency = Date.now() - start;

      if (response.status >= 400 || latency > 2000) {

        queueEvent({
          type: "api",
          api: url,
          status: response.status,
          latency
        });

      }

      return response;

    } catch (error) {

      queueEvent({
        type: "api_error",
        api: url,
        message: error.message
      });

      throw error;

    }

  };

})();