// PlayButton

import React from 'react';
import styles from './styles.module.css';
import { AavegotchiObject, Tuple } from 'types';


interface Props {
    gotchi?: AavegotchiObject,
}

export const PlayButton = (props: Props) => {

    return (
        <div className={styles.clickBox}>
            <p>Hello World!</p>
        </div>
    )

}