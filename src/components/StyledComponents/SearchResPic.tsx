import styled from '@emotion/styled';

const SearchResPic = styled.img`
  content: url(${(props: { imgUrl: string }) => props.imgUrl});
  max-width: 100%;
  max-height: 70%;
  margin-bottom: 10px;
`;

export default SearchResPic;
