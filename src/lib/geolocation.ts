// Small helper around the browser Geolocation API. Used by both forms as a
// "use my current location" shortcut — a stand-in for the real map-pin
// picker that lands in a later pass (see README "Next up").
export function getCurrentPosition(): Promise<{ lng: number; lat: number }> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("此浏览器不支持定位"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lng: pos.coords.longitude, lat: pos.coords.latitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  });
}
