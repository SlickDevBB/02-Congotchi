import { useCallback, useEffect, useState } from "react";
import {
  Layout,
  GotchiSelector,
  DetailsPanel,
  Modal,
  GotchiSVG,
} from "components";
import { Link } from "react-router-dom";
import globalStyles from "theme/globalStyles.module.css";
import { useServer } from "server-store";
import { useWeb3, updateAavegotchis, updateRandomAavegotchis } from "web3/context";
import { getDefaultGotchi, getPreviewGotchi } from "helpers/aavegotchi";
import gotchiLoading from "assets/gifs/loading.gif";
import { playSound } from "helpers/hooks/useSound";
import styles from "./styles.module.css";
import { RotateIcon } from "assets";
import { useDiamondCall } from "web3/actions";
import { Tuple } from "types";


const Home = () => {
  const {
    state: {
      usersAavegotchis,
      address,
      selectedAavegotchiId,
      networkId,
      provider,
      randomAavegotchis,
    },
    dispatch,
  } = useWeb3();
  const { highscores } = useServer();
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [gotchiSide, setGotchiSide] = useState<0 | 1 | 2 | 3>(0);

  // function for using a default gotchi
  const useDefaultGotchi = () => {
    dispatch({
      type: "SET_USERS_AAVEGOTCHIS",
      usersAavegotchis: [getDefaultGotchi()],
    });
  };

  // function for using 3 preview gotchis
  const usePreviewGotchis = async () => {
    if (provider) {
      try {
        const gotchi1 = await getPreviewGotchi(provider, {
          name: "GotchiDev",
          id: "OG",
          collateral: "aLINK",
          wearables: [0, 0, 73, 72, 0, 0 , 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          numericTraits: [10, 50, 50, 100, 40, 40]
        });
        const gotchi2 = await getPreviewGotchi(provider, {
          name: "Mascot",
          id: "None",
          numericTraits: [50, 50, 50, 0, 40, 40]
        })
        const gotchi3 = await getPreviewGotchi(provider, {
          name: "H4cker",
          id: "l33T",
          collateral: "aUSDT",
          wearables: [211, 212, 213, 214, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          numericTraits: [100, 100, 100, 100, 100, 100]
        });
        dispatch({
          type: "SET_USERS_AAVEGOTCHIS",
            usersAavegotchis: [gotchi1, gotchi2, gotchi3],
        }); 
      } catch (err) {
        dispatch({
          type: "SET_ERROR",
          error: err
        })
      }
    }
  };

  // function to rotate gotchi
  const rotateGotchi = () => {
    const currentPos = gotchiSide;
    switch (currentPos) {
      case 0:
        setGotchiSide(1);
        break;
      case 1:
        setGotchiSide(3);
        break;
      case 2:
        setGotchiSide(0);
        break;
      case 3:
        setGotchiSide(2);
        break;
      default:
        setGotchiSide(0);
        break;
    }
  }

  /**
   * Updates global state with selected gotchi
   */
  const handleSelect = useCallback(
    (gotchiId: string) => {
      dispatch({
        type: "SET_SELECTED_AAVEGOTCHI",
        selectedAavegotchiId: gotchiId,
      });
    },
    [dispatch]
  );  

  // hook runs when 'address' is changed
  useEffect(() => {
    if (process.env.REACT_APP_OFFCHAIN) return useDefaultGotchi();

    if (address) {
      const prevGotchis = usersAavegotchis || [];
      if (
        prevGotchis.find(
          (gotchi) => gotchi.owner.id.toLowerCase() === address.toLowerCase()
        )
      ) return;

      dispatch({
        type: "SET_SELECTED_AAVEGOTCHI",
        selectedAavegotchiId: undefined,
      });

      updateAavegotchis(dispatch, address);

      // call our update random gotchis function and specify number of randoms we'd like
      updateRandomAavegotchis(dispatch, 5);
    }
  }, [address]);

  const fetchRandomAavegotchiSvg = async (id: string) => {
    if (provider && randomAavegotchis) {
      const svg = await useDiamondCall<Tuple<string, 4>>(provider, {name: "getAavegotchiSideSvgs", parameters: [id]});
      const ra = randomAavegotchis.find( ra => ra.id === id);
      if (ra) ra.svg = svg;
    }
  }

  console.log(randomAavegotchis);

  // create a useEffect() that runs when we get random gotchis to fill in our svgs
  useEffect( () => {  
    if (randomAavegotchis) {
      try {
        for (let i = 0; i < randomAavegotchis.length; i++) {
          fetchRandomAavegotchiSvg(randomAavegotchis[i].id);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }, [randomAavegotchis]);

  const haveFoundRandomGotchis = () => {
    let count = 0;
    if (randomAavegotchis) {
      for (let i = 0; i < randomAavegotchis.length; i++) {
        if (randomAavegotchis[i].svg) count++;
      }
    }
    return (count === randomAavegotchis?.length && count !== 0);
  }

  /////////////////
  // RENDER CODE //
  /////////////////

  // If we don't have a network connection
  if (networkId !== 137 && !process.env.REACT_APP_OFFCHAIN) {
    return (
      <Layout>
        <div className={globalStyles.container}>
          <div className={styles.errorContainer}>
            <h1>{!networkId ? "Not connected" : "Wrong network"}</h1>
            <p className={styles.secondaryErrorMessage}>
              Please connect to the Polygon network.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // If we don't have any userAavegotchis
  if (usersAavegotchis && usersAavegotchis?.length <= 0) {
    return (
      <Layout>
        <div className={globalStyles.container}>
          <div className={styles.errorContainer}>
            <p>
              No Aavegotchis found for address - Please make sure the correct
              wallet is connected.
            </p>
            <p className={styles.secondaryErrorMessage}>
              Don’t have an Aavegotchi? Visit the Baazaar to get one.
            </p>
            <a
              href="https://aavegotchi.com/baazaar/portals-closed?sort=latest"
              target="__blank"
              className={globalStyles.primaryButton}
            >
              Visit Bazaar
            </a>
            {/* Allows developers to build without the requirement of owning a gotchi */}
            {process.env.NODE_ENV === "development" && (
              <button
                onClick={usePreviewGotchis}
                className={globalStyles.primaryButton}
              >
                Use Preview Gotchis
              </button>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  // default render if we have a connection and user has aavegotchis
  return (
    <Layout>
      {showRulesModal && (
        <Modal onHandleClose={() => setShowRulesModal(false)}>
          <div className={styles.modalContent}>
            <h1>Congotchi!!!</h1>
            <p>Oh no frens! AAVEGOTCHIS from all over the REAALM are lost! It is up to you and your chosen gotchi to locate them and bring them back to the warm chambers of the Citaadel!</p>
            <p>Throughout the REAALM you and your gotchi will play many levels, and in each, you must MOVE and INTERACT with lost gotchis and grid objects to
              form gotchi conga lines that finish at portals. Open those portals to conga the gotchis home!</p>
            <p>Grid objects come in 4 colours. PINK, RED, GREEN and BLUE. Player gotchis with attributes closer to the left side of the normal
              distribution curve can INTERACT with more grid objects. Player gotchis with attributes closer to the right side of the curve
              fare better when trying to MOVE grid objects.
            </p>
            <p>
            PINK grid objects are associated with NRG<br></br>
            RED grid objects are associated with AGG<br></br>
            GREEN grid objects are associated with SPK<br></br>
            BLUE grid objects are associated with BRN
            </p>
            <p>Now get out there and start saving some gotchis!</p>
          </div>
        </Modal>
      )}
      <div className={globalStyles.container}>
        <div className={styles.homeContainer}>
          <div className={styles.selectorContainer}>
            <GotchiSelector
              initialGotchiId={selectedAavegotchiId}
              gotchis={usersAavegotchis}
              selectGotchi={handleSelect}
            />
          </div>
          <div className={styles.gotchiContainer}>
            <button className={styles.rotateButton}>
              <RotateIcon width={32} height={24} onClick={rotateGotchi} />
            </button>
            {selectedAavegotchiId ? (
              <GotchiSVG
                side={gotchiSide}
                tokenId={selectedAavegotchiId}
                options={{ animate: true, removeBg: true }}
              />
            ) : (
              <img src={gotchiLoading} alt="Loading Aavegotchi" />
            )}
            <h1 className={styles.highscore}>
              Highscore:{" "}
              {(usersAavegotchis &&
                highscores?.find(
                  (score) => score.tokenId === selectedAavegotchiId
                )?.score) ||
                0}
            </h1>
            <div className={styles.buttonContainer}>
              <Link
                to="/play"
                className={`${globalStyles.primaryButton} ${
                  !usersAavegotchis || !(() => haveFoundRandomGotchis()) ? globalStyles.disabledLink : ""
                }`}
                onClick={() => playSound("send")}
              >
                Start
              </Link>
              <button
                onClick={() => {
                  playSound("click");
                  setShowRulesModal(true);
                }}
                className={`${globalStyles.secondaryButton} ${globalStyles.circleButton}`}
              >
                ?
              </button>
            </div>
          </div>
          <div className={styles.detailsPanelContainer}>
            <DetailsPanel
              selectedGotchi={usersAavegotchis?.find(
                (gotchi) => gotchi.id === selectedAavegotchiId
              )}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;