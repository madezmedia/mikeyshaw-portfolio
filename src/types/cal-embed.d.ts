declare module '@calcom/embed-react' {
    import React from 'react';

    export interface CalConfig {
        layout?: 'month_view' | 'column_view';
        theme?: 'light' | 'dark';
        hideEventTypeDetails?: boolean;
        styles?: {
            branding?: {
                brandColor?: string;
            }
        }
    }

    export interface CalProps {
        namespace?: string;
        calLink?: string;
        style?: React.CSSProperties;
        config?: CalConfig;
    }

    export function getCalApi(options?: { namespace?: string }): Promise<(method: string, options?: any) => void>;

    const Cal: React.FC<CalProps>;
    export default Cal;
}
