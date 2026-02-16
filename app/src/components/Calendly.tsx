import { useEffect } from "react";
import styles from "@/styles/components/Calendly.module.css";

export default function Calendly() {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://assets.calendly.com/assets/external/widget.js";
        script.async = true; 
        document.body.appendChild(script);
    }, []);

    return <div className={`calendly-inline-widget ${styles['widget']}`} data-url="https://calendly.com/peter-r-mullins/30min?hide_event_type_details=1" ></div>
}