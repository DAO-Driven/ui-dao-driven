import React, { useState, useEffect } from 'react';
import { Modal } from './modalNewProject';
import { ExploreAwaitinProjectModal } from "./ExploreAwaitingProject";
import Web3 from 'web3';
import ManagerContractABI from '../contracts/abis/managerContractAbi.json';
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

const {managerContractAddress} = require('../contracts/contractsAddresses.json')

function CircularProgressWithLabel(props) {
    return (
      <Box sx={{ position: 'relative', display: 'inline-flex',
    }}>
        <CircularProgress 
          variant="determinate" 
          {...props} 
          size={50}
          thickness={4}
          sx={{ position: 'relative', display: 'inline-flex', color:"#695E93"}}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="caption"
            component="div"
            color="text.secondary"
            sx={{
              fontSize: '1.25rem', // Adjust the font size as needed
              fontFamily: "FaunaRegular",
            }}
          >{`${Math.round(props.value)}%`}</Typography>
        </Box>
      </Box>
    );
} 

function calculateProgress(projectData) {
    const need = projectData.need;
    const has = projectData.has;

    if (!Number(need)) {
        return { completed: 0};
    }

    const completed = (Number(has) / Number(need)) * 100;
    return completed;
}


export const NewProjectTable = () => {

    const [showModal, setShowModal] = useState(false);
    const [showExploreAwaitinProjectModal, setExploreAwaitinProjectModal] = useState(false);
    const [profilesData, setProfilesData] = useState([]);
    const [selectedProfileId, setSelectedProfileId] = useState(null);
    const [isRecipient, setIsRecipient] = useState(null);
    const [isManager, setIsManager] = useState(null);
    const [loading, setLoading] = useState(false);

    const openModal = () => {
        setShowModal(current => !current);
    };

    const openExploreAwaitinProjectModal = (profileId) => {
        setSelectedProfileId(profileId);
        setExploreAwaitinProjectModal(current => !current);
    };

    const isRecipientLabel = () => {

        if (isRecipient){
            return (
                <span style={{
                    color: '#BEAFC2',
                    border: '1px solid #BEAFC2', 
                    padding: '2px 4px', 
                    borderRadius: '4px', 
                    fontFamily: "RaxtorRegular",
                    marginRight: "10px",
                    fontSize: "11px"
                }}>
                    you
                </span>
            );
        }
        else    
            return "";
    };

    const isManagerLabel = () => {

        if (isManager){
            return (
                <span style={{
                    color: '#BEAFC2',
                    border: '1px solid #BEAFC2', 
                    padding: '2px 4px', 
                    borderRadius: '4px', 
                    fontFamily: "RaxtorRegular",
                    marginRight: "10px",
                    fontSize: "7px"
                }}>
                    you
                </span>
            );
        }
        else    
            return "";
    };


    useEffect(() => {

        setLoading(true);

        const initWeb3 = async () => {
            if (window.ethereum) {

                const web3Instance = new Web3(window.ethereum);
                const managerContract = new web3Instance.eth.Contract(ManagerContractABI, managerContractAddress);

                try {

                    const fetchedAccounts = await web3Instance.eth.getAccounts();
                    const address = fetchedAccounts[0];
                    const profileIds = await managerContract.methods.getProfiles().call();
                    console.log("===== Profiles ")
                    console.log(profileIds)

                    const awaitingProfiles = [];

                    await Promise.all(profileIds.map(async (id) => {

                        const supply = await managerContract.methods.getProjectSupply(id).call();
                        // console.log("=====> Project Supply")
                        // console.log(supply)

                        const projectSuppliers = await managerContract.methods.getProjectSuppliers(id).call();
                        // console.log("===== Project Suppliers")
                        // console.log(projectSuppliers)
    

                        const projectHasPool = await managerContract.methods.getProjectPool(id).call();

                        const projectData = await managerContract.methods.getProfile(id).call();

                        if (!Number(projectHasPool)){

                            const projectExecutor = await managerContract.methods.getProjectExecutor(id).call();

                            if (projectSuppliers.length && projectSuppliers.find(address=> address == address)) {
                                console.log("========== MANAGER DETECTED:", address, "SUPPL:", projectSuppliers.length)
                                setIsManager(true);
                            }
                            if (address === projectExecutor) {
                                // console.log("========== RECIPIENT DETECTED:", address)
                                setIsRecipient(true);
                            }

                            awaitingProfiles.push({ 
                                id: id, 
                                name: projectData.name, 
                                description: supply.description, 
                                need: web3Instance.utils.fromWei(supply.need, 'ether'),
                                has: web3Instance.utils.fromWei(supply.has, 'ether'),
                                managers: projectSuppliers,
                            })
                        }
                    }));

                    setProfilesData(awaitingProfiles);

                } catch (error) {
                    console.error("Error fetching profiles:");
                    console.log(error)
                }
            } else {
                console.log("Please install MetaMask!");
            }
        };
    
        initWeb3().finally(() => setLoading(false));
    }, [showExploreAwaitinProjectModal, showModal]);

    return (
        <>
            <div>
                <Box sx={{ flexGrow: 1 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item>
                            <Button 
                            variant="contained" 
                            onClick={openModal}
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
                                marginTop: '50px',
                            }}
                            >
                            Register New Project
                            </Button>
                        </Grid>
                    </Grid>
                </Box>

                {loading ? (
                    <div style={loadingBarContainerStyle}>
                        <div className="loader"></div>
                    </div>
                ) : (
                    <div className='row'>
                        <div className='col-md-12' style={contentStyle}>
                        <Typography variant="h6" component="div" sx={{ 
                                flexGrow: 1, 
                                fontSize: '17px', // Make text larger
                                paddingBottom: 2, 
                                // fontWeight: 'bold',
                                fontFamily: "FaunaRegular",
                                color: "#695E93"
                            }}
                        >
                            Projects that are awaiting investors
                        </Typography>
                            <TableContainer component={Paper} sx={{ borderRadius: '25px', overflow: 'hidden' }}>
                                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#695E93" }}>Token</TableCell>

                                            <TableCell sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#695E93"}}>Name</TableCell>
                                            <TableCell align="right" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#695E93"}}>Executors</TableCell>
                                            <TableCell align="right" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#695E93"}}>Managers</TableCell>
                                            <TableCell align="right" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#695E93"}}>Required Funding</TableCell>
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
                                                onClick={() => openExploreAwaitinProjectModal(profile.id)}
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
                                                <TableCell align="right" sx={{ fontSize: '13px', fontFamily: "FaunaRegular", color: "#695E93" }}>
                                                    { isRecipientLabel()}{1}
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontSize: '13px', fontFamily: "FaunaRegular", color: "#695E93" }}>
                                                    {isManagerLabel()}{profile.managers.length}
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontSize: '13px', fontFamily: "FaunaRegular", color: "#695E93" }}>{profile.need} ETH</TableCell>
                                                <TableCell align="right" sx={{ fontFamily: "FaunaRegular" }}>
                                                    {/* {profile.has} ETH */}
                                                    <CircularProgressWithLabel value={calculateProgress(profile)} />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </div>
                    </div>
                )}

                {showModal && (
                    <Modal setShowModal={setShowModal} />
                )}
                {showExploreAwaitinProjectModal && (
                    <ExploreAwaitinProjectModal 
                        setShowModal={setExploreAwaitinProjectModal} 
                        profileId={selectedProfileId} 
                    />
                )}
            </div>
        </>
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
    marginTop: '25px',
    marginBottom: '20px',
    backgroundColor: '#FFFFFF',
    color: "#8155BA",
    borderRadius: "15px",
    width: "100%",
    paddingBottom: '15px',
};
