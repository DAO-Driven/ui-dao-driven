import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import arbitrum_icon from "../data/photos/github/arbitrum.webp";
import gitcoin_icon from "../data/photos/github/GITCOIN.png";
import allo_icon from "../data/photos/github/allo-logo.png";
import hats_icon from "../data/photos/github/hatsIcon.jpeg";
import buidlBox_icon from "../data/photos/github/buidlbox-logo.png";
import Table from '@mui/material/Table';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';


export const Navigation = () => {
  const [accounts, setAccounts] = useState(null);

  const initWeb3 = async () => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);

      // Check the current network chain ID
      const currentChainId = Number(await web3Instance.eth.getChainId());
  
      // Arbitrum One chain ID
      const arbitrumChainId = 0xA4B1; // 42161 in hexadecimal
  
      // If not on Arbitrum, try to switch
      if (currentChainId == arbitrumChainId) {
        fetchAccounts(web3Instance);
      }

    } else {
      console.log("Please install MetaMask!");
    }
  };

  const fetchAccounts = async (web3Instance) => {
    try {
      const accounts = await web3Instance.eth.getAccounts();
      // console.log("::::::: CURRENT ACC:", accounts[0])
      // console.log(accounts)

      setAccounts(accounts);
    } 
    catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  useEffect(() => {
    
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

      await window.ethereum.request({ method: 'eth_requestAccounts' });
  
      const networkData = {
        chainId: '0xA4B1',
        chainName: 'Arbitrum One',
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: ['https://arb1.arbitrum.io/rpc'],
        blockExplorerUrls: ['https://arbiscan.io/'],
      };
  
      // Request to switch to Arbitrum network
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [networkData],
      });
  
      initWeb3();
  
    } catch (error) {
      console.error("Error connecting to MetaMask or switching to Arbitrum:", error);
    }
  };
  
  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  }));

  return (
    <nav id='menu' className='navbar navbar-default navbar-fixed-top full-width'>
      <div className='container full-width'>

        <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={1}>

            <Grid xs={2}>
              {/* <Item>xs=8</Item> */}
              <a className='navbar-brand page-scroll' href='#page-top'>
                  daodriven
              </a>

            </Grid>
            <Grid xs={7} style={{ alignItems: 'center' }}>

          

            </Grid>
            <Grid xs={3}>

              {/* <Item>xs=4</Item> */}

              {accounts && accounts.length > 0 ? (

                <TableContainer component={Paper} sx={{ borderRadius: '25px', overflow: 'hidden', mb: 2 }}>
                    <Table sx={{ minWidth: 100}} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="center" sx={{ fontSize: '11px', fontFamily: "RaxtorRegular", color: "#BEAFC2", py: 1}}>
                                  <Chip 
                                    label={accounts[0]} 
                                    variant="outlined" 
                                    sx={{ 
                                      width: 156, 
                                      fontSize: 13, 
                                      fontFamily: "FaunaRegular",
                                    }} 
                                  />
                                </TableCell>
                                <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#BEAFC2", py: 1}}>
                                  <Avatar 
                                    alt="Arbitrum" 
                                    src={arbitrum_icon} 
                                    sx={{ width: 33, height: 33, border: '1px solid green'}}
                                  />
                                </TableCell>
                            </TableRow>
                        </TableHead>
                    </Table>
                </TableContainer>

                ) : (

                <Button 
                  variant="contained" 
                  onClick={connectWallet}
                  sx={{
                      fontSize: '13px',
                      backgroundColor: '#FFFFFF', // Custom background color
                      color: '#693D8F', // Text color set to #693D8F
                      '&:hover': {
                        backgroundColor: '#693D8F', // Darker shade on hover
                        color: 'white', // You might want to change the text color on hover to white or any other color
                      },
                      padding: '10px 20px', // Custom padding
                      borderRadius: '15px', // Custom border radius
                      fontFamily: "FaunaRegular",
                  }}
                >
                  Connect Wallet
                </Button>
                )}


            </Grid>
          </Grid>
        </Box>



        {/* <a className='navbar-brand page-scroll' href='#page-top'>
            daodriven
        </a>
        <div
          className='collapse navbar-collapse'
          id='bs-example-navbar-collapse-1'
        >
          <ul className='nav navbar-nav navbar-right'>
            {accounts && accounts.length > 0 ? (

              <TableContainer component={Paper} sx={{ borderRadius: '25px', overflow: 'hidden', mb: 2 }}>
                  <Table sx={{ minWidth: 100}} aria-label="simple table">
                      <TableHead>
                          <TableRow>
                              <TableCell align="center" sx={{ fontSize: '11px', fontFamily: "RaxtorRegular", color: "#BEAFC2", py: 1}}>
                                <Chip 
                                  label={accounts[0]} 
                                  variant="outlined" 
                                  sx={{ 
                                    width: 156, 
                                    fontSize: 13, 
                                    fontFamily: "FaunaRegular",
                                  }} 
                                />
                              </TableCell>
                              <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#BEAFC2", py: 1}}>
                                <Avatar 
                                  alt="Arbitrum" 
                                  src={arbitrum_icon} 
                                  sx={{ width: 33, height: 33, border: '1px solid green'}}
                                />
                              </TableCell>
                          </TableRow>
                      </TableHead>
                  </Table>
              </TableContainer>

            ) : (

              <Button 
                variant="contained" 
                onClick={connectWallet}
                sx={{
                    fontSize: '13px',
                    backgroundColor: '#FFFFFF', // Custom background color
                    color: '#693D8F', // Text color set to #693D8F
                    '&:hover': {
                      backgroundColor: '#693D8F', // Darker shade on hover
                      color: 'white', // You might want to change the text color on hover to white or any other color
                    },
                    padding: '10px 20px', // Custom padding
                    borderRadius: '15px', // Custom border radius
                    fontFamily: "FaunaRegular",
                }}
              >
                Connect Wallet
              </Button>
            )}
          </ul>
        </div> */}



      </div>
    </nav>
  );
};
