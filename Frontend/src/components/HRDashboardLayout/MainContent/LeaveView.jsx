import React, { useState } from 'react';
import HRTeamLeaves from './HRTeamLeaves';
import EmployeeLeaveView from '../../EmployeeDashboardLayout/MainContent/LeaveView';
import styles from '../HRDashboardLayout.module.css';

const LeaveView = () => {
    const [activeTab, setActiveTab] = useState('team');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Header Tabs for HR Dual Functionality */}
            <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px', marginBottom: '16px' }}>
                <button 
                    onClick={() => setActiveTab('team')} 
                    className={activeTab === 'team' ? styles.primaryActionButton : styles.secondaryActionButton}
                    style={{ borderRadius: '8px', padding: '10px 24px', transition: 'all 0.2s', fontWeight: '700' }}
                >
                    Manage Team Leaves
                </button>
                <button 
                    onClick={() => setActiveTab('mine')} 
                    className={activeTab === 'mine' ? styles.primaryActionButton : styles.secondaryActionButton}
                    style={{ borderRadius: '8px', padding: '10px 24px', transition: 'all 0.2s', fontWeight: '700' }}
                >
                    My Leave Applications
                </button>
            </div>

            {/* Dynamic View Rendering */}
            <div style={{ animation: 'fadeInModal 0.3s ease-out' }}>
                {activeTab === 'team' ? <HRTeamLeaves /> : <EmployeeLeaveView />}
            </div>
        </div>
    );
};

export default LeaveView;
