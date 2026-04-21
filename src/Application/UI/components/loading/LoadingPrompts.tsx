import React from 'react';
import { BIOS_COPY, FIREFOX_ERROR_LINK } from '../../loadingContent';
import styles from '../../loadingStyles';

type LoadingStartPromptProps = {
    opacity: number;
    mobileWarning: boolean;
    onStart: () => void;
};

export const LoadingStartPrompt: React.FC<LoadingStartPromptProps> = ({
    opacity,
    mobileWarning,
    onStart,
}) => (
    <div style={Object.assign({}, styles.popupContainer, { opacity })}>
        <div style={styles.startPopup}>
            <p>{BIOS_COPY.startTitle}</p>
            {mobileWarning && (
                <>
                    <br />
                    <b>
                        <p style={styles.warning}>
                            WARNING: This experience is best viewed on
                        </p>
                        <p style={styles.warning}>
                            a desktop or laptop computer.
                        </p>
                    </b>
                    <br />
                </>
            )}
            <div style={styles.startHint}>
                <p>Click start to begin{'\xa0'}</p>
                <span className="blinking-cursor" />
            </div>
            <div style={styles.startButtonWrapper}>
                <div className="bios-start-button" onClick={onStart}>
                    <p>START</p>
                </div>
            </div>
        </div>
    </div>
);

export const FirefoxErrorPrompt: React.FC<{ opacity: number }> = ({
    opacity,
}) => (
    <div style={Object.assign({}, styles.popupContainer, { opacity })}>
        <div style={styles.startPopup}>
            <p>
                <b style={{ color: 'red' }}>FATAL ERROR:</b> Firefox Detected
            </p>
            <div style={styles.spacer} />
            <div style={styles.spacer} />
            <p>
                Due to a{' '}
                <a style={styles.link} href={FIREFOX_ERROR_LINK}>
                    bug in firefox
                </a>
                , this website is temporarily inaccessible for anyone using the
                browser.
            </p>
            <div style={styles.spacer} />
            <p>
                I apologize for the inaccessibility. As this site is now public
                I will be revisiting this bug to try and find a work around. If
                I fail, I believe there is a PR currently in review for FireFox
                that attempts to fix the regression. Whether or not that will
                fix the bug is unknown. Updates will be posted here.
            </p>
            <div style={styles.spacer} />
            <p>
                In the mean time if you want to access this site you will need
                to use a different browser.
            </p>
            <div style={styles.spacer} />
            <p>Thank you - Montassar</p>
        </div>
    </div>
);

export const WebGLErrorPrompt: React.FC<{ opacity: number }> = ({
    opacity,
}) => (
    <div style={Object.assign({}, styles.popupContainer, { opacity })}>
        <div style={styles.startPopup}>
            <p>
                <b style={{ color: 'red' }}>CRITICAL ERROR:</b> No WebGL
                Detected
            </p>
            <div style={styles.spacer} />
            <div style={styles.spacer} />

            <p>WebGL is required to run this site.</p>
            <p>Please enable it or switch to a browser which supports WebGL</p>
        </div>
    </div>
);
