import { Layout } from 'components/Layout';
import { useState } from 'react';
import { playSound } from 'helpers/hooks/useSound';
import styles from './styles.module.css';

const About = () => {

  return (
    <Layout>
      <div className={styles.container}>
        <h1>SlickBB</h1>
        <p>Ever since I was a kid all I ever wanted to do was program computer games... so as soon as I finished high school... I put
          that dream on hold and went to university to study civil engineering.</p> 
        <p>4 years of university and 10 years of construction work 
          later I discovered Aavegotchi and its Aamazing community! I have now quit my old job and have thrown myself into Game Dev
          full time. The dream is re-invigorated!
        </p>
        <p>Congotchi is the first game I have developed and is inspired by mobile puzzle games such as Candy Crush and Unblock Me
          (hence the mobile size game screen).</p> 
          <p>If players really enjoy this game I may look into developing it further for mobile
          phones as I see that as a major avenue of future adoption for Aavegotchi.
        </p>
        <br></br>

        <h1>Shout Outs</h1>
        <p>Big thanks to:</p> 
        <ul>
        <li>Coyote for an ebic minigame template.</li>
        <li>The Aarchitects! I would not have got anywhere without all their help.</li>
        <li>Pixelcraft for building a worldclass GameFi ecosystem.</li>
        <li>Kevin from Incompetech for the south american style music samples, check all his sounds out at
        <a href="https://incompetech.com/music/royalty-free"> https://incompetech.com/music</a></li>
        <li><a href="https://365psd.com/psd/mobile-game-gui-56473" title="Mobile Game GUI">Mobile Game GUI</a> from <a href="https://365psd.com">365PSD.com</a></li>
        </ul>
        <br></br>

        <h1>Tips</h1>
        <p>If you enjoyed the game feel free to send any spare GHST to the below (your support is greatly appreciated!):</p>
        <p>0x636Db7553Dfb9c87DCe1a5edF117EDCAff1B650a</p>
        <p>However, if you did not like the game and feel there are areas that could use work, please drop me a message on 
          the Aavegotchi discord with any feedback or improvements that I can make for the future :) </p>
        <p>Peace frens and WAGMI!</p>
      </div>
    </Layout>
  );
};

export default About;
