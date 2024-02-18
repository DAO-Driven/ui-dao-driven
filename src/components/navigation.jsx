import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import arbitrum_icon from "../data/photos/github/arbitrum-logo.webp"

export const Navigation = () => {
  const [accounts, setAccounts] = useState(null);

  useEffect(() => {
    
    const initWeb3 = () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        fetchAccounts(web3Instance);

        window.ethereum.on('chainChanged', async () => {
          window.location.reload();
        });

      } else {
        console.log("Please install MetaMask!");
      }
    };

    const fetchAccounts = async (web3Instance) => {
      try {
        const accounts = await web3Instance.eth.getAccounts();
        setAccounts(accounts);
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    };

    initWeb3();

    // Listen for account changes
    window.ethereum.on('accountsChanged', (newAccounts) => {
      setAccounts(newAccounts);
    });

    return () => {
      // Clean up the listener
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', setAccounts);
      }
    };
  }, []);

  const connectWallet = async () => {
    try {
      const newAccounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccounts(newAccounts);
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
    }
  };

  return (
    <nav id='menu' className='navbar navbar-default navbar-fixed-top full-width'>
      <div className='container full-width'>
        <a className='navbar-brand page-scroll' href='#page-top'>
            daodriven
        </a>
        <div
          className='collapse navbar-collapse'
          id='bs-example-navbar-collapse-1'
        >

          <ul className='nav navbar-nav navbar-right'>
            {accounts && accounts.length > 0 ? (
              <li>
                {/* <a href='#' className='btn navbar-btn-custom btn-lg page-scroll'>
                  Wallet ID: {accounts[0]}
                </a> */}

                <Stack direction="row" spacing={2}>
                  <Avatar 
                    alt="Arbitrum" 
                    src={arbitrum_icon} 
                    sx={{ width: 56, height: 56, border: '1px solid green'}} // Adjust the size as needed
                  />
                </Stack>
              </li>
            ) : (
              <li>
                <a 
                  onClick={connectWallet}
                  href='#contact' 
                  className='btn navbar-btn-custom btn-lg page-scroll'>
                  Connect Wallet
                </a>
              </li>
            )}
          </ul>

        </div>
      </div>
    </nav>
  );
};
