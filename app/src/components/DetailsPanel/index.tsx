import React from 'react';
import { AavegotchiObject } from 'types';
import styles from './styles.module.css';

interface Props {
  selectedGotchi?: AavegotchiObject;
}

const ROTATE_MIN = 5;     const ROTATE_MAX = 10;
const MOVE_MIN = 5;       const MOVE_MAX = 10;
const GRENADE_MIN = 1;    const GRENADE_MAX = 3;
const CACTI_MIN = 1;      const CACTI_MAX = 3;
const MILKSHAKE_MIN = 1;  const MILKSHAKE_MAX = 3;
const PORTAL_MIN = 2;     const PORTAL_MAX = 5;
const RESHUFFLE_MIN = 1;  const RESHUFFLE_MAX = 3;
const BONUS_MIN = 0;      const BONUS_MAX = 3; 



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

      const rotateStat = ROTATE_MIN + Math.floor((100-selectedGotchi.withSetsNumericTraits[0])/100*(ROTATE_MAX-ROTATE_MIN));
      const moveStat = MOVE_MIN + Math.floor(selectedGotchi.withSetsNumericTraits[0]/100*(MOVE_MAX-MOVE_MIN));
      const grenadeStat = GRENADE_MIN + Math.floor((100-selectedGotchi.withSetsNumericTraits[1])/100*(GRENADE_MAX-GRENADE_MIN));
      const cactiStat = CACTI_MIN + Math.floor(selectedGotchi.withSetsNumericTraits[1]/100*(CACTI_MAX-CACTI_MIN));
      const milkshakeStat = MILKSHAKE_MIN + Math.floor((100-selectedGotchi.withSetsNumericTraits[2])/100*(MILKSHAKE_MAX-MILKSHAKE_MIN));
      const portalStat = PORTAL_MIN + Math.floor(selectedGotchi.withSetsNumericTraits[2]/100*(PORTAL_MAX-PORTAL_MIN));
      const reshuffleStat = RESHUFFLE_MIN + Math.floor((100-selectedGotchi.withSetsNumericTraits[3])/100*(RESHUFFLE_MAX-RESHUFFLE_MIN));
      const bonusStat = BONUS_MIN + Math.floor(selectedGotchi.withSetsNumericTraits[3]/100*(BONUS_MAX-BONUS_MIN));


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
              {renderModifier('Movement Points: ' + moveStat.toString(), calculatePercentage(selectedGotchi?.withSetsNumericTraits[i] as number))}
              {renderModifier('Rotate Points: ' + rotateStat.toString(), calculatePercentage(100 -(selectedGotchi?.withSetsNumericTraits[i] as number)))}
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
              {renderModifier('Cacti Smashes: ' + cactiStat.toString(), calculatePercentage(selectedGotchi?.withSetsNumericTraits[i] as number))}
              {renderModifier('Grenade Diffusions: ' + grenadeStat.toString(), calculatePercentage(100 - (selectedGotchi?.withSetsNumericTraits[i] as number)))}
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
              {renderModifier('Portal Summons: ' + portalStat.toString(), calculatePercentage(selectedGotchi?.withSetsNumericTraits[i] as number))}
              {renderModifier('Milkshake Spawns: ' + milkshakeStat.toString(), calculatePercentage(100 - (selectedGotchi?.withSetsNumericTraits[i] as number)))}
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
              {renderModifier('Bonus Multiplier: ' + bonusStat.toString(), calculatePercentage(selectedGotchi?.withSetsNumericTraits[i] as number))}
              {renderModifier('Reshuffles: ' + reshuffleStat.toString(), calculatePercentage(100 - (selectedGotchi?.withSetsNumericTraits[i] as number)))}
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
