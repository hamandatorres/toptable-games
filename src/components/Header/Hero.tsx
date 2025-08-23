import React from 'react';

const Hero: React.FC = () => {
  return (
    <div className="hero">
      <div className="hero__background-image"></div>
      <div className="hero__heading">
        <h1>TopTable Games</h1>
        <p>review | rate | track</p>
        {/* <p>your games</p> */}
      </div>
    </div>
  );
};

export default Hero;
