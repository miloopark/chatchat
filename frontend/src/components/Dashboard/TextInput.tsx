import React from 'react';
import styled from 'styled-components';

const InputContainer = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;

  .MuiIconButton-root {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 1;
  }
`;

const TextInput: React.FC = () => {
  return (
    <InputContainer>
      {/* Input component content */}
    </InputContainer>
  );
};

export default TextInput; 