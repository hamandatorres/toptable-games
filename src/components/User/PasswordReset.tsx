import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
// import { Link } from 'react-router-dom';
import Button from '../StyledComponents/Button';
import axios, { AxiosResponse } from 'axios';
import { RouteComponentProps } from 'react-router-dom';
import { User } from 'customTypes';

const PasswordReset: React.FC<RouteComponentProps<{ token: string }>> = (
  props: RouteComponentProps<{ token: string }>
) => {
  const [newPassword, setNewPassword] = useState<string>('');

  const { token } = props.match.params;

  const dispatch = useDispatch();

  const saveChanges = (): void => {
    axios
      .put(`/api/pwdReset/submit/${token}`, { newPassword })
      .then((res: AxiosResponse<User>) => {
        const user = res.data;
        dispatch({ type: 'UPDATE_USER', payload: user });
        props.history.push('/');
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="resetPasswordPage">
      <section className="resetPasswordContainer">
        <h3>Reset Password</h3>
        <form
          onSubmit={(e: React.SyntheticEvent) => {
            e.preventDefault();
          }}>
          {/* <p>enter new password</p> */}
          <input
            className="resetPassword"
            value={newPassword}
            placeholder="new password"
            type="password"
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setNewPassword(e.target.value)}
          />
          <br></br>
          <Button onClick={(): void => saveChanges()}>save</Button>
        </form>
      </section>
    </div>
  );
};

export default PasswordReset;
