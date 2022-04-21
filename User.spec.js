import React from 'react';
import axios from 'axios';

import '@testing-library/jest-dom';
import { fireEvent, render, screen, act, waitFor } from '@testing-library/react';

import { Router } from 'react-router';
import { createMemoryHistory } from 'history';

import { combineReducers } from 'redux';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import profileSlice from 'reducers/profileSlice';

import { User } from './User';
import { mockSimilarUsers } from './mock';

jest.mock('axios');

const configurateStore = ({ id, paymentUrl }) =>
  configureStore({
    reducer: combineReducers({ profile: profileSlice }),
    preloadedState: {
      profile: {
        photo: {
          primary: {
            id,
          },
        },
        paymentUrl: paymentUrl,
        email: 'gnrjhtrgnrlfdgfgdl@gmail.com',
        newInfo: '',
      },
    },
  });

describe('User', () => {
  it('TEST 1: Render | Should not render User', () => {
    const history = createMemoryHistory();

    history.push('/some/test/route');

    render(
      <Provider store={configurateStore({ id: 123, paymentUrl: '/pay' })}>
        <Router history={history}>
          <User />
        </Router>
      </Provider>,
    );

    expect(screen.queryByTestId('user')).not.toBeInTheDocument();
    // Check Route
    expect(history.location.pathname).toEqual('/pageNotFound');
  });

  it('TEST 2: Render | Should render Spinner', () => {
    render(
      <Provider store={configurateStore({ id: 123, paymentUrl: '/pay' })}>
        <User id={123} loading />
      </Provider>,
    );

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('TEST 3: Render | Should User render', () => {
    render(
      <Provider store={configurateStore({ id: 123, paymentUrl: '/pay' })}>
        <User id={123} />
      </Provider>,
    );

    expect(screen.getByTestId('user')).toBeInTheDocument();
  });

  it('TEST 4: Render | Should User render info props correctly', () => {
    const testName = 'Test Name';
    const testAge = '24';
    const testProfession = 'Frontend Developer';
    const testImageUrl = 'testimageurl';

    const testPhotoId = 123;
    const testPaymentUrl = 'test/pay/url';

    const { container } = render(
      <Provider store={configurateStore({ id: testPhotoId, paymentUrl: testPaymentUrl })}>
        <User
          id={123}
          name={testName}
          age={testAge}
          profession={testProfession}
          imageUrl={testImageUrl}
        />
      </Provider>,
    );

    expect(screen.getByText(testName)).toBeInTheDocument();
    expect(screen.getByText(testAge)).toBeInTheDocument();
    expect(screen.getByText(testProfession)).toBeInTheDocument();
    expect(container.querySelector('img').src.includes(testImageUrl)).toBeTruthy();

    expect(screen.getByText(testPhotoId)).toBeInTheDocument();
    expect(screen.getByText(testPaymentUrl)).toBeInTheDocument();

    expect(screen.getByTestId('user')).toHaveClass('fullInfo');
  });

  it('TEST 5: Routes / Callback | Should go back after click', () => {
    const history = createMemoryHistory();
    history.push('/some/test/route');

    const testGoBackHandler = jest.fn();

    render(
      <Provider store={configurateStore({ id: 123, paymentUrl: '/pay' })}>
        <Router history={history}>
          <User id={123} goBackHandler={testGoBackHandler} />
        </Router>
      </Provider>,
    );

    fireEvent.click(screen.getByText(/Go back/));

    // Перевірити і показати що тести впадуть, коли змінив роут, haveBeenCalledTimes
    expect(history.location.pathname).toEqual('/new/route');
    expect(testGoBackHandler).toHaveBeenCalled();
  });

  it('TEST 6: Fetch | Should have current similar users', async () => {
    axios.get.mockReturnValueOnce(mockSimilarUsers);

    await act(async () => {
      await render(
        <Provider store={configurateStore({ id: 123, paymentUrl: '/pay' })}>
          <User id={123} isFetchSimilar />
        </Provider>,
      );
    });

    expect(screen.getAllByTestId('similarUser').length).toEqual(mockSimilarUsers.length);
  });

  it('TEST 7: Fetch | Should fetch more users correctly', async () => {
    const newFetchUsersCount = 5;
    const newFetchUsers = [...mockSimilarUsers].splice(newFetchUsersCount);

    axios.get
      .mockImplementationOnce(() => Promise.resolve(mockSimilarUsers))
      .mockImplementationOnce(() => Promise.resolve(newFetchUsers));

    await act(async () => {
      await render(
        <Provider store={configurateStore({ id: 123, paymentUrl: '/pay' })}>
          <User id={123} isFetchSimilar />
        </Provider>,
      );
    });

    expect(screen.getAllByTestId('similarUser').length).toEqual(mockSimilarUsers.length);

    await act(async () => {
      await fireEvent.click(screen.getByText(/Fetch more users/));
    });

    expect(screen.getAllByTestId('similarUser').length).toEqual(newFetchUsersCount);
  });

  it('TEST 8: Form | Should form has error message', async () => {
    render(
      <Provider store={configurateStore({ id: 123, paymentUrl: '/pay' })}>
        <User id={123} />
      </Provider>,
    );

    const inputFirstName = screen.getByPlaceholderText('Enter your first name');
    const inputLastName = screen.getByPlaceholderText('Enter your last name');

    expect(inputFirstName).toBeInTheDocument();
    expect(inputLastName).toBeInTheDocument();

    fireEvent.change(inputFirstName, { target: { value: 'short' } });
    fireEvent.change(inputLastName, { target: { value: 'toooooooooo long last name' } });

    fireEvent.blur(inputFirstName);
    fireEvent.blur(inputLastName);

    await waitFor(() => {
      expect(screen.getByText(/First name must be 6 characters or more/)).toBeInTheDocument();
      expect(screen.getByText(/Last name must be less than 15 characters/)).toBeInTheDocument();
    });
  });

  it('TEST 9: Form | Should form submitting with correct values', async () => {
    const onSubmitHandler = jest.fn();

    render(
      <Provider store={configurateStore({ id: 123, paymentUrl: '/pay' })}>
        <User id={123} onSubmit={onSubmitHandler} />
      </Provider>,
    );

    const inputFirstName = screen.getByPlaceholderText('Enter your first name');
    const inputLastName = screen.getByPlaceholderText('Enter your last name');
    const buttonSubmit = screen.getByText(/Submit/);

    const testFirstName = 'FirstName';
    const testLastName = 'LastName';

    fireEvent.change(inputFirstName, { target: { value: testFirstName } });
    fireEvent.change(inputLastName, { target: { value: testLastName } });

    fireEvent.click(buttonSubmit);

    await waitFor(() => {
      expect(onSubmitHandler).toHaveBeenCalledWith({
        firstName: testFirstName,
        lastName: testLastName,
      });
    });
  });

  it('TEST 10: Redux | Should change redux store', async () => {
    const mockStore = configurateStore({ id: 123, paymentUrl: '/pay' });

    render(
      <Provider store={mockStore}>
        <User id={123} />
      </Provider>,
    );

    fireEvent.click(screen.getByText(/Change new info/));

    await waitFor(async () => {
      await expect(mockStore.getState().profile.newInfo).toEqual('This is new info');
    });
  });
});