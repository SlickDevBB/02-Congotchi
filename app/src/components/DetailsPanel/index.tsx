import React from 'react';
import { AavegotchiObject } from 'types';
import styles from './styles.module.css';

import pFUD from 'assets/images/pFUD.png';
import pFOMO from 'assets/images/pFOMO.png';
import pALPHA from 'assets/images/pALPHA.png';
import pKEK from 'assets/images/pKEK.png';

interface Props {
  selectedGotchi?: AavegotchiObject;
  gotchis?: Array<AavegotchiObject>;
}

export const DetailsPanel = ({ selectedGotchi, gotchis }: Props) => {
  const calculatePercentage = (number: number) => {
    if (number > 100) {
      return '100%';
    }
    if (number < 0) {
      return '0';
    }
    return `${number}%`;
  };

  const renderPuzzlechemica = () => {
    return (
      <>
        <div>
          <img src={pFUD}></img>
          <img src={pFOMO}></img>
          <img src={pALPHA}></img>
          <img src={pKEK}></img>
        </div>
      </>
    )
  }

  return (
    <div className={styles.detailsPanel}>
      <h1>
        {selectedGotchi
          ? `${selectedGotchi?.name} (${selectedGotchi?.id})`
          : 'Fetching Aavegotchi...'}
      </h1>

      <hr />
      {
        <React.Fragment>
          {renderPuzzlechemica()}
        </React.Fragment>
      }
    </div>
  );
};
