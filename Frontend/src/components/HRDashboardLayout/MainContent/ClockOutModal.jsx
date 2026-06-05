import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from '@vladmandic/face-api';
import { getDeviceFingerprint } from '../../../lib/attendanceHelper';
import styles from '../HRDashboardLayout.module.css';

const ClockOutModal = ({ isOpen, onClose, onConfirmClockOut }) => {
  const webcamRef = useRef(null);
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [securityError, setSecurityError] = useState('');
  const [step, setStep] = useState(1); 
  const [handoverNotes, setHandoverNotes] = useState('');
  const [deviceToken, setDeviceToken] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSecurityError('');
      setHandoverNotes('');
      setDeviceToken('');
      setStep(1); 
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
        console.error('Failed to initialize Face-API vectors for clock-out:', err);
        setSecurityError('Biometric Initialization Failure: Models inaccessible.');
        setStep(1); 
      }
    };
    loadModels();
  }, [step]);

  // ═══════════════════════════════════════════════════════════════════════════
  // ✅ AUTOMATIC LIVE DETECTION LOOP
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    let loopInterval;

    if (step === 2 && isModelsLoaded && !isVerifying) {
      loopInterval = setInterval(async () => {
        if (!webcamRef.current) return;
        
        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return;

        const img = new Image();
        img.onload = async () => {
          const detection = await faceapi
            .detectSingleFace(img)
            .withFaceLandmarks()
            .withFaceDescriptor();

          if (detection) {
            clearInterval(loopInterval);
            setIsVerifying(true);
            
            const compositePayload = {
              notes: handoverNotes,
              deviceToken: deviceToken,
              image: imageSrc,
              descriptor: Array.from(detection.faceDescriptor)
            };

            await onConfirmClockOut(compositePayload);
            onClose();
          }
        };
        img.src = imageSrc;
      }, 600);
    }

    return () => clearInterval(loopInterval);
  }, [step, isModelsLoaded, isVerifying]);

  if (!isOpen) return null;

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

      setDeviceToken(hardwareToken);
      setStep(2); 
    } catch (err) {
      setSecurityError('Device Authorization Pipeline Exception.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px', padding: '24px', borderRadius: '16px' }}>
        
        <div className={styles.modalHeader} style={{ marginBottom: '20px' }}>
          <h2>{step === 1 ? 'Terminate Shift Session' : 'Clock Out Biometric Scan'}</h2>
          <button type="button" className={styles.modalCloseBtn} onClick={onClose}>&times;</button>
        </div>

        {step === 1 && (
          <form onSubmit={handleProceedToBiometrics} className={styles.modalForm}>
            <div className={styles.nameTemplateTargetBox} style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca', color: '#dc2626', textAlign: 'center', padding: '18px', border: '1px solid', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#991b1b', fontWeight: '600', marginBottom: '2px' }}>
                Logged Active Duration
              </span>
              <strong style={{ fontSize: '1.8rem', fontFamily: 'monospace' }}>08 hrs 42 mins</strong>
            </div>

            <p style={{ fontSize: '0.9rem', color: '#475569', margin: '16px 0 4px 0', lineHeight: '1.5', textAlign: 'left' }}>
              You are about to submit your checkout timestamp to the backend server.
            </p>

            <div className={styles.inputGroup} style={{ marginTop: '8px', marginBottom: '20px' }}>
              <label htmlFor="handoverNotes">Shift Handover Summary <span style={{ color: '#94a3b8', fontWeight: '400' }}>(Optional)</span></label>
              <textarea
                id="handoverNotes"
                placeholder="e.g., Dashboard committed to main branch."
                value={handoverNotes}
                onChange={(e) => setHandoverNotes(e.target.value)}
                rows="3"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }}
              />
            </div>

            <div className={styles.modalActionButtons}>
              <button type="button" className={styles.secondaryActionButton} onClick={onClose}>Cancel</button>
              <button type="submit" className={styles.dangerActionButton} style={{ padding: '10px 24px', borderRadius: '10px', minWidth: '160px' }}>
                Proceed to Face Scan
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: '100%', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', marginBottom: '16px', textAlign: 'left',
              backgroundColor: !isModelsLoaded ? '#f8fafc' : (isVerifying ? '#fff1f2' : '#f0fdf4'),
              color: !isModelsLoaded ? '#475569' : (isVerifying ? '#9f1239' : '#16a34a'),
              border: `1px solid ${!isModelsLoaded ? '#e2e8f0' : (isVerifying ? '#fecdd3' : '#bbf7d0')}`
            }}>
              {!isModelsLoaded ? '🔵 Aligning face tracking matrices...' : (isVerifying ? '⚡ Face Detected! Closing session...' : '📸 Position your face inside the loop to close session automatically.')}
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
                width: '200px', height: '200px', border: `3px dashed ${isVerifying ? '#ef4444' : '#10b981'}`,
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

export default ClockOutModal;