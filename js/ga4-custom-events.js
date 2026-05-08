(function () {
  "use strict";

  var measurementId = "G-L1YNR24WBC";
  var initialized = false;

  function hasGtag() {
    return typeof window.gtag === "function";
  }

  function safeTrack(eventName, params) {
    if (!hasGtag()) {
      return;
    }

    try {
      var payload = Object.assign(
        {
          page_path: window.location.pathname,
          page_title: document.title,
          page_language: document.documentElement.lang || "unknown"
        },
        params || {}
      );

      window.gtag("event", eventName, payload);
    } catch (err) {
      // Never block product behavior due to analytics tracking.
      console.warn("GA4 custom event failed:", eventName, err);
    }
  }

  function normalizeText(text) {
    return (text || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80);
  }

  function classifyCta(text) {
    var t = (text || "").toLowerCase();

    if (/whatsapp|wa\.me/.test(t)) {
      return "whatsapp";
    }
    if (/預訂|book|booking|order|submit|提交/.test(t)) {
      return "booking";
    }
    if (/查詢|quote|contact|聯絡/.test(t)) {
      return "enquiry";
    }
    return "general";
  }

  function trackLinkClick(anchor) {
    if (!anchor || !anchor.href) {
      return;
    }

    var href = anchor.getAttribute("href") || "";
    var absHref = anchor.href || "";
    var text = normalizeText(anchor.textContent) || normalizeText(anchor.getAttribute("aria-label"));

    if (/wa\.me|whatsapp/i.test(href) || /wa\.me|whatsapp/i.test(absHref)) {
      safeTrack("whatsapp_click", {
        link_url: absHref,
        link_text: text,
        location_hint: window.location.pathname
      });
      return;
    }

    if (/^mailto:/i.test(href)) {
      safeTrack("contact_click", {
        contact_type: "email",
        link_url: href,
        link_text: text
      });
      return;
    }

    if (/^tel:/i.test(href)) {
      safeTrack("contact_click", {
        contact_type: "phone",
        link_url: href,
        link_text: text
      });
      return;
    }

    if (anchor.matches(".cb, .cta-button, .submit-btn") || /預訂|book|booking|查詢|quote|聯絡|contact|立即|馬上/i.test(text)) {
      safeTrack("cta_click", {
        cta_type: classifyCta(text),
        link_url: absHref,
        link_text: text
      });
    }
  }

  function setupGlobalClickTracking() {
    document.addEventListener(
      "click",
      function (event) {
        var target = event.target;
        if (!target) {
          return;
        }

        var anchor = target.closest("a[href]");
        if (!anchor) {
          return;
        }

        trackLinkClick(anchor);
      },
      true
    );
  }

  function setupFormTracking() {
    var interactedForms = new WeakSet();

    document.addEventListener(
      "input",
      function (event) {
        var form = event.target && event.target.form;
        if (!form || interactedForms.has(form)) {
          return;
        }

        interactedForms.add(form);
        safeTrack("booking_form_start", {
          form_id: form.id || "no-id",
          form_name: form.getAttribute("name") || "no-name"
        });
      },
      true
    );

    document.addEventListener(
      "submit",
      function (event) {
        var form = event.target;
        if (!form || form.nodeName !== "FORM") {
          return;
        }

        safeTrack("booking_form_submit", {
          form_id: form.id || "no-id",
          form_name: form.getAttribute("name") || "no-name",
          form_action: form.getAttribute("action") || "inline-handler"
        });
      },
      true
    );
  }

  function init() {
    if (initialized) {
      return;
    }

    initialized = true;

    if (!hasGtag()) {
      return;
    }

    safeTrack("ga4_custom_tracking_loaded", {
      measurement_id: measurementId
    });

    setupGlobalClickTracking();
    setupFormTracking();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
