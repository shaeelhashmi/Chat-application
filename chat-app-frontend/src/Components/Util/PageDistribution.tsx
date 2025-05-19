
import React from "react";

interface PageDistributionProps {
    text: React.ReactNode;
}

export default function PageDistribution(props: PageDistributionProps) {
    return (
        <div className="grid lg:grid-cols-[20%,1fr] w-[95vw]">
            {props.text}
        </div>
    );
}
