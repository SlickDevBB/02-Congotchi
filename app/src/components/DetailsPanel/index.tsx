import React from 'react';
import { AavegotchiObject } from 'types';
import styles from './styles.module.css';

interface Props {
  selectedGotchi?: AavegotchiObject;
}

const INTERACT_GOTCHI_MIN = 5;      const INTERACT_GOTCHI_MAX = 15;
const MOVE_GOTCHI_MIN = 5;          const MOVE_GOTCHI_MAX = 15;
const MOVE_AGGRO_MIN = 3;           const MOVE_AGGRO_MAX = 9;
const INTERACT_AGGRO_MIN = 3;       const INTERACT_AGGRO_MAX = 9;
const INTERACT_PORTAL_MIN = 1;      const INTERACT_PORTAL_MAX = 5;
const MOVE_PORTAL_MIN = 3;          const MOVE_PORTAL_MAX = 9;
const MOVE_BOOSTER_MIN = 3;         const MOVE_BOOSTER_MAX = 9;
const INTERACT_BOOSTER_MIN = 1;     const INTERACT_BOOSTER_MAX = 5; 



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

      const interactGotchiStat = INTERACT_GOTCHI_MIN + Math.floor((100-selectedGotchi.withSetsNumericTraits[0])/100*(INTERACT_GOTCHI_MAX-INTERACT_GOTCHI_MIN));
      const moveGotchiStat = MOVE_GOTCHI_MIN + Math.floor(selectedGotchi.withSetsNumericTraits[0]/100*(MOVE_GOTCHI_MAX-MOVE_GOTCHI_MIN));
      const moveAggroStat = MOVE_AGGRO_MIN + Math.floor((100-selectedGotchi.withSetsNumericTraits[1])/100*(MOVE_AGGRO_MAX-MOVE_AGGRO_MIN));
      const interactAggroStat = INTERACT_AGGRO_MIN + Math.floor(selectedGotchi.withSetsNumericTraits[1]/100*(INTERACT_AGGRO_MAX-INTERACT_AGGRO_MIN));
      const interactPortalStat = INTERACT_PORTAL_MIN + Math.floor((100-selectedGotchi.withSetsNumericTraits[2])/100*(INTERACT_PORTAL_MAX-INTERACT_PORTAL_MIN));
      const movePortalStat = MOVE_PORTAL_MIN + Math.floor(selectedGotchi.withSetsNumericTraits[2]/100*(MOVE_PORTAL_MAX-MOVE_PORTAL_MIN));
      const moveBoosterStat = MOVE_BOOSTER_MIN + Math.floor((100-selectedGotchi.withSetsNumericTraits[3])/100*(MOVE_BOOSTER_MAX-MOVE_BOOSTER_MIN));
      const interactBoosterStat = INTERACT_BOOSTER_MIN + Math.floor(selectedGotchi.withSetsNumericTraits[3]/100*(INTERACT_BOOSTER_MAX-INTERACT_BOOSTER_MIN));


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
              {renderModifier('Gotchi Movement Points: ' + moveGotchiStat.toString(), calculatePercentage(selectedGotchi?.withSetsNumericTraits[i] as number))}
              {renderModifier('Gotchi Rotate Points: ' + interactGotchiStat.toString(), calculatePercentage(100 -(selectedGotchi?.withSetsNumericTraits[i] as number)))}
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
              {renderModifier('Aggro Interact Points: ' + interactAggroStat.toString(), calculatePercentage(selectedGotchi?.withSetsNumericTraits[i] as number))}
              {renderModifier('Aggro Movement Points: ' + moveAggroStat.toString(), calculatePercentage(100 - (selectedGotchi?.withSetsNumericTraits[i] as number)))}
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
              {renderModifier('Portal Movement Points: ' + movePortalStat.toString(), calculatePercentage(selectedGotchi?.withSetsNumericTraits[i] as number))}
              {renderModifier('Portal Open Points: ' + interactPortalStat.toString(), calculatePercentage(100 - (selectedGotchi?.withSetsNumericTraits[i] as number)))}
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
              {renderModifier('Booster Interact Points: ' + interactBoosterStat.toString(), calculatePercentage(selectedGotchi?.withSetsNumericTraits[i] as number))}
              {renderModifier('Booster Movement Points: ' + moveBoosterStat.toString(), calculatePercentage(100 - (selectedGotchi?.withSetsNumericTraits[i] as number)))}
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
