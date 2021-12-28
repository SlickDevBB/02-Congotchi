import { calcStats } from 'helpers/stats';
import React from 'react';
import { AavegotchiObject } from 'types';
import styles from './styles.module.css';

interface Props {
  selectedGotchi?: AavegotchiObject;
}

export const DetailsPanel = ({ selectedGotchi }: Props) => {
  const calculatePercentage = (number: number) => {
    if (number > 100) {
      return '100%';
    }
    if (number < 0) {
      return '0';
    }
    return `${number}%`;
  };

  const renderModifier = (name: string, percentage: string) => (
    <div className={styles.modifierRow}>
      <p>{name}</p>
      <div className={styles.modifierMeter}>
        <span
          className={styles.progress}
          style={{ width: percentage }}
        />
      </div>
    </div>
  );

  const renderTrait = (i: number) => {
    // use gotchi traits to calc game traits
    if (selectedGotchi) {

      // calculate the gotchis stats
      const gotchiStats = calcStats(selectedGotchi.withSetsNumericTraits[0],
        selectedGotchi.withSetsNumericTraits[1],
        selectedGotchi.withSetsNumericTraits[2],
        selectedGotchi.withSetsNumericTraits[3]);

      switch (i) {
        case 0: {

          return (
            <>
              <div className={styles.traitRow}>
                <p>
                  <span className={styles.emoji}>⚡️</span>
                  {' '}
                  Energy
                </p>
                <p>{selectedGotchi?.withSetsNumericTraits[0]}</p>
              </div>
              {renderModifier('Pink Interactions: ' + gotchiStats.interactPink.toString(), calculatePercentage(100 -(selectedGotchi?.withSetsNumericTraits[i] as number)))}
              {renderModifier('Pink Moves: ' + gotchiStats.movePink.toString(), calculatePercentage(selectedGotchi?.withSetsNumericTraits[i] as number))}
            </>
          );
        }
        case 1: {

          return (
            <>
              <div className={styles.traitRow}>
                <p>
                  <span className={styles.emoji}>👹</span>
                  {' '}
                  Aggression
                </p>
                <p>{selectedGotchi?.withSetsNumericTraits[1]}</p>
              </div>
              {renderModifier('Red Interactions: ' + gotchiStats.interactRed.toString(), calculatePercentage(100 -(selectedGotchi?.withSetsNumericTraits[i] as number)))}
              {renderModifier('Red Moves: ' + gotchiStats.moveRed.toString(), calculatePercentage(selectedGotchi?.withSetsNumericTraits[i] as number))}
            </>
          );
        }
        case 2: {
          return (
            <>
              <div className={styles.traitRow}>
                <p>
                  <span className={styles.emoji}>👻</span>
                  {' '}
                  Spookiness
                </p>
                <p>{selectedGotchi?.withSetsNumericTraits[2]}</p>
              </div>
              {renderModifier('Green Interactions: ' + gotchiStats.interactGreen.toString(), calculatePercentage(100 -(selectedGotchi?.withSetsNumericTraits[i] as number)))}
              {renderModifier('Green Moves: ' + gotchiStats.moveGreen.toString(), calculatePercentage(selectedGotchi?.withSetsNumericTraits[i] as number))}
            </>
          );
        }
        case 3: {
          return (
            <>
              <div className={styles.traitRow}>
                <p>
                  <span className={styles.emoji}>🧠</span>
                  {' '}
                  Brain size
                </p>
                <p>{selectedGotchi?.withSetsNumericTraits[3]}</p>
              </div>
              {renderModifier('Blue Interactions: ' + gotchiStats.interactBlue.toString(), calculatePercentage(100 -(selectedGotchi?.withSetsNumericTraits[i] as number)))}
              {renderModifier('Blue Moves: ' + gotchiStats.moveBlue.toString(), calculatePercentage(selectedGotchi?.withSetsNumericTraits[i] as number))}
            </>
          );
        }
        default:
      }
    } 
  };

  return (
    <div className={styles.detailsPanel}>
      <h1>
        {selectedGotchi
          ? `${selectedGotchi?.name} (${selectedGotchi?.id})`
          : 'Fetching Aavegotchi...'}
      </h1>
      <hr />
      {selectedGotchi?.withSetsNumericTraits.map((_, i) => (
        <React.Fragment key={i}>
          {renderTrait(i)}
        </React.Fragment>
      ))}
    </div>
  );
};
