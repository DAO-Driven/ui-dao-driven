
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import ManagerContractABI from '../contracts/abis/managerContractAbi.json';
import CircularProgress, {
    CircularProgressProps,
  } from '@mui/material/CircularProgress';
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
import InputBase from '@mui/material/InputBase';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';

const {managerContractAddress} = require('../contracts/contractsAddresses.json')

function CircularProgressWithLabel(props) {

    const { completed } = props.value;

    return (
        <Box sx={{ position: 'relative', display: 'inline-flex'}}>
            <CircularProgress
                variant="determinate"
                value={completed} // Use the completed value directly here
                size={150} // Adjust the size as needed
                thickness={4} // Adjust the stroke thickness as needed
                sx={{ 
                    position: 'relative', 
                    display: 'inline-flex', 
                    color:"#BEAFC2"
                }}
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
                        fontSize: '4rem', // Adjust the font size as needed
                        color:"#BEAFC2"
                    }}
                >{`${Math.round(completed)}%`}</Typography>
            </Box>
        </Box>
    );
}


export const ExploreAwaitinProjectModal = ({ setShowModal, profileId }) => {

    // const isMobile = (window.innerWidth <= 768);
    const [projecData, setprojecData] = useState(null);
    const [projectInfo, setprojectInfo] = useState(null);
    const [projctProgress, setProjctProgress] = useState(null);
    const [amountToSend, setAmountToSend] = useState(0);
    const [web3, setWeb3] = useState(null);
    const [accounts, setAccounts] = useState(null);
    const [fundedAmount, setFundetAmount] = useState(null);
    const [isSupplier, setisSupplier] = useState(null);
    const [loading, setLoading] = useState(false);
    const [revoked, setRevoked] = useState(false);
    const [projecExecutor, setpPojecExecutor] = useState(null);
    const [projectSuppliers, setProjectSuppliers] = useState([]);

    const handleOk = () => {
        setShowModal(false);
    };

    const handleRevokeSupply = async () => {
        setLoading(true);

        const managerContract = new web3.eth.Contract(ManagerContractABI, managerContractAddress);
    
        try {
            const txReceipt = await managerContract.methods.revokeProjectSupply(profileId).send({ from: accounts[0] });
            console.log("Transaction Receipt:", txReceipt);

            setRevoked(true);
    
        } catch (error) {
            console.error("Error revoking supply:", error);
            alert("Error in revoking supply. See console for details.");
        }

        setLoading(false);
    };
    

    const handleSendFunds = async () => {
        setLoading(true);
    
        if (amountToSend > 0) {
            const web3Instance = new Web3(window.ethereum); // Ensure web3Instance is initialized correctly
            const managerContract = new web3Instance.eth.Contract(ManagerContractABI, managerContractAddress);
            const amountInWei = web3Instance.utils.toWei(amountToSend.toString(), 'ether');
            
            try {
                const nonce = await web3Instance.eth.getTransactionCount(accounts[0], 'latest');
    
                // Prepare the transaction object for sending funds
                const tx = {
                    from: accounts[0],
                    to: managerContractAddress, // Assuming you're sending ETH to the manager contract directly
                    nonce: web3Instance.utils.toHex(nonce),
                    value: amountInWei, // Value in Wei to send
                    data: managerContract.methods.supplyProject(profileId, amountInWei).encodeABI() // Encoded ABI of the function call
                };
    
                // Estimate gas for the transaction
                const estimatedGas = await web3Instance.eth.estimateGas(tx);
                const gasLimit = Math.floor(Number(estimatedGas) * 1.1);
                tx.gas = gasLimit;
    
                // Send the transaction
                const sentTx = await web3Instance.eth.sendTransaction(tx);
                const txReceipt = await web3Instance.eth.getTransactionReceipt(sentTx.transactionHash);
    
                console.log("========> txReceipt <===========");
                console.log(txReceipt);
    
                // Post-transaction logic (assuming it's still relevant)
                const supply = await managerContract.methods.getProjectSupply(profileId).call();
                setprojecData(supply);
                const progress = calculateProgress(supply, web3Instance); // Ensure calculateProgress works with web3Instance
                setProjctProgress(progress);
                setFundetAmount(amountToSend);
                setprojecData(supply);
    
                const projectSuppliers = await managerContract.methods.getProjectSuppliers(profileId).call();
                setProjectSuppliers(projectSuppliers);
    
            } catch (error) {
                console.error("Error sending funds:", error);
                alert("Error in sending funds. See console for details.");
            }
        }
    
        setAmountToSend(0);
        setLoading(false);
    };
    

    function calculateProgress(projectData, web3Instance) {
        const need = projectData.need;
        const has = projectData.has;
    
        if (need === '0') {
            return { completed: 0, ethReceived: "0.00", totalNeeded: "0.00" };
        }
    
        const completed = (Number(has) / Number(need)) * 100;
        const ethReceived = web3Instance.utils.fromWei(has, 'ether');
        const totalNeeded = web3Instance.utils.fromWei(need, 'ether');
    
        return { completed, ethReceived, totalNeeded };
    }
    
    useEffect(() => {
        const initWeb3 = async () => {
            if (window.ethereum) {
                const web3Instance = new Web3(window.ethereum);
                setWeb3(web3Instance);

                const fetchedAccounts = await web3Instance.eth.getAccounts();
                setAccounts(fetchedAccounts);

                const managerContract = new web3Instance.eth.Contract(ManagerContractABI, managerContractAddress);

                const supply = await managerContract.methods.getProjectSupply(profileId).call();
                // console.log("====== PROJECT SUPPLY")
                // console.log(supply)
                setprojecData(supply);

                const projectData = await managerContract.methods.getProfile(profileId).call();
                // console.log("====== PROJECT DATA")
                // console.log(projectData)
                setprojectInfo(projectData);

                const progress = calculateProgress(supply, web3Instance);
                setProjctProgress(progress);

                const projectSuppliers = await managerContract.methods.getProjectSuppliers(profileId).call();
                console.log("===== Project Suppliers")
                console.log(projectSuppliers)
                setProjectSuppliers(projectSuppliers)


                const isSupplier = projectSuppliers.find(supplier=> supplier == fetchedAccounts[0]);
                console.log("===== IS Supplier:", isSupplier);

                setisSupplier(isSupplier)

                const projectExecutor = await managerContract.methods.getProjectExecutor(profileId).call();
                // console.log("===== Project Executor")
                // console.log(projectExecutor)
                setpPojecExecutor(projectExecutor);

            } else {
                console.log("Please install MetaMask!");
            }
        };

        initWeb3();
    }, [revoked]);

    const connectWallet = async () => {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
        } catch (error) {
            console.error("Error connecting to MetaMask:", error);
        }
    };

    const closeModal = (e) => {
        if (e.target.classList.contains('modal') && e.target.classList.contains('modal-open')) {
        setShowModal(false);
        }
    };

    return (
        <div className='modal-overlay' onClick={closeModal}>
            <div className='modal modal-open'>
                <div className='modal-content'>
                    <span className='close' onClick={() => setShowModal(false)}>&times;</span>
                    <h2 style={h2Style}>Project</h2>
    
                    {loading ? (
                        <div style={loadingBarContainerStyle}>
                            <div className="loader"></div>
                        </div>
                    ) : (projecData && projectInfo) ? (
                        <>
                            <h3 style={h3Style}>{projectInfo.name}</h3>

                            {fundedAmount && !revoked ? (
                                projctProgress.ethReceived >= projctProgress.totalNeeded ? (
                                    <div style={progressBarContainerStyle}>
                                        <p style={fundingStyle}>Your contribution was pivotal 🎉🎉🎉</p>
                                        <p style={fundingStyle}>Thanks to your funding, the project has successfully launched!💫</p>
                                        <p style={fundingInfoPStyle}>The project has transitioned to the active phase and can now be found in the 'Active Projects' section. Stay tuned for updates on milestones and ongoing developments. Your input is vital in shaping the project's trajectory.</p>
                                    </div>
                                ) : (
                                    <div style={progressBarContainerStyle}>
                                        <p style={fundingStyle}>Your support propels us forward 🚀</p>
                                        <p style={fundingStyle}>Immense gratitude for being a part of this journey and believing in our project's vision! 🙏🙌</p>
                                        <p style={fundingInfoPStyle}>Stay tuned for the funding milestones! Upon reaching our funding target, you'll be elevated to a distinguished role on the project committee. As a holder of the esteemed 'Supplier Hat', you'll wield the power to shape the project's future by approving or vetoing its forthcoming phases.</p>
                                        {/* <div>
                                            <button className="regular-button" onClick={handleOk}>
                                                OK
                                            </button>
                                        </div> */}
                                    </div>
                                )
                            ) : (
                                <>
                                   
                    
                                </>
                
                            )}

                            {revoked && (
                                <div style={progressBarContainerStyle}>
                                    <p style={fundingStyle}>The supply has been successfully revoked, and the funds have been returned to you</p>
                                    <div>
                                        <button className="regular-button" onClick={handleOk}>
                                            OK
                                        </button>
                                    </div>
                                </div>
                            )}

                            <TableContainer 
                                component={Paper} 
                                sx={{ 
                                    borderTopLeftRadius: 25,
                                    borderTopRightRadius: 25,
                                    borderBottomLeftRadius: 3,
                                    borderBottomRightRadius: 3, 
                                    overflow: 'hidden', 
                                    mb: 2 }}
                            >
                                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#BEAFC2" }}>Funding Progress</TableCell>
                                            <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#BEAFC2"}}>Become a manager</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "FaunaRegular" }}>
                                                <CircularProgressWithLabel value={calculateProgress(projecData, web3)} />
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontSize: '13px', fontFamily: "FaunaRegular" }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: 0 }}>
                                                <Paper
                                                    component="form"
                                                    sx={{ 
                                                        p: '2px', 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        width: 250,
                                                        borderTopLeftRadius: 15,
                                                        borderTopRightRadius: 15,
                                                        borderBottomLeftRadius: 3,
                                                        borderBottomRightRadius: 3, 
                                                    }}
                                                    >
                                                    <InputBase
                                                        sx={{ ml: 1, flex: 1, height: '50px', fontSize: '17px'}}
                                                        placeholder="0.0"
                                                        inputProps={{ 'aria-label': 'amount to send' }}
                                                        onChange={(e) => setAmountToSend(e.target.value)}
                                                    />
                                                    <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                                                    <Stack direction="row" spacing={2}>
                                                        <Avatar 
                                                            alt="Ether" 
                                                            src={eth_icon} 
                                                            sx={{ width: 30, height: 30, border: '1px solid green'}} // Adjust the size as needed
                                                        />
                                                    </Stack>
                                                </Paper>
                                                <Button
                                                    variant="contained"
                                                    sx={{ 
                                                        mt: 1, 
                                                        width: 250, 
                                                        height: '50px', 
                                                        backgroundColor: "#BEAFC2", 
                                                        '&:hover': { 
                                                            backgroundColor: "#BEAFC2"
                                                        }, 
                                                        fontFamily: "FaunaRegular",
                                                        borderTopLeftRadius: 3,
                                                        borderTopRightRadius: 3,
                                                        borderBottomLeftRadius: 15,
                                                        borderBottomRightRadius: 15,
                                                        fontSize: '13px'
                                                    }}
                                                    disabled={!Number(amountToSend) || calculateProgress(projecData, web3).completed == 100}
                                                    onClick={() => { handleSendFunds()}}
                                                >
                                                    Send Funds
                                                </Button>
                                            </Box>

                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <TableContainer component={Paper} sx={{ borderRadius: '5px', overflow: 'hidden', mb: 2 }}>
                                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#BEAFC2"}}>Funds Raised</TableCell>
                                            <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#BEAFC2"}}>Required Funding</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "FaunaRegular", color: "#695E93" }}>
                                                {web3.utils.fromWei(projecData.has, 'ether')} ETH
                                            </TableCell>
                                            <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "FaunaRegular", color: "#695E93" }}>
                                                {web3.utils.fromWei(projecData.need, 'ether')} ETH
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <TableContainer component={Paper} sx={{ borderRadius: '5px', overflow: 'hidden', mb: 2 }}>
                                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="left" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#BEAFC2"}}>Recipients:</TableCell>
                                            {/* <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "FaunaRegular", }}>Required Funding</TableCell> */}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "FaunaRegular", color: "#695E93" }}>
                                                {projecExecutor}
                                            </TableCell>
                                            {/* <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "FaunaRegular" }}>
                                                {web3.utils.fromWei(projecData.need, 'ether')} ETH
                                            </TableCell> */}
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <TableContainer 
                                component={Paper} 
                                sx={{ 
                                    // borderRadius: '25px', 
                                    overflow: 'hidden',
                                    borderTopLeftRadius: 3,
                                    borderTopRightRadius: 3,
                                    borderBottomLeftRadius: 3,
                                    borderBottomRightRadius: 3,
                                    // marginBottom: '50px',
                                }}
                            >
                                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="left" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#BEAFC2"}}>Managers:</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {projectSuppliers.map((manager) => (
                                            <TableRow>
                                                <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "FaunaRegular", color: "#695E93" }}>{manager}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <TableContainer 
                                component={Paper} 
                                sx={{ 
                                    // borderRadius: '25px', 
                                    overflow: 'hidden',
                                    borderTopLeftRadius: 3,
                                    borderTopRightRadius: 3,
                                    borderBottomLeftRadius: 3,
                                    borderBottomRightRadius: 3,
                                    marginTop: '20px'
                                }}
                            >
                                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="left" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#BEAFC2"}}>Project description:</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "FaunaRegular" }}>
                                                <a
                                                    href={projectInfo.metadata.pointer}
                                                    target="_blank" // This ensures the link opens in a new tab
                                                    rel="noopener noreferrer" // Security measure for links that open a new tab
                                                    
                                                    >
                                                    {projectInfo.metadata.pointer}
                                                </a>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>


                            <TableContainer 
                                component={Paper} 
                                sx={{ 
                                    // borderRadius: '25px', 
                                    overflow: 'hidden',
                                    borderTopLeftRadius: 3,
                                    borderTopRightRadius: 3,
                                    borderBottomLeftRadius: 15,
                                    borderBottomRightRadius: 15,
                                    marginTop: '20px'
                                }}
                            >
                                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="left" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#BEAFC2"}}>Allo-V2 Registry Profile ID:</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "FaunaRegular", color: "#695E93"}}>{profileId}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {(isSupplier && !revoked && calculateProgress(projecData, web3).completed != 100) && (

                                <div style={divStyle}>
                                    <button className="reject-button" onClick={handleRevokeSupply}>
                                        Revoke Supply
                                    </button>
                                </div>
                            )}
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
    
};

const divStyle = {
    marginTop: '20px', // Adjust the value as needed
};

const h2Style = {
    fontSize: '13px', 
    padding: "10px",
    color: "#BEAFC2",
    fontFamily: "RaxtorRegular",
};

const fundingStyle = {
    fontSize: '17px',
    color: "#695E93",
    marginBottom: '0px',
    fontFamily: "RaxtorRegular",
    marginRight: '25px',
};

const fundingInfoPStyle = {
    fontSize: '13px',
    color: "#695E93",
    marginBottom: '20px',
    fontFamily: "RaxtorRegular",
    marginTop: '25px',
};

const h3Style = { 
    fontSize: '27px', 
    fontWeight: 'bold',
    color: "695E93",
    fontFamily: "FaunaRegular"
};

const progressBarContainerStyle = {
    width: '100%',  // Adjust as needed
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '20px 0' // Gives space around the progress bar
};

const loadingBarContainerStyle = {
    marginTop: "100px",
    width: '100%',  // Adjust as needed
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '20px 0' // Gives space around the progress bar
};