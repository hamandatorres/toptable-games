import React from 'react';
import { Link } from 'react-router-dom';
import { UserGame } from '../../redux/userGameReducer';
import Rating from '../StyledComponents/Rating';

const ShelfItem: React.FC<UserGame> = (props: UserGame): JSX.Element => {
  return props.game_id ? (
    <div className="shelf">
      <section className="shelfItemBox">
        <div className="nameFlex">
          <h3>{props.name}</h3>
        </div>
        <div className="shelfItemFlex">
          <Link to={`/usergame/${props.game_id}`} className="linkContainer">
            <div className="overlay">
              <p className="infoText">info</p>
            </div>
            <img className="shelfImage" src={props.image_url} alt={props.name} />
          </Link>
          <div className="stats">
            <h4>play stats</h4>
            <p>play count: {props.play_count}</p>
            <div className="rating">
              <p>rating: </p>
              <Rating rating={props.rating}></Rating>
            </div>
          </div>
        </div>
      </section>
    </div>
  ) : (
    <>,</>
  );
};

export default ShelfItem;
