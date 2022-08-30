import React, { useState, useEffect } from 'react';
import mockUser from './mockData.js/mockUser';
import mockRepos from './mockData.js/mockRepos';
import mockFollowers from './mockData.js/mockFollowers';
import axios from 'axios';

const rootUrl = 'https://api.github.com';

const GithubContext = React.createContext()
//Provider, consumer are accessible after creating context from react.
// GithubContext.Provider

const GithubProvider = ({ children }) => {
  const [githubUser, setGithubUser] = useState(mockUser);
  const [githubRepos, setGithubRepos] = useState(mockRepos);
  const [githubFollowers, setGithubFollowers] = useState(mockFollowers);
  const [loading, setLoading] = useState(false);
  const [rateRemaining, setRateRemaining] = useState(60);
  //error

  const getRateLimit = () => {
    axios
      .get("https://api.github.com/rate_limit")
      .then(({ data }) => {
        let {
          rate: { remaining },
        } = data;
        setRateRemaining(remaining);
        if (remaining === 0) {
          //set error that no more requests exist at this time.
        }
      })
      .catch((err) => console.log(err));
  };
  useEffect(getRateLimit, []);
   
   
  return (
    <GithubContext.Provider
      value={{ githubFollowers, githubRepos, githubUser, rateRemaining }}
    >
      {children}
    </GithubContext.Provider>
  );
};

export { GithubProvider, GithubContext };