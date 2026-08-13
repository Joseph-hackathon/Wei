import React from 'react';
import { X, ChevronRight } from 'lucide-react';
import styles from './simulator.module.css';

interface StepModalProps {
  step: number;
  title: string;
  description: string;
  iframeSrc: string;
  onNext: () => void;
  onClose: () => void;
  isLastStep?: boolean;
}

export default function StepModal({ step, title, description, iframeSrc, onNext, onClose, isLastStep }: StepModalProps) {
  if (step === 0) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContentExtended}>
        <div className={styles.modalHeaderExtended}>
          <div className={styles.modalBadge}>STEP {step}</div>
          <button onClick={onClose} className={styles.modalCloseBtn}>
            <X size={20} />
          </button>
        </div>
        
        <div className={styles.modalSplitBody}>
          {/* Left Panel: The UI Preview */}
          <div className={styles.modalLeftPanel}>
            {iframeSrc ? (
              <iframe src={iframeSrc} className={styles.modalIframeExtended} title={`Step ${step} Preview`} />
            ) : (
              <div className={styles.modalIframePlaceholderExtended}>Loading preview...</div>
            )}
          </div>

          {/* Middle: The Connecting Arrow */}
          <div className={styles.modalConnector}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.animatedArrow}>
              <path d="M5 20H35M35 20L25 10M35 20L25 30" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Right Panel: The Explanation */}
          <div className={styles.modalRightPanel}>
            <div className={styles.explanationCard}>
              <h3 className={styles.explanationTitle}>{title}</h3>
              <p className={styles.explanationDesc}>{description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
