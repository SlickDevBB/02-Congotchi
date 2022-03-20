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

  // const renderModifier = (name: string, percentage: string) => (
  //   <div className={styles.modifierRow}>
  //     <p>{name}</p>
  //     <div className={styles.modifierMeter}>
  //       <span
  //         className={styles.progress}
  //         style={{ width: percentage }}
  //       />
  //     </div>
  //   </div>
  // );

  const renderPuzzlechemica = () => {
    return (
      <>
        <div>
          <p>pFUD</p>
          <p>pFOMO</p>
          <p>pALPHA</p>
          <p>pKEK</p>
        </div>
      </>
    )
  }

  // const renderTrait = (i: number) => {
  //   // use gotchi traits to calc game traits
  //   if (selectedGotchi) {

  //     // calculate the gotchis stats
  //     const gotchiStats = calcStats(selectedGotchi.withSetsNumericTraits[0],
  //       selectedGotchi.withSetsNumericTraits[1],
  //       selectedGotchi.withSetsNumericTraits[2],
  //       selectedGotchi.withSetsNumericTraits[3]);

  //     switch (i) {
  //       case 0: {

  //         return (
  //           <>
  //             <div className={styles.traitRow}>
  //               <p>
  //                 NRG
  //               </p>
  //               <p>
  //                 <span className={styles.emoji}>⚡️</span>
  //                 {selectedGotchi?.withSetsNumericTraits[i]}
  //               </p>
  //             </div>
  //             {renderModifier('Spare Move: ' + gotchiStats.spareMove.toString() + ' Pts', calculatePercentage(100 -(selectedGotchi?.withSetsNumericTraits[i] as number)))}
  //             {renderModifier('Gotchi Save: ' + gotchiStats.gotchiSave.toString() + ' Pts', calculatePercentage(selectedGotchi?.withSetsNumericTraits[i] as number))}
              
  //           </>
  //         );
  //       }
  //       case 1: {

  //         return (
  //           <>
  //             <div className={styles.traitRow}>
  //               <p>
  //                 AGG
  //               </p>
  //               <p>
  //                 <span className={styles.emoji}>👹</span>
  //                 {selectedGotchi?.withSetsNumericTraits[i]}
  //               </p>
  //             </div>
  //             {renderModifier('Green Activate: ' + gotchiStats.greenActivate.toString() + ' Pts', calculatePercentage(100 -(selectedGotchi?.withSetsNumericTraits[i] as number)))}
  //             {renderModifier('Red Destroy: ' + gotchiStats.redDestroy.toString() + ' Pts', calculatePercentage(selectedGotchi?.withSetsNumericTraits[i] as number))}
  //           </>
  //         );
  //       }
  //       case 2: {
  //         return (
  //           <>
  //             <div className={styles.traitRow}>
  //               <p>
  //                 SPK
  //               </p>
  //               <p>
  //                 <span className={styles.emoji}>👻</span>
  //                 {selectedGotchi?.withSetsNumericTraits[i]}
  //               </p>
  //             </div>
  //             {renderModifier('Red Damage: ' + gotchiStats.redDamage.toString() + ' Pts', calculatePercentage(100 -(selectedGotchi?.withSetsNumericTraits[i] as number)))}
  //             {renderModifier('Green Buff: ' + gotchiStats.greenBuff.toString() + ' Pts', calculatePercentage(selectedGotchi?.withSetsNumericTraits[i] as number))}
  //           </>
  //         );
  //       }
  //       case 3: {
  //         return (
  //           <>
  //             <div className={styles.traitRow}>
  //               <p>
  //                 BRN
  //               </p>
  //               <p>
  //                 <span className={styles.emoji}>🧠</span>
  //                 {selectedGotchi?.withSetsNumericTraits[i]}
  //               </p>
  //             </div>
  //             {renderModifier('Conga Start: ' + gotchiStats.congaStart.toString() + ' Pts', calculatePercentage(100 - (selectedGotchi?.withSetsNumericTraits[i] as number)))}
  //             {renderModifier('Conga Jump: ' + gotchiStats.congaJump.toString() + ' Pts', calculatePercentage(selectedGotchi?.withSetsNumericTraits[i] as number))}
  //           </>
  //         );
  //       }
  //       default:
  //     }
  //   } 
  // };

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
          {renderPuzzlechemica()}
        </React.Fragment>
      ))}
    </div>
  );
};
