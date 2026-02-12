import { useEffect } from "react";

export default function Calendly() {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://assets.calendly.com/assets/external/widget.js";
        script.async = true; 
        document.body.appendChild(script);
    }, []); 

    return <div className="calendly-inline-widget" data-url="https://calendly.com/peter-r-mullins/30min?hide_event_type_details=1" ></div>
}