import React, { useEffect } from 'react';
import Cal, { getCalApi } from "@calcom/embed-react";

interface CalEmbedProps {
    namespace?: string;
    calLink?: string;
}

const CalEmbed: React.FC<CalEmbedProps> = ({ 
    namespace = "ai-automation-discovery", 
    calLink = "mad-ez-media/ai-automation-discovery" 
}) => {
    useEffect(() => {
        (async function () {
            const cal = await getCalApi({"namespace": namespace});
            cal("ui", {
                "theme":"dark",
                "styles":{
                    "branding":{
                        "brandColor":"#D4AF37"
                    }
                },
                "hideEventTypeDetails":false,
                "layout":"column_view"
            });
        })();
    }, []);

    return (
        <Cal 
            namespace={namespace}
            calLink={calLink}
            style={{width:"100%", height:"700px", overflow:"scroll"}}
            config={{
                layout: "month_view",
                theme: "dark"
            }}
        />
    );
};

export default CalEmbed;
