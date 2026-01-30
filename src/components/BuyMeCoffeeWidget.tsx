import { useEffect } from "react";

export function BuyMeCoffeeWidget() {
  useEffect(() => {
    // Check if script already exists
    const existingScript = document.querySelector('script[data-name="BMC-Widget"]');
    if (existingScript) return;

    const script = document.createElement("script");
    script.setAttribute("data-name", "BMC-Widget");
    script.setAttribute("data-cfasync", "false");
    script.src = "https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js";
    script.setAttribute("data-id", "Delux");
    script.setAttribute("data-description", "Support me on Buy me a coffee!");
    script.setAttribute("data-message", "Can you support us");
    script.setAttribute("data-color", "#40DCA5");
    script.setAttribute("data-position", "Right");
    script.setAttribute("data-x_margin", "18");
    script.setAttribute("data-y_margin", "18");
    script.async = true;

    document.body.appendChild(script);

    return () => {
      // Cleanup on unmount
      const widgetScript = document.querySelector('script[data-name="BMC-Widget"]');
      if (widgetScript) {
        widgetScript.remove();
      }
      // Also remove the widget button if it exists
      const widgetButton = document.getElementById("bmc-wbtn");
      if (widgetButton) {
        widgetButton.remove();
      }
    };
  }, []);

  return null;
}
