
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import ManagerContractABI from '../contracts/abis/managerContractAbi.json';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

const {managerContractAddress} = require('../contracts/contractsAddresses.json')


export const Modal = ({ setShowModal }) => {

    // const isMobile = (window.innerWidth <= 768);
    const [needsFunds, setNeedsFunds] = useState('');
    const [projectId, setProjectId] = useState('');
    const [name, setName] = useState('');
    const [pointer, setPointer] = useState('');
    const [recipientAddress, setRecipientAddress] = useState('');
    const [web3, setWeb3] = useState(null);
    const [accounts, setAccounts] = useState(null);
    const [txHash, settxHash] = useState(null);
    const [profileId, sepPofileId] = useState(null);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        const initWeb3 = async () => {
            if (window.ethereum) {
                const web3Instance = new Web3(window.ethereum);
                setWeb3(web3Instance);
                const fetchedAccounts = await web3Instance.eth.getAccounts();
                setAccounts(fetchedAccounts);
            } else {
                console.log("Please install MetaMask!");
            }
        };

        initWeb3();
    }, []);

    const connectWallet = async () => {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const web3Instance = new Web3(window.ethereum);
            setWeb3(web3Instance);
            const fetchedAccounts = await web3Instance.eth.getAccounts();
            setAccounts(fetchedAccounts);
        } catch (error) {
            console.error("Error connecting to MetaMask:", error);
        }
    };

    const closeModal = (e) => {
        if (e.target.classList.contains('modal') && e.target.classList.contains('modal-open')) {
            setShowModal(false);
        }
    };

    const handleOk = () => {
        // Perform any action here, e.g., close the modal
        setShowModal(false);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!isFormValid()) {
            alert("Please fill in all the fields.");
            return;
        }

        if (!web3 || !accounts || accounts.length === 0) {
            alert("Please connect to MetaMask.");
            return;
        }

        setLoading(true);

        try {

            const web3Instance = new Web3(window.ethereum);
            const managerContract = new web3.eth.Contract(ManagerContractABI, managerContractAddress);         
            const nonce = await web3.eth.getTransactionCount(accounts[0], 'latest');

            const tx = {
                from: accounts[0],
                to: managerContractAddress,
                nonce: web3.utils.toHex(nonce), // Set the nonce
                data: managerContract.methods.registerProject(
                    web3.utils.toWei(needsFunds, 'ether'),
                    parseInt(projectId),
                    name,
                    [1, pointer],
                    recipientAddress
                ).encodeABI()
            };

            const estimatedGas = await web3Instance.eth.estimateGas(tx);
            const gasLimit = Math.floor(Number(estimatedGas) * 1.1);
            tx.gas = gasLimit;

            // // Send the transaction
            const sentTx = await web3.eth.sendTransaction(tx);
            const txReceipt = await web3.eth.getTransactionReceipt(sentTx.transactionHash);

            console.log("========> txReceipt <===========")
            console.log(txReceipt)


            const eventName = "ProjectRegistered"; // Ensure this matches the actual event name in your contract
            const fromBlock = Number(txReceipt.blockNumber) - 1; // Start searching from the block before the transaction
            const toBlock = Number(txReceipt.blockNumber); // End searching at the block of the transaction to narrow down our search
           
            const fetchPastEvents = async (contract, eventName, fromBlock, toBlock) => {
                try {
                    const events = await contract.getPastEvents(eventName, {
                        fromBlock: fromBlock,
                        toBlock: toBlock
                    });
                
                    events.forEach(event => {
                        // console.log(`Event caught: Project ID: ${event.returnValues.profileId}, Project Number Nonce: ${event.returnValues.nonce}`);
                        // console.log(event)
                        if (parseInt(projectId) == Number(event.returnValues.nonce))
                            sepPofileId(event.returnValues.profileId);
                    });

                } catch (error) {
                    console.error("Error fetching events:", error);
                }
            };

            await fetchPastEvents(managerContract, eventName, fromBlock, toBlock);

            settxHash(txReceipt.transactionHash);
            // console.log("=====> txHash:", txReceipt.transactionHash)
            // console.log("=====> profileId:", profileId)

        } catch (error) {
            console.error("Error in transaction:", error);
            alert("Error in transaction. See console for details.");
        }

        setLoading(false);
    };

    const isFormValid = () => {
        return needsFunds && projectId && name && pointer && recipientAddress;
    };

    const h2Style = {
        fontSize: '27px', 
        padding: "10px",
        color: "#8155BA",
    };

    const inputStyle = {
        width: '100%', 
        padding: '8px', 
        // margin: '10px 0', 
        borderRadius: '25px', 
        border: '1px solid #ccc', 
        boxSizing: 'border-box',
        textAlign: 'center', // Add this line to center-align the text
        color: "#8155BA",
    };

    const buttonContentStyle = (isFormValid) => ({
        fontSize: '21px',
        marginTop: '21px',  
        marginBottom: '21px',
        backgroundColor: isFormValid ? '#8155BA' : '#CCCCCC', // Change color when form is invalid
        color: "#FFFFFF",
        border: '1px solid black',
        borderRadius: "15px",
        cursor: isFormValid ? 'pointer' : 'not-allowed', // Change cursor when form is invalid
        minWidth: '350px',
        paddingTop: '10px', 
        paddingBottom: '10px',
        opacity: isFormValid ? 1 : 0.5, // Change opacity when form is invalid
        fontFamily: "FaunaRegular"
    });

    return (
        <div className='modal-overlay' onClick={closeModal}>
        <div className='modal modal-open'>
            <div className='modal-content'>
                <span className='close' onClick={() => setShowModal(false)}>&times;</span>
                <h2 style={h2Style}>New project details</h2>

                {loading ? (
                        <div style={loadingBarContainerStyle}>
                            <div className="loader"></div>
                        </div>
                    ) : (
                    <>
                        {txHash && profileId ? (
                        // Display the transaction hash and profile ID if available
                        <div>
                            <h2> ✅Project Registered</h2>
                            <p>Transaction Hash: {txHash}</p>
                            <p>Profile ID: {profileId}</p>
                            <button onClick={handleOk} className="regular-button">OK</button>
                        </div>
                    ) : (

                        <form onSubmit={handleSubmit}>
                            <div>

                                <TableContainer 
                                    component={Paper} 
                                    sx={{ 
                                        // borderRadius: '25px', 
                                        overflow: 'hidden',
                                        borderTopLeftRadius: 15,
                                        borderTopRightRadius: 15,
                                        borderBottomLeftRadius: 3,
                                        borderBottomRightRadius: 3,
                                        marginTop: '20px'
                                    }}
                                >
                                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="left" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", }}>Needs ETH</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "FaunaRegular" }}>
                                                 <input type="text" name="needsFunds" style={inputStyle} onChange={(e) => setNeedsFunds(e.target.value)}/>
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </div>
                            <div>

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
                                                <TableCell align="left" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", }}>Project Number ID</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "FaunaRegular" }}>
                                                    <input type="text" name="projectId" style={inputStyle} onChange={(e) => setProjectId(e.target.value)}/>
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </div>
                            <div>
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
                                                <TableCell align="left" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", }}>Project Name</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "FaunaRegular" }}>
                                                    <input type="text" name="name" style={inputStyle} onChange={(e) => setName(e.target.value)}/>
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </div>
                            <div>
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
                                                <TableCell align="left" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", }}>Project Description Pointer</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "FaunaRegular" }}>
                                                    <input type="text" name="pointer" style={inputStyle} onChange={(e) => setPointer(e.target.value)}/>
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </div>
                            <div>
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
                                                <TableCell align="left" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", }}>Recipient Address</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "FaunaRegular" }}>
                                                    <input type="text" name="recipientAddress" style={inputStyle} onChange={(e) => setRecipientAddress(e.target.value)}/>
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </div>
                            <div>
                                {accounts && accounts.length > 0 ? (
                                    <button type="submit" style={buttonContentStyle(isFormValid())} disabled={!isFormValid()}>
                                        Register
                                    </button>
                                ) : (
                                    <button onClick={connectWallet} style={buttonContentStyle(false)}>
                                        Connect Wallet
                                    </button>
                                )}
                            </div>
                        </form>
                    )}
                    </>
                )}
            </div>
        </div>
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