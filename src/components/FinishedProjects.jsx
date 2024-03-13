import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import ManagerContractABI from '../contracts/abis/managerContractAbi.json';
import { ExploreFinishedProject } from "./ExploreFinishedProject";
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
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

const {managerContractAddress} = require('../contracts/contractsAddresses.json');


export const FinishedProjects = () => {
    const [profilesData, setProfilesData] = useState([]);
    const [selectedProfileId, setSelectedProfileId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openBackdrop, setOpenBackdrop] = React.useState(true);


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

                            if (strategyState == 2 || strategyState == 3){

                                const supply = await managerContract.methods.getProjectSupply(project).call();
                                const projectData = await managerContract.methods.getProfile(project).call();

                                activeProjects.push({ 
                                    id: project, 
                                    name: projectData.name, 
                                    description: supply.description, 
                                    state: strategyState
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

        initWeb3().finally(() => {setLoading(false); setOpenBackdrop(false)});
    }, []);

    const milestoneStatusLabel = (status) => {
        if (status === 2){
            return (
                <span style={{
                    color: '#4caf50',
                    border: '1px solid #4caf50', 
                    padding: '2px 4px', 
                    borderRadius: '4px', 
                    fontFamily: "FaunaRegular",
                }}>
                    Executed
                </span>
            );
        }
        else if (status === 3){
            return (
                <span style={{
                    color: '#C70039',
                    border: '1px solid #C70039',
                    padding: '2px 4px', 
                    borderRadius: '4px', 
                    fontFamily: "FaunaRegular",
                }}>
                    Rejected
                </span>
            );
        }
        else {
            return (
                <span style={{
                    color: 'orange',
                    border: '1px solid orange', 
                    padding: '2px 4px', 
                    borderRadius: '4px', 
                    fontFamily: "FaunaRegular",
                }}>
                    unknow
                </span>
            );
        }
    };

    return (
        <div>
            {selectedProfileId && (
                <ExploreFinishedProject
                    profileId={selectedProfileId}
                    setActiveProject={setSelectedProfileId} 
                />
            )}

            {!selectedProfileId && (
                <div>
                    {loading ? (
                         <Backdrop
                            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                            open={openBackdrop}
                        >
                            <CircularProgress color="inherit" />
                        </Backdrop>
                    ) : (
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
                                    Showcase projects
                                </Typography>
                                <TableContainer component={Paper} sx={{ borderRadius: '25px', overflow: 'hidden' }}>
                                    <Table sx={{ minWidth: 650, borderRadius: "25px", }} aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#695E93" }}>Token</TableCell>

                                                <TableCell sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#695E93" }}>Name</TableCell>
                                                <TableCell align="right" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#695E93" }}></TableCell>
                                                <TableCell align="right" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#695E93" }}></TableCell>
                                                <TableCell align="right" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#695E93" }}></TableCell>
                                                <TableCell align="right" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#695E93" }}>State</TableCell>
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
                                                    <TableCell align="right" sx={{ fontSize: '13px', fontFamily: "FaunaRegular" }}>{profile.calories}</TableCell>
                                                    <TableCell align="right" sx={{ fontSize: '13px', fontFamily: "FaunaRegular" }}>{profile.fat}</TableCell>
                                                    <TableCell align="right" sx={{ fontSize: '13px', fontFamily: "FaunaRegular" }}></TableCell>
                                                    <TableCell align="right" sx={{ fontSize: '13px', fontFamily: "FaunaRegular" }}>{milestoneStatusLabel(profile.state)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </div>
                        </div>
                    )}
                </div>
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
