import React, { useState, useEffect } from 'react';
import mockUser from './mockData.js/mockUser';
import mockRepos from './mockData.js/mockRepos';
import mockFollowers from './mockData.js/mockFollowers';
import axios from 'axios';

const rootUrl = "https://api.github.com"

const GithubContext = React.createContext()
//Provider, consumer are accessible after creating context from react.
// GithubContext.Provider

const GithubProvider = ({ children }) => {
  const [githubUser, setGithubUser] = useState(mockUser)
  const [githubRepos, setGithubRepos] = useState(mockRepos)
  const [githubFollowers, setGithubFollowers] = useState(mockFollowers)
  const [isLoading, setIsLoading] = useState(false)
  const [requestsRemaining, setRequestsRemaining] = useState(60)
  const [error, setError] = useState({ show: false, msg: "" })
  //error
  
  const searchGithubUser = async (user) => {
    toggleError()
    setIsLoading(true)

    const response = await axios(`${rootUrl}/users/${user}`).catch((err) =>
      console.log(err)
    )
    if (response) {
      setGithubUser(response.data)
      const { followers_url, repos_url } = response.data

      //Repos

      //Followers

      // .then((response) => setGithubFollowers(response.data))
      // promise.all

      await Promise.allSettled([
        axios.get(`${repos_url}?per_page=100`),
        axios.get(`${followers_url}?per_page=100`),
      ]).then((result) => {
        const [repos, followers] = result
        
        if (repos.status === "fulfilled") {
          setGithubRepos(repos.value.data)
        }

        if (followers.status === "fulfilled") {
          setGithubFollowers(followers.value.data)
        }
      }).catch(err => console.log(err))
    } else {
      toggleError(true, "there is no user with that username")
    }
    getRequestLimit()
    setIsLoading(false)
  }

  const getRequestLimit = () => {
    axios
      .get("https://api.github.com/rate_limit")
      .then(({ data }) => {
        let {
          rate: { remaining },
        } = data

        setRequestsRemaining(remaining)
        if (remaining === 0) {
          //set error that no more requests exist at this time.
          toggleError(true, "You have exceeded your hourly request limit!")
        }
      })
      .catch((err) => console.log(err))
  }

  function toggleError(show = false, msg = "") {
    setError({ show, msg })
  }

  useEffect(getRequestLimit, []);

  return (
    <GithubContext.Provider
      value={{
        githubFollowers,
        githubRepos,
        githubUser,
        requestsRemaining,
        error,
        searchGithubUser,
        isLoading,
      }}
    >
      {children}
    </GithubContext.Provider>
  )
}

export { GithubProvider, GithubContext }