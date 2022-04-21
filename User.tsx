import React, { FC, useState, useCallback, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Redirect, useHistory } from 'react-router-dom';
import { Spinner } from '../ui/spinner';
import axios from 'axios';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { InputForm } from 'components/ui/inputForm';
import { Button } from 'modularForm';
import { changeNewInfo } from 'reducers/profileSlice';

import styles from './User.module.scss';

interface IUserProps {
  readonly id: string | number;
  readonly loading?: boolean;
  readonly name: string;
  readonly age: number;
  readonly imageUrl?: string;
  readonly profession: string;
  readonly goBackHandler: () => void;
  readonly isFetchSimilar?: boolean;
  readonly onSubmit: (values: any) => void;
}

const validationSchema = () => {
  return Yup.object({
    firstName: Yup.string()
      .min(6, 'First name must be 6 characters or more')
      .max(15, 'First name must be less than 15 characters'),
    lastName: Yup.string()
      .min(6, 'Last name must be 6 characters or more')
      .max(15, 'Last name must be less than 15 characters'),
  });
};

export const User: FC<IUserProps> = ({
  id,
  loading = false,
  name,
  age,
  imageUrl = '',
  profession,
  goBackHandler = () => { },
  isFetchSimilar = false,
  onSubmit = () => { },
}) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const profile = useSelector(state => state.profile);

  const [similarUsers, setSimilarUsers] = useState<any>([]);

  const fetchSimilarUsers = async usersCount => {
    const newSimilarUsers: any = await axios.get('https://jsonplaceholder.typicode.com/users');
    newSimilarUsers.slice(usersCount);
    setSimilarUsers(newSimilarUsers);
  };

  useEffect(() => {
    isFetchSimilar && fetchSimilarUsers(10);
  }, []);

  const similarUsersRender = useMemo(
    () =>
      similarUsers.map((user, index) => {
        return (
          <div key={index} data-testid="similarUser">
            <span>{user.name}</span>
            <span>{user.email}</span>
          </div>
        );
      }),
    [similarUsers],
  );

  const goBack = () => {
    history.push('/new/route');
    goBackHandler();
  };

  const onSubmitHandler = values => {
    onSubmit(values);
  }

  const changeInfoHandler = () => {
    dispatch(changeNewInfo());
  }

  if (!id) {
    return <Redirect to="/pageNotFound" />;
  }

  if (loading) {
    return <Spinner />;
  }

  return (
    <div data-testid="user" className={name && age && profession && styles.fullInfo}>
      <div>{name}</div>
      <div>{age}</div>
      <div>{profession}</div>

      {!!imageUrl && (
        <div className={styles.imageWrap}>
          <img src={imageUrl} alt="avatar" />
        </div>
      )}

      <p>
        Profile Photo Id: <span>{profile.photo.primary.id}</span>
      </p>
      <p>
        Profile Payment Url: <span>{profile.paymentUrl}</span>
      </p>

      <button onClick={goBack}>Go back</button>

      {similarUsersRender}

      <button onClick={() => fetchSimilarUsers(5)}>Fetch more users</button>

      <Formik
        initialValues={{
          firstName: '',
          lastName: '',
        }}
        validationSchema={validationSchema}
        onSubmit={onSubmitHandler}>
        {({ isValid, dirty, isSubmitting, handleSubmit }) => {
          return (
            <Form>
              <InputForm type={'text'} name={'firstName'} placeholder={'Enter your first name'} />
              <InputForm type={'text'} name={'lastName'} placeholder={'Enter your last name'} />
              <Button onClick={handleSubmit} disabled={!isValid || !dirty || isSubmitting}>
                Submit
              </Button>
            </Form>
          );
        }}
      </Formik>

      <button onClick={changeInfoHandler}>Change new info</button>
    </div>
  );
};