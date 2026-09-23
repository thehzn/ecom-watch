export function parseUserAgent(userAgent = "") {
  let browser = "Unknown Browser";
  let os = "Unknown OS";
  let deviceType = "Desktop";

  if (!userAgent || typeof userAgent !== "string") {
    return {
      device: "Desktop Device",
      browser: "Web Browser",
      os: "Desktop OS",
      deviceType: "Desktop",
    };
  }

  // Detect Device Type
  if (/ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk/i.test(userAgent)) {
    deviceType = "Tablet";
  } else if (/mobi|iphone|ipod|android.*mobile|blackberry|opera mini|iemobile|wpdesktop/i.test(userAgent)) {
    deviceType = "Mobile";
  } else {
    deviceType = "Desktop";
  }

  // Detect OS
  if (/iphone|ipad|ipod/i.test(userAgent)) {
    os = "iOS";
  } else if (/macintosh|mac os x/i.test(userAgent)) {
    os = "macOS";
  } else if (/windows nt 10/i.test(userAgent)) {
    os = "Windows 10/11";
  } else if (/windows nt 6\.3/i.test(userAgent)) {
    os = "Windows 8.1";
  } else if (/windows nt 6\.1/i.test(userAgent)) {
    os = "Windows 7";
  } else if (/windows/i.test(userAgent)) {
    os = "Windows";
  } else if (/android/i.test(userAgent)) {
    os = "Android";
  } else if (/cros/i.test(userAgent)) {
    os = "Chrome OS";
  } else if (/linux/i.test(userAgent)) {
    os = "Linux";
  }

  // Detect Browser
  if (/edg\//i.test(userAgent)) {
    browser = "Microsoft Edge";
  } else if (/opr\//i.test(userAgent) || /opera/i.test(userAgent)) {
    browser = "Opera";
  } else if (/chrome|crios/i.test(userAgent) && !/edg\//i.test(userAgent)) {
    browser = "Chrome";
  } else if (/safari/i.test(userAgent) && !/chrome|crios|android/i.test(userAgent)) {
    browser = "Safari";
  } else if (/firefox|fxios/i.test(userAgent)) {
    browser = "Firefox";
  } else if (/msie|trident/i.test(userAgent)) {
    browser = "Internet Explorer";
  }

  const device = `${browser} on ${os}`;

  return {
    device,
    browser,
    os,
    deviceType,
  };
}

export function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || req.ip || "127.0.0.1";
}
