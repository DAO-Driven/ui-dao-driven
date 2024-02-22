import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import ManagerContractABI from '../contracts/abis/managerContractAbi.json';
import { ExploreActiveProject } from "./ExploreActiveProject";
import ExecutorSupplierVotingStrategyABI from '../contracts/abis/ExecutorSupplierVotingStrategyAbi.json';
import eth_icon from "../data/photos/github/ether.jpeg"
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import CircularProgress, {
    CircularProgressProps,
} from '@mui/material/CircularProgress';

const {managerContractAddress} = require('../contracts/contractsAddresses.json');


export const ActiveProjects = () => {
    const [profilesData, setProfilesData] = useState([]);
    const [selectedProfileId, setSelectedProfileId] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {

        setLoading(true);

        const initWeb3 = async () => {
            if (window.ethereum) {
                const web3Instance = new Web3(window.ethereum);

                const managerContract = new web3Instance.eth.Contract(ManagerContractABI, managerContractAddress);
                try {


                    const profileIds = await managerContract.methods.getProfiles().call();
                    const activeProjects = [];

                    await Promise.all(profileIds.map(async project=> {

                        const strategyAddress = await managerContract.methods.getProjectStrategy(project).call();

                        if (strategyAddress != "0x0000000000000000000000000000000000000000"){

                            const ExecutorSupplierVotingStrategy = new web3Instance.eth.Contract(ExecutorSupplierVotingStrategyABI, strategyAddress);
                            const strategyState = Number(await ExecutorSupplierVotingStrategy.methods.state().call());
                            // console.log("====> STRATEGY STATE:", strategyState)

                            if (strategyState == 1){

                                const supply = await managerContract.methods.getProjectSupply(project).call();
                                const projectData = await managerContract.methods.getProfile(project).call();
                                const projectSuppliers = await managerContract.methods.getProjectSuppliers(project).call();

                                activeProjects.push({ 
                                    id: project, 
                                    name: projectData.name, 
                                    description: supply.description, 
                                    need: web3Instance.utils.fromWei(supply.need, 'ether'),
                                    managers: projectSuppliers.length
                                });
                            }
                        }
                    }))

                    setProfilesData(activeProjects);

                } catch (error) {
                    console.error("Error fetching profiles:", error);
                }
            } else {
                console.log("Please install MetaMask!");
            }
        };

        initWeb3().finally(() => setLoading(false));
    }, [setSelectedProfileId]);

    return (
        <div>

            {selectedProfileId && (
                <ExploreActiveProject
                    profileId={selectedProfileId}
                    setActiveProject={setSelectedProfileId} 
                />
            )}

            {loading ? (
                <div style={loadingBarContainerStyle}>
                    <div className="loader"></div>
                </div>
            ) : (
                <> 
                    {!selectedProfileId && (
                        <div className='row'>
                            <div className='col-md-12' style={contentStyle}>
                            <Typography variant="h6" component="div" sx={{ 
                                    flexGrow: 1, 
                                    fontSize: '17px', // Make text larger
                                    paddingBottom: 2, 
                                    fontFamily: "FaunaRegular",
                                    color: "#695E93"
                                }}
                            >
                                Active Phase Projects
                            </Typography>
                                <TableContainer component={Paper} sx={{ borderRadius: '25px', overflow: 'hidden' }}>
                                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#695E93" }}>Token</TableCell>

                                                <TableCell sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#695E93" }}>Name</TableCell>
                                                <TableCell align="right" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#695E93" }}>Executors</TableCell>
                                                <TableCell align="right" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#695E93"}}>Managers</TableCell>
                                                <TableCell align="right" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#695E93"}}>Funds Raised</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {profilesData.map((profile) => (
                                                <TableRow
                                                    key={profile.name}
                                                    sx={{
                                                        '&:last-child td, &:last-child th': { border: 0 },
                                                        cursor: 'pointer',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(0, 0, 0, 0.04)', // Adjust the hover color as needed
                                                        },
                                                    }}
                                                    onClick={() => setSelectedProfileId(profile.id)}
                                                >
                                                    <TableCell component="th" scope="row" sx={{ fontSize: '15px' }}>
                                                        <Stack direction="row" spacing={2}>
                                                            <Avatar 
                                                                alt="Ether" 
                                                                src={eth_icon} 
                                                                sx={{ width: 56, height: 56, border: '1px solid green'}} // Adjust the size as needed
                                                            />
                                                        </Stack>

                                                    </TableCell>
                                                    <TableCell component="th" scope="row" sx={{ fontSize: '13px', fontFamily: "FaunaRegular", color: "#693D8F" }}>
                                                        {profile.name}
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontSize: '13px', fontFamily: "FaunaRegular", color: "#695E93" }}>{1}</TableCell>
                                                    <TableCell align="right" sx={{ fontSize: '13px', fontFamily: "FaunaRegular", color: "#695E93" }}>{profile.managers}</TableCell>
                                                    <TableCell align="right" sx={{ fontSize: '13px', fontFamily: "FaunaRegular", color: "#695E93" }}>{profile.need} ETH</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );    
};


const loadingBarContainerStyle = {
    marginTop: "100px",
    width: '100%',  // Adjust as needed
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '20px 0' // Gives space around the progress bar
};

const contentStyle = {
    fontSize: '21px',
    marginTop: '100px',
    marginBottom: '20px',
    backgroundColor: '#FFFFFF',
    color: "#8155BA",
    borderRadius: "15px",
    width: "100%",
    paddingBottom: '15px',
    paddingTop: '10px',
};