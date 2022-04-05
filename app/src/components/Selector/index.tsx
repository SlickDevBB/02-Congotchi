// SelectionPanel

import React, {useState, useEffect, MouseEvent} from "react";
import styles from './styles.module.css';
import { AavegotchiObject } from 'types';
import { GotchiSVG, SearchToggle } from "components";
import { PuzzlechemicaDetails } from 'components';
import useWindowWidth from "helpers/hooks/windowSize";
import { Link } from "react-router-dom";
import globalStyles from "theme/globalStyles.module.css";
import { playSound } from "helpers/hooks/useSound";

interface Props {
    gotchis?: AavegotchiObject[];
    foundRandomGotchis?: boolean;
}

export const Selector = ({gotchis, foundRandomGotchis} : Props) => {

    const [activeToggle, setActiveToggle] = useState<"search" | "sort" | undefined>();
    const [searchInput, setSearchInput] = useState<string>("");

    const width = useWindowWidth();
    const isMobile = width < 768;

    const [initGotchis, setInitGotchis] = useState<Array<AavegotchiObject>>();
    const [displayedGotchis, setDisplayedGotchis] =
        useState<Array<AavegotchiObject>>();

    // Handle search & sort
    useEffect(() => {
        if (initGotchis && initGotchis?.length > 0) {
        const gotchis = [...initGotchis];
        const searchMatches = gotchis.filter(
            (gotchi) =>
            gotchi.id.includes(searchInput) ||
            gotchi.name.toLowerCase().includes(searchInput.toLowerCase())
        );

        setDisplayedGotchis(searchMatches);
        }
    }, [searchInput, initGotchis]);

    useEffect(() => {
        if (gotchis) {
            setInitGotchis(gotchis);
        }
    }, [gotchis]);

    const hello = () => {
        console.log('hello');
    }

    console.log(foundRandomGotchis);

    // return output
    return (
        <div className={styles.mainContainer}>  
            {/* Header contains search bar and more info modal */}
            <div className={styles.header}>
                <h2>Select Gotchi</h2>
                <SearchToggle
                    onToggle={() => activeToggle !== "search" ? setActiveToggle("search") :  setActiveToggle(undefined)}
                    activeOverride={isMobile ? activeToggle === "search" : undefined}
                    placeholder="Token ID or Name"
                    onChange={setSearchInput}
                />
            </div>

            <div className={styles.gridContainer}>
                {displayedGotchis?.map( (object, i) => {
                    return (
                        <div className={styles.gotchiDetailsContainer} key={i}>
                            <div className={styles.gotchiDetailsInternalContainer}>
                                <div className={styles.gotchiSvgContainer} onMouseEnter={() => hello()}>
                                    <GotchiSVG side={0} tokenId={object.id} options={{removeBg: true }}/>
                                    <Link
                                        to="/play"
                                        className={`${globalStyles.primaryButton} ${
                                        !gotchis || !foundRandomGotchis ? globalStyles.disabledLink : ""
                                        }`}
                                        onClick={() => playSound("send")}
                                    >
                                        Start
                                    </Link>
                                </div>
                                <div className={styles.name}>{object.name}</div>
                                <PuzzlechemicaDetails gotchi={object}/>
                            </div>

                            <div className={styles.playButtonContainer}>

                            </div>
                        </div>
                    )
                })}
            </div>
            
        </div>
    )
    

};