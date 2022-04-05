// PuzzlechemicaDetails
// Component shows

import React from 'react';
import { AavegotchiObject, Tuple } from 'types';
import styles from './styles.module.css';
import pFudImg from 'assets/images/pFUD.png';
import pFomoImg from 'assets/images/pFOMO.png';
import pAlphaImg from 'assets/images/pALPHA.png';
import pKekImg from 'assets/images/pKEK.png';

interface Props {
    gotchi?: AavegotchiObject,
}

export const PuzzlechemicaDetails = (props: Props) => {
    // calc alchemica affinities for the gotchi
    let pFud = 0, pFomo = 0, pAlpha = 0, pKek = 0;
    const traits = props.gotchi?.withSetsNumericTraits;

    if (traits) {
        if (traits[0] >= 50) pFomo++;
        else pFud++;
        if (traits[1] >= 50) pKek++;
        else pAlpha++;
        if (traits[2] >= 50) pFomo++;
        else pFud++;
        if (traits[3] >= 50) pKek++;
        else pAlpha++;
        if (traits[4] >= 50) pFomo++;
        else pFud++;
        if (traits[5] >= 50) pKek++;
        else pAlpha++;
    }

    return (
        <div className={styles.container}>
            <div className={styles.row_1}>
                <div className={styles.alchemicaContainer}>
                    <img className={styles.alchemicaImg} src={pFudImg}/>
                    <div className={styles.alchemicaGlow + ' ' + styles.fud}></div>
                </div>
                <div className={styles.alchemicaContainer}>
                    <img className={styles.alchemicaImg}  src={pFomoImg}/>
                    <div className={styles.alchemicaGlow + ' ' + styles.fomo}></div>
                </div>
                <div className={styles.alchemicaContainer}>
                    <img className={styles.alchemicaImg}  src={pAlphaImg}/>
                    <div className={styles.alchemicaGlow + ' ' + styles.alpha}></div>
                </div>
                <div className={styles.alchemicaContainer}>
                    <img className={styles.alchemicaImg}  src={pKekImg}/>
                    <div className={styles.alchemicaGlow + ' ' + styles.kek}></div>
                </div>
            </div>

            <div className={styles.row_2}>
                <div className={styles.alchemicaStats}>
                    {pFud}/{pFud*20}
                </div>
                <div className={styles.alchemicaStats}>
                    {pFomo}/{pFomo*20}
                </div>
                <div className={styles.alchemicaStats}>
                    {pAlpha}/{pAlpha*20}
                </div>
                <div className={styles.alchemicaStats}>
                    {pKek}/{pKek*20}
                </div>
            </div>

        </div>
    )
}