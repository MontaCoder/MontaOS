import React from 'react';
import { getCurrentDate } from '../../bios';
import { BIOS_COPY } from '../../loadingContent';
import styles from '../../loadingStyles';

type BiosLoadingTextProps = {
    opacity: number;
    showBiosInfo: boolean;
    showLoadingResources: boolean;
    doneLoading: boolean;
    progress: number;
    loaded: number;
    toLoad: number;
    resources: string[];
};

const BiosLoadingText: React.FC<BiosLoadingTextProps> = ({
    opacity,
    showBiosInfo,
    showLoadingResources,
    doneLoading,
    progress,
    loaded,
    toLoad,
    resources,
}) => (
    <div style={Object.assign({}, styles.overlayText, { opacity })}>
        <div style={styles.header} className="loading-screen-header">
            <div style={styles.logoContainer}>
                <div>
                    <p style={styles.green}>
                        <b>{BIOS_COPY.brandLine1}</b>{' '}
                    </p>
                    <p style={styles.green}>
                        <b>{BIOS_COPY.brandLine2}</b>
                    </p>
                </div>
            </div>
            <div style={styles.headerInfo}>
                <p>{BIOS_COPY.releaseDate}</p>
                <p>{BIOS_COPY.copyright}</p>
            </div>
        </div>
        <div style={styles.body} className="loading-screen-body">
            <p>{BIOS_COPY.machine}</p>
            <div style={styles.spacer} />
            {showBiosInfo && (
                <>
                    <p>{BIOS_COPY.showcase}</p>
                    <p>{BIOS_COPY.ramCheck}</p>
                    <div style={styles.spacer} />
                    <div style={styles.spacer} />
                    {showLoadingResources ? (
                        progress == 1 ? (
                            <p>FINISHED LOADING RESOURCES</p>
                        ) : (
                            <p className="loading">
                                LOADING RESOURCES ({loaded}/
                                {toLoad === 0 ? '-' : toLoad})
                            </p>
                        )
                    ) : (
                        <p className="loading">WAIT</p>
                    )}
                </>
            )}
            <div style={styles.spacer} />
            <div style={styles.resourcesLoadingList}>
                {resources.map((sourceName) => (
                    <p key={sourceName}>{sourceName}</p>
                ))}
            </div>
            <div style={styles.spacer} />
            {showLoadingResources && doneLoading && (
                <p>
                    All Content Loaded, launching{' '}
                    <b style={styles.green}>'{BIOS_COPY.launchName}'</b> V1.0
                </p>
            )}
            <div style={styles.spacer} />
            <span className="blinking-cursor" />
        </div>
        <div style={styles.footer} className="loading-screen-footer">
            <p>
                Press <b>DEL</b> to enter SETUP , <b>ESC</b> to skip memory
                test
            </p>
            <p>{getCurrentDate()}</p>
        </div>
    </div>
);

export default BiosLoadingText;
