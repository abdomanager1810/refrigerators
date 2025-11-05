import React from 'react';
import SubPageLayout from '../components/SubPageLayout';
import { useSiteConfig } from '../hooks/useSiteConfig';

const AboutUsPage: React.FC = () => {
    const { config } = useSiteConfig();

    return (
        <SubPageLayout title="معلومات عنا">
            <div className="p-4 bg-gray-800 text-right text-gray-300 leading-relaxed space-y-4 min-h-screen whitespace-pre-line">
                {config.aboutUsContent}
            </div>
        </SubPageLayout>
    );
};

export default AboutUsPage;