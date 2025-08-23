import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ShelfItem from './ShelfItem';
import LeaderBoard from '../Header/LeaderBoard';
import { RootState } from '../../redux/store';
import axios from 'axios';
import { UserGame } from '../../redux/userGameReducer';
import { getUserGames } from '../../redux/userGameReducer';
import PlayCountGraph from './PlayCountGraph';

const User: React.FC = () => {
  const user = useSelector((state: RootState) => state.userReducer);
  const [playCount, setPlayCount] = useState(0);

  const userGames = useSelector((state: RootState) => state.userGameReducer.userGames);
  const userID = useSelector((state: RootState) => state.userReducer.user_id);

  const dispatch = useDispatch();

  useEffect((): void => {
    getPlayerStats();
    dispatch(getUserGames());
  }, [userID]);

  const getPlayerStats = () => {
    axios.get(`/api/player/playcount/${userID}`).then((res) => {
      setPlayCount(res.data.sum);
    });
  };

  const mappedUserGames = userGames.map((elem: UserGame, id: number) => {
    return (
      <div key={id}>
        <ShelfItem {...elem}></ShelfItem>
      </div>
    );
  });

  return (
    <div className="flexProfile">
      <aside className="sticky">
        <section className="userProfile">
          <div className="userFlex">
            <h2>{user.username}</h2>
            <h4>playcount: {playCount}</h4>
          </div>
          <PlayCountGraph />
          <div className="userLeaderboard">
            <LeaderBoard />
          </div>
        </section>
      </aside>
      <div className="shelf">{mappedUserGames}</div>
    </div>
  );
};

export default User;
