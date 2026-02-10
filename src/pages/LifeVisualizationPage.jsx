import React from 'react';
import { useData } from '../contexts/DataProvider';
import LifeVisualization from '../components/LifeVisualization';

export default function LifeVisualizationPage() {
    const { userProfile } = useData();

    return (
        <div className="animate-in">
            <div className="mb-6">
                <h1 className="header-font text-4xl fire-text mb-2">Life Visualization</h1>
                <p className="text-gray-400">Your life journey mapped out in weeks</p>
            </div>

            <LifeVisualization dob={userProfile.dob} compact={false} />
        </div>
    );
}
