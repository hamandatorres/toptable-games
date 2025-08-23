import styled from '@emotion/styled';
//esling-ignore
const Rating = styled.div`
  display: inline-block;
  font-size: 14pt;
  font-family: Times;
  line-height: 1;
  position: relative;

  &::after {
   content: '⬡⬡⬡⬡⬡';
   position: absolute;
   left:0px;
   letter-spacing: 3px;
  }

  &::before {
    content: '⬢⬢⬢⬢⬢';
    letter-spacing: 3px;
    background: linear-gradient(90deg, black ${(props: { rating: number }) =>
      (props.rating / 5) * 100}%, white ${(props: { rating: number }) => (props.rating / 5) * 100}%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}`;

export default Rating;
