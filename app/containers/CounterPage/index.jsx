'use strict';

import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { withReducer } from '../../store/reducers/withReducer';
import reducers from './reducers';
import styles from './styles/index.scss';
import { routes } from '../../routing';
import { title } from '../../utils/meta';
import { fetchUrl } from '../../api/www/index';
import {
  incrementCounter,
  decrementCounter,
  apiFetchDemoCounter,
  failLoadCounter,
  reqLoadCounter
} from './actions';
import { makeCount, makeDemoFetchData, makeIsLoading } from './selectors';
import { makeIsLoading as makeIsAppLoading } from '../App/selectors';

class Counter extends Component {
  render() {
    const { count, demoFetchData, isLoading } = this.props;
    return (
      <React.Fragment>
        <Helmet titleTemplate={`%s | ${title}`}>
          <title>Counter</title>
        </Helmet>
        <div>
          <div className={styles.backButton} data-tid="backButton">
            <Link to={routes.Home.path}>Back to home</Link>
          </div>
          <div className={`${styles.bodyWrapper} ${styles.center}`}>
            <div className={`counter ${styles.demoFetch} ${styles.center}`}>
              <textarea
                rows="20"
                cols="50"
                value={_demoFetchData(demoFetchData, isLoading)}
                readOnly
              />
            </div>
            <div className={`counter ${styles.counter}`} data-tid="counter">
              {count}
            </div>
            <div>
              <button onClick={this.props.incrementOnClick}>+</button>
              <button onClick={this.props.decrementOnClick}>-</button>
              <button onClick={this.props.incrementIfOddOnClick}>odd</button>
              <button
                onClick={this.props.incrementAsyncOnClick.bind(this, 1000)}
              >
                Async
              </button>
              <button
                onClick={this.props.apiFetchDemoAsyncOnClick.bind(this, {})}
              >
                Fetch Demo
              </button>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const _demoFetchData = (demoFetchData, isLoading) => {
  let initMsg = `Click Fetch Demo btn`;
  let loadingMsg = `Loading..`;

  if (isLoading && !demoFetchData) {
    return loadingMsg;
  }
  return demoFetchData ? JSON.stringify(demoFetchData) : initMsg;
};

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators(
    {
      incrementOnClick: event => (_, getState) => {
        dispatch(incrementCounter());
      },
      decrementOnClick: event => (_, getState) => {
        dispatch(decrementCounter());
      },
      incrementIfOddOnClick: event => (_, getState) => {
        const { count } = getState().Counter;

        if (count % 2 === 0) {
          return;
        }
        dispatch(incrementCounter());
      },
      incrementAsyncOnClick: (delay, event) => (_, getState) => {
        setTimeout(() => {
          dispatch(incrementCounter());
        }, delay);
      },
      apiFetchDemoAsyncOnClick: ({}, event) => (_, getState) => {
        function _title() {
          let titleList = ['DNA', 'ANIMAL', 'PLANTS'];
          let rand = Math.floor(Math.random() * titleList.length);
          return titleList[rand];
        }

        dispatch(reqLoadCounter());

        fetchUrl({ url: `http://api.plos.org/search?q=title:${_title()}` })
          .then(res => {
            dispatch(apiFetchDemoCounter(res));
          })
          .catch(e => dispatch(failLoadCounter(e)));
      }
    },
    dispatch
  );

const mapStateToProps = (state, props) => {
  return {
    isAppLoading: makeIsAppLoading(state),
    isLoading: makeIsLoading(state),
    count: makeCount(state, props),
    demoFetchData: makeDemoFetchData(state, props)
  };
};

export default withReducer('Counter', reducers)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Counter)
);
