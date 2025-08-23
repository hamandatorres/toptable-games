import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Player } from 'customTypes';

import Gold from '../../Images/TTGMedalGold.png';
import Silver from '../../Images/TTGMedalSilver.png';
import Bronze from '../../Images/TTGMedalBronze.png';
import Black from '../../Images/TTGMedalBlack.png';

const LeaderBoard: React.FC = (): JSX.Element => {
  const [leaders, setLeaders] = useState<Player[]>([]);
  const [firstUsername, setFirstUsername] = useState('');
  const [firstTotal, setFirstTotal] = useState('');
  const [secondUsername, setSecondUsername] = useState('');
  const [secondTotal, setSecondTotal] = useState('');
  const [thirdUsername, setThirdUsername] = useState('');
  const [thirdTotal, setThirdTotal] = useState('');
  const [fourthUsername, setFourthUsername] = useState('');
  const [fourthTotal, setFourthTotal] = useState('');
  const [fifthUsername, setFifthUsername] = useState('');
  const [fifthTotal, setFifthTotal] = useState('');

  useEffect((): void => {
    getLeaderboard();
  }, []);

  useEffect((): void => {
    if (leaders.length > 0) {
      setFirstUsername(leaders[0]?.username);
      setFirstTotal(leaders[0]?.total);
      setSecondUsername(leaders[1]?.username);
      setSecondTotal(leaders[1]?.total);
      setThirdUsername(leaders[2]?.username);
      setThirdTotal(leaders[2]?.total);
      setFourthUsername(leaders[3]?.username);
      setFourthTotal(leaders[3]?.total);
      setFifthUsername(leaders[4]?.username);
      setFifthTotal(leaders[4]?.total);
    }
  }, [leaders]);

  const getLeaderboard = async (): Promise<void> => {
    await axios
      .get('/api/player/leaderboard')
      .then((res) => {
        const leaderboardArray = res.data;
        setLeaders(leaderboardArray);
      })
      .catch((err) => console.log(err));
  };

  return (
    <section className="leaderboard">
      <div>
        <h4 className="leaderHeader">Leaderboard</h4>
      </div>
      <div className="columns">
        <h5>user</h5>
        <h5>total</h5>
      </div>
      <div className="users">
        <div className="leaderRow">
          <div className="position">
            <img className="medals" src={Gold} alt='Gold Medal' />
            <p>{firstUsername}</p>
          </div>
          <p>{firstTotal}</p>
        </div>
        <div className="leaderRow">
          <div className="position">
            <img className="medals" src={Silver} alt='Silver Medal' />
            <p>{secondUsername}</p>
          </div>
          <p>{secondTotal}</p>
        </div>
        <div className="leaderRow">
          <div className="position">
            <img className="medals" src={Bronze} alt='Bronze Medal' />
            <p>{thirdUsername}</p>
          </div>
          <p>{thirdTotal}</p>
        </div>
        <div className="leaderRow">
          <div className="position">
            <img className="medals" src={Black} alt='Fourth Place' />
            <p>{fourthUsername}</p>
          </div>
          <p>{fourthTotal}</p>
        </div>
        <div className="leaderRow">
          <div className="position">
            <img className="medals" src={Black} alt='Fifth Place' />
            <p>{fifthUsername}</p>
          </div>
          <p>{fifthTotal}</p>
        </div>
      </div>
      <div className="boardScoreWrapper">
        <p className="userDataP"></p>
      </div>
    </section>
  );
};
export default LeaderBoard;
