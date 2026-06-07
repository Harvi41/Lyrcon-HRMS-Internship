import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from '@vladmandic/face-api';
import { getDeviceFingerprint } from '../../../lib/attendanceHelper';
import styles from '../HRDashboardLayout.module.css';

const ClockInModal = ({ isOpen, onClose, onConfirmClockIn }) => {
  const webcamRef = useRef(null);
  const [currentTime, setCurrentTime] = useState('');
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [securityError, setSecurityError] = useState('');
  const [step, setStep] = useState(1); 
  
  const [shiftData, setShiftData] = useState({
    shiftType: 'Regular Shift (09:00 AM - 06:00 PM)',
    workMode: 'On-Site',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      setSecurityError(''); 
      setStep(1); 
      const updateClock = () => {
        const now = new Date();
        setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      };
      updateClock();
      const intervalId = setInterval(updateClock, 1000);
      return () => clearInterval(intervalId);
    }
  }, [isOpen]);

  useEffect(() => {
    if (step !== 2) return;

    const loadModels = async () => {
      try {
        setIsModelsLoaded(false);
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/'; 
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        setIsModelsLoaded(true);
      } catch (err) {
        console.error('Failed to initialize Face-API vectors:', err);
        setSecurityError('Biometric Initialization Failure: Models inaccessible.');
        setStep(1); 
      }
    };
    loadModels();
  }, [step]);

  useEffect(() => {
    let loopInterval;

    if (step === 2 && isModelsLoaded && !isVerifying) {
      loopInterval = setInterval(async () => {
        if (!webcamRef.current) return;
        
        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return;

        const img = new Image();
        img.onload = async () => {
          try {
            const detection = await faceapi
              .detectSingleFace(img)
              .withFaceLandmarks()
              .withFaceDescriptor();

            const rawDescriptor = detection?.descriptor || detection?.faceDescriptor;

            if (detection && rawDescriptor) {
              clearInterval(loopInterval);
              setIsVerifying(true);
              
              const compositePayload = {
                shiftType: shiftData.shiftType,
                workMode: shiftData.workMode,
                notes: shiftData.notes,
                deviceFingerprint: shiftData.deviceToken || "MOCK_DEVICE_TOKEN_12345",
                faceEmbedding: Array.from(rawDescriptor) // 
              };

              await onConfirmClockIn(compositePayload);
              onClose();
            }
          } catch (internalLoopErr) {
            console.error("Biometric frame drop parsing tracking values:", internalLoopErr);
          }
        };
        img.src = imageSrc;
      }, 700); 
    }

    return () => clearInterval(loopInterval);
  }, [step, isModelsLoaded, isVerifying, shiftData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { id, value } = e.target;
    setShiftData((prev) => ({ ...prev, [id]: value }));
  };

  const handleProceedToBiometrics = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setSecurityError('');

    try {
      let hardwareToken = "MOCK_DEVICE_TOKEN_12345";
      try {
        const token = await getDeviceFingerprint();
        if (token) hardwareToken = token;
      } catch (fErr) {
        console.warn("Using sandbox device token fallback asset.", fErr);
      }

      setShiftData(prev => ({ ...prev, deviceToken: hardwareToken }));
      setStep(2);
    } catch (err) {
      setSecurityError('Device Authorization Pipeline Exception.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px', padding: '24px', borderRadius: '16px' }}>
        
        <div className={styles.modalHeader} style={{ marginBottom: '20px' }}>
          <h2>{step === 1 ? 'Shift Session Initialize' : 'Biometric Verification'}</h2>
          <button type="button" className={styles.modalCloseBtn} onClick={onClose}>&times;</button>
        </div>

        {securityError && (
          <div style={{ padding: '10px 14px', backgroundColor: '#fff1f2', border: '1px solid #fecdd3', color: '#e11d48', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '16px', fontWeight: '600' }}>
            ⚠️ {securityError}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleProceedToBiometrics} className={styles.modalForm}>
            <div className={styles.nameTemplateTargetBox} style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', color: '#16a34a', textAlign: 'center', padding: '16px', borderRadius: '8px', border: '1px solid', marginBottom: '20px' }}>
              <span style={{ fontSize: '0.8rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#15803d', fontWeight: '600', marginBottom: '4px' }}>
                Current System Time
              </span>
              <strong style={{ fontSize: '2rem', fontFamily: 'monospace', letterSpacing: '0.02em' }}>{currentTime}</strong>
            </div>

            <div className={styles.inputGroup} style={{ marginBottom: '16px' }}>
              <label htmlFor="shiftType">Select Allocated Shift Profile</label>
              <select id="shiftType" value={shiftData.shiftType} onChange={handleChange}>
                <option value="Regular Shift (09:00 AM - 06:00 PM)">Regular Shift (09:00 AM - 06:00 PM)</option>
                <option value="Morning Shift (07:00 AM - 04:00 PM)">Morning Shift (07:00 AM - 04:00 PM)</option>
                <option value="Night Shift (10:00 PM - 07:00 AM)">Night Shift (10:00 PM - 07:00 AM)</option>
              </select>
            </div>

            <div className={styles.inputGroup} style={{ marginBottom: '16px' }}>
              <label htmlFor="workMode">Operating Environment Mode</label>
              <select id="workMode" value={shiftData.workMode} onChange={handleChange}>
                <option value="On-Site">On-Site (HQ Workspace Office)</option>
                <option value="Remote">Remote (Telecommuting Framework)</option>
                <option value="Hybrid">Hybrid Operational Branch</option>
              </select>
            </div>

            <div className={styles.inputGroup} style={{ marginBottom: '20px' }}>
              <label htmlFor="notes">Session Notes / Task Focus <span style={{ color: '#94a3b8', fontWeight: '400' }}>(Optional)</span></label>
              <input
                type="text"
                id="notes"
                placeholder="e.g., CoreHR routing optimization"
                value={shiftData.notes}
                onChange={(e) => setShiftData((prev) => ({ ...prev, notes: e.target.value }))}
                autoComplete="off"
              />
            </div>

            <div className={styles.modalActionButtons}>
              <button type="button" className={styles.secondaryActionButton} onClick={onClose}>Cancel</button>
              <button type="submit" className={styles.successActionButton} style={{ padding: '10px 24px', borderRadius: '10px', minWidth: '160px' }}>
                Proceed to Face Scan
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: '100%', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', marginBottom: '16px', textAlign: 'left',
              backgroundColor: !isModelsLoaded ? '#f8fafc' : (isVerifying ? '#eff6ff' : '#f0fdf4'),
              color: !isModelsLoaded ? '#475569' : (isVerifying ? '#2563eb' : '#16a34a'),
              border: `1px solid ${!isModelsLoaded ? '#e2e8f0' : (isVerifying ? '#bfdbfe' : '#bbf7d0')}`
            }}>
              {!isModelsLoaded ? '🔵 Aligning facial geometric algorithms...' : (isVerifying ? '⚡ Face Detected! Logging attendance...' : '📸 Look directly at the camera to clock in automatically.')}
            </div>

            <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#0f172a' }}>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ width: 640, height: 480, facingMode: "user" }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '200px', height: '200px', border: `3px dashed ${isVerifying ? '#2563eb' : '#10b981'}`,
                borderRadius: '50%', boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.5)',
                transition: 'border-color 0.2s ease'
              }} />
            </div>

            <div className={styles.modalActionButtons} style={{ marginTop: '24px', width: '100%' }}>
              <button type="button" className={styles.secondaryActionButton} onClick={() => setStep(1)} disabled={isVerifying}>
                Back
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ClockInModal;