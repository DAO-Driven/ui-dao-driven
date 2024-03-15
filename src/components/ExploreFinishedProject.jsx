import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import ManagerContractABI from '../contracts/abis/managerContractAbi.json';
import ExecutorSupplierVotingStrategyABI from '../contracts/abis/ExecutorSupplierVotingStrategyAbi.json';
import {MilestonesProgressBar} from "./MilesonesProgressBar";
import { ProgressBarVotes } from "./milestonesPhases/ProgressBarVotes"
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import eth_icon from "../data/photos/github/ether.jpeg"
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import Divider from '@mui/material/Divider';


const {managerContractAddress} = require('../contracts/contractsAddresses.json');


export const ExploreFinishedProject = ({ profileId, setActiveProject }) => {
    const [projectData, setProjectData] = useState(null);
    const [offeredMilestones, setOfferedMilestones] = useState([]);
    const [projectMilestones, setProjectMilestones] = useState([]);
    const [offeredMilestonesVotes, setOfferedMilestonesVotes] = useState(null);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [milestonesWithStatus, setMilestonesWithStatus] = useState([]);
    const [strategyState, setStrategyStatus] = useState("");
    const [projectRejectVotesFor, setProjectRejectVotesFor] = useState(0);
    const [projectRejectVotesAgainst, setProjectRejectVotesAgainst] = useState(0);
    const [amountToSend, setAmountToSend] = useState(0);
    const [loading, setLoading] = useState(false);
    const [fundsSent, setFundsSent] = useState(false);
    const [totalSupply, setTotalSupply] = useState(null);
    const [openBackdrop, setOpenBackdrop] = React.useState(true);
    const [projectInfo, setprojectInfo] = useState(null);
    const [projecExecutor, setpPojecExecutor] = useState(null);
    const [poolID, setPoolID] = useState(0);
    const [accounts, setAccounts] = useState(null);
    const [projectSuppliers, setProjectSuppliers] = useState([]);


    const handleSendFunds = async () => {

        setLoading(true);

        if (amountToSend > 0){

            const web3Instance = new Web3(window.ethereum);
            const managerContract = new web3Instance.eth.Contract(ManagerContractABI, managerContractAddress);
            
            try {

                const fetchedAccounts = await web3Instance.eth.getAccounts();
                const strategyAddress = await managerContract.methods.getProjectStrategy(profileId).call();
                const ExecutorSupplierVotingStrategy = new web3Instance.eth.Contract(ExecutorSupplierVotingStrategyABI, strategyAddress);
                // console.log("====> Sending amount:", )
                
                const amountInWei = web3Instance.utils.toWei(amountToSend, 'ether');

                // Send the transaction
                const txReceipt = await ExecutorSupplierVotingStrategy.methods.sendTokenOfThanksToSuppliers(amountInWei).send({ 
                    from: fetchedAccounts[0], 
                    value: amountInWei 
                });

                // Send the transaction
                console.log("========> txReceipt <===========");
                console.log(txReceipt);

                setFundsSent(true);

            } catch (error) {
                console.error("Error sending funds:", error);
                alert("Error in sending funds. See console for details.");
            }
        }

        setLoading(false);
    }
    const handleBackButtonClick = () => {
        setActiveProject(false);
    };

    const calculatePhaseOneMilestones = () => {
        if (offeredMilestones.length && projectMilestones.length)
            return {progress: 100, info: "Confirmed"};
        else if (offeredMilestones.length)
            return {progress: 50, info: "Awaiting Review"};
        else    
            return {progress: 0, info: "Awaiting Offer"}; 
    }

    const calculateVotesPercentage = (totalValue, partialValue) => {
        if (totalValue == 0)
            return 0;

        return (partialValue / totalValue) * 100;
    }

    const milestoneStatusLabel = (status) => {
        if (status === 1) {
            return (
                <span style={{
                    color: 'orange',
                    border: '1px solid orange', // Add a black border
                    padding: '2px 4px', // Add some padding inside the border
                    borderRadius: '4px', // Optional: to make the corners rounded
                }}>
                    Pending
                </span>
            );
        }
        else if (status === 2){
            return (
                <span style={{
                    color: '#4caf50',
                    border: '1px solid #4caf50', // Add a black border
                    padding: '2px 4px', // Add some padding inside the border
                    borderRadius: '4px', // Optional: to make the corners rounded
                }}>
                    Executed
                </span>
            );
        }
        else if (status === 3){
            return (
                <span style={{
                    color: '#C70039',
                    border: '1px solid #C70039', // Add a black border
                    padding: '2px 4px', // Add some padding inside the border
                    borderRadius: '4px', // Optional: to make the corners rounded
                }}>
                    Revoked
                </span>
            );
        }
        else if (status === 3){
            return (
                <span style={{
                    color: '#C70039',
                    border: '1px solid #C70039', // Add a black border
                    padding: '2px 4px', // Add some padding inside the border
                    borderRadius: '4px', // Optional: to make the corners rounded
                }}>
                    unknow
                </span>
            );
        }

    };

    const milestoneNameColor = (status, name) => {
        if (status === 1) {
            return (
                <span style={{
                    color: 'orange',
                    padding: '2px 4px', // Add some padding inside the border
                }}>
                    {name}
                </span>
            );
        }
        else if (status === 2) {
            return (
                <span style={{
                    color: '#4caf50',
                    padding: '2px 4px', // Add some padding inside the border
                }}>
                    {name}
                </span>
            );
        }
        else if (status === 3) {
            return (
                <span style={{
                    color: '#C70039',
                    padding: '2px 4px', // Add some padding inside the border
                }}>
                    {name}
                </span>
            );
        }
    };

    const youLabel = () => {

        if (projecExecutor){
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
    
    useEffect(() => {
        const initWeb3 = async () => {
            if (window.ethereum) {
                const web3Instance = new Web3(window.ethereum);
                const fetchedAccounts = await web3Instance.eth.getAccounts();
                setAccounts(fetchedAccounts);

                const managerContract = new web3Instance.eth.Contract(ManagerContractABI, managerContractAddress);

                let votingStrategyAddress;

                try {

                    const strategyAddress = await managerContract.methods.getProjectStrategy(profileId).call();
                    votingStrategyAddress = strategyAddress;

                    const supply = await managerContract.methods.getProjectSupply(profileId).call();
                    setProjectData(supply);

                } catch (error) {
                    console.error("Error fetching project data:", error);
                }

                const ExecutorSupplierVotingStrategy = new web3Instance.eth.Contract(ExecutorSupplierVotingStrategyABI, votingStrategyAddress);

                try{

                    const rejectVotesAgainst = Number(await ExecutorSupplierVotingStrategy.methods.getRejectProjectVotesAgainst().call());
                    // console.log("---> rejectVotesAgainst:", rejectVotesAgainst)
                    setProjectRejectVotesAgainst(rejectVotesAgainst);

                    const rejectVotesFor = Number(await ExecutorSupplierVotingStrategy.methods.getRejectProjectVotesFor().call());
                    // console.log("---> rejectVotesFor:", rejectVotesFor)
                    setProjectRejectVotesFor(rejectVotesFor);

                    const projectExecutor = await managerContract.methods.getProjectExecutor(profileId).call();
                    // console.log("===== Project Executor")
                    // console.log(projectExecutor)
                    setpPojecExecutor(projectExecutor);

                    const offeeredMilestones = await ExecutorSupplierVotingStrategy.methods.getOffeeredMilestones(projectExecutor).call();
                    // console.log("=====> Offeered Milestones")
                    // console.log(offeeredMilestones)
                    setOfferedMilestones(offeeredMilestones);

                    const milestones = await ExecutorSupplierVotingStrategy.methods.getMilestones(projectExecutor).call();
                    // console.log("=====> Milestones")
                    // console.log(milestones)
                    setProjectMilestones(milestones)

                    const strategyState = Number(await ExecutorSupplierVotingStrategy.methods.state().call());
                    // console.log("=====> strategyState")
                    // console.log(strategyState)
                    setStrategyStatus(strategyState)

                    const strategyTotalSupply = Number(await ExecutorSupplierVotingStrategy.methods.totalSupply().call());
                    // console.log("=====> strategyTotalSupply")
                    // console.log(strategyTotalSupply)
                    setTotalSupply(strategyTotalSupply)

                    const projectData = await managerContract.methods.getProfile(profileId).call();
                    // console.log("====== PROJECT DATA")
                    // console.log(projectData)
                    setprojectInfo(projectData);

                    const projectHasPool = await managerContract.methods.getProjectPool(profileId).call();
                    setPoolID(Number(projectHasPool));

                    const projectSuppliers = await managerContract.methods.getProjectSuppliers(profileId).call();
                    // console.log("===== Project Suppliers")
                    // console.log(projectSuppliers)
                    setProjectSuppliers(projectSuppliers)

                    if (milestones.length){

                        const milestonesStatus = milestones.filter(milestn=> Number(milestn.milestoneStatus));

                        if (milestonesStatus.length){

                            const milestonesWithVotes = await Promise.all(milestonesStatus.map(async (milestone, index) => {
                                const votesFor = Number(await ExecutorSupplierVotingStrategy.methods.getSubmittedMilestonesVotesFor(index).call());
                                const votesAgainst = Number(await ExecutorSupplierVotingStrategy.methods.getSubmittedMilestonesVotesAgainst(index).call());
   
                                return {
                                    ...milestone,
                                    votesFor,  
                                    votesAgainst  
                                };
                            }));
                            
                            setMilestonesWithStatus(milestonesWithVotes);
                        }
                    }

                    if (offeeredMilestones){

                        const votesFor = Number(await ExecutorSupplierVotingStrategy.methods.getOfferedMilestonesVotesFor(projectExecutor).call());
                        const votesAgainst = Number(await ExecutorSupplierVotingStrategy.methods.getOfferedMilestonesVotesAgainst(projectExecutor).call());

                        if ((votesFor) || (votesAgainst))
                            setOfferedMilestonesVotes({votesFor: (votesFor), votesAgainst: (votesAgainst)});
                        }
                }
                catch (error) {
                    console.error("Error fetching Strategy data:", error);
                }

            } else {
                console.log("Please install MetaMask!");
            }

            setIsDataLoaded(true);
            setOpenBackdrop(false);
        };

        initWeb3();
    }, []);

    return (
        <div>
            <div className='row'>
                {(
                    <Backdrop
                        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                        open={openBackdrop}
                    >
                        <CircularProgress color="inherit" />
                    </Backdrop>
                )}
                {(projectData) && (
                    <div className='col-md-12' style={contentStyle}>
                        <div style={buttonContainerStyle}>
                            <button 
                                className="regular-button" 
                                onClick={handleBackButtonClick}
                            >
                                {"<<< Back to projects"}
                            </button>
                        </div>
                        <div>
                            <h3 style={h3Style}>{projectInfo ? projectInfo.name : 'loading..'}</h3>
                            <p style={pStyle}>{projectData.description}</p>
                            {/* <p style={pStyle}>Strategy state: {milestoneStatusLabel(strategyState)}</p> */}

                            <TableContainer 
                                component={Paper} 
                                sx={{ 
                                    // borderRadius: '25px', 
                                    overflow: 'hidden',
                                    borderTopLeftRadius: 25,
                                    borderTopRightRadius: 25,
                                    borderBottomLeftRadius: 3,
                                    borderBottomRightRadius: 3,
                                    marginBottom: '10px',
                                    marginTop: '50px',
                                    maxWidth: "90%",
                                    marginLeft: 'auto', // Adjust for centering
                                    marginRight: 'auto', // Adjust for centering
                                    display: 'block', // 
                                }}
                            >
                                <Table aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="left" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#BEAFC2"}}>
                                                Strategy state:
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#BEAFC2"}}>
                                                {milestoneStatusLabel(strategyState)}
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {
                                (projectRejectVotesFor || projectRejectVotesAgainst) ? (


                                    <TableContainer 
                                        component={Paper} 
                                        sx={{ 
                                            // borderRadius: '25px', 
                                            overflow: 'hidden',
                                            borderTopLeftRadius: 3,
                                            borderTopRightRadius: 3,
                                            borderBottomLeftRadius: 3,
                                            borderBottomRightRadius: 3,
                                            marginBottom: '10px',
                                            maxWidth: "90%",
                                            marginLeft: 'auto', // Adjust for centering
                                            marginRight: 'auto', // Adjust for centering
                                            display: 'block', // 
                                        }}
                                    >
                                        <Table aria-label="simple table">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell align="left" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#BEAFC2"}}>
                                                        Project revoking Votes
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                            <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "FaunaRegular", color: "#695E93"}}>

                                                <ProgressBarVotes 
                                                    completed={calculateVotesPercentage(totalSupply, projectRejectVotesFor)}
                                                    label={"For"}
                                                    color={"#C70039"}
                                                />
                                                <ProgressBarVotes 
                                                    completed={calculateVotesPercentage(totalSupply, projectRejectVotesAgainst)}
                                                    label={"Against"}
                                                    color={"#4caf50"}
                                                />
                                            </TableCell>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>





                                    // <div style={milestonesFlexContainerStyle}>
                                    //     <div style={progressBarVotesForContainerStyle}>
                                    //         <p style={infoStyle}>Project revoking Votes</p>
                                    //         <ProgressBarVotes 
                                    //             completed={calculateVotesPercentage(totalSupply, projectRejectVotesFor)}
                                    //             label={"For"}
                                    //             color={"#C70039"}
                                    //         />
                                    //         <ProgressBarVotes 
                                    //             completed={calculateVotesPercentage(totalSupply, projectRejectVotesAgainst)}
                                    //             label={"Against"}
                                    //             color={"#4caf50"}
                                    //         />
                                    //     </div>
                                    // </div>
                                )
                                : (
                                    <div style={infoStyle}>
                                        <p></p>
                                    </div>
                                )
                            }






                            <TableContainer 
                                component={Paper} 
                                sx={{ 
                                    // borderRadius: '25px', 
                                    overflow: 'hidden',
                                    borderTopLeftRadius: 3,
                                    borderTopRightRadius: 3,
                                    borderBottomLeftRadius: 25,
                                    borderBottomRightRadius: 25,
                                    marginBottom: '10px',
                                    maxWidth: "90%",
                                    marginLeft: 'auto', // Adjust for centering
                                    marginRight: 'auto', // Adjust for centering
                                    display: 'block', // 
                                }}
                            >
                                <Table aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="left" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#BEAFC2"}}>
                                                Milestones status: {calculatePhaseOneMilestones().info}
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                    <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "FaunaRegular", color: "#695E93"}}>
                                        <MilestonesProgressBar completed={calculatePhaseOneMilestones().progress}/>
                                    </TableCell>

                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {
                                (offeredMilestones.length && isDataLoaded) ? (
                                    
                                    <>

                                        <TableContainer 
                                            component={Paper} 
                                            sx={{ 
                                                // borderRadius: '25px', 
                                                overflow: 'hidden',
                                                borderTopLeftRadius: 25,
                                                borderTopRightRadius: 25,
                                                borderBottomLeftRadius: 3,
                                                borderBottomRightRadius: 3,
                                                marginBottom: '10px',
                                                marginTop: '50px',
                                                maxWidth: "90%",
                                                marginLeft: 'auto', // Adjust for centering
                                                marginRight: 'auto', // Adjust for centering
                                                display: 'block', // 
                                            }}
                                        >
                                            <Table aria-label="simple table">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#BEAFC2"}}>
                                                            Defined Milestones
                                                        </TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "FaunaRegular", color: "#695E93"}}>

                                                    {offeredMilestones.map((milestone, i) => (


                                                        <TableContainer 
                                                            component={Paper} 
                                                            sx={{ 
                                                                // borderRadius: '25px', 
                                                                overflow: 'hidden',
                                                                borderTopLeftRadius: 15,
                                                                borderTopRightRadius: 15,
                                                                borderBottomLeftRadius: 15,
                                                                borderBottomRightRadius: 15,
                                                                marginBottom: '10px',
                                                                maxWidth: "100%",
                                                                marginLeft: 'auto', // Adjust for centering
                                                                marginRight: 'auto', // Adjust for centering
                                                                display: 'block', // 
                                                            }}
                                                        >
                                                            <Table aria-label="simple table">
                                                                <TableHead>
                                                                    <TableRow>
                                                                        <TableCell align="left" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#BEAFC2"}}>
                                                                            Milestone {i + 1}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                </TableHead>
                                                                <TableBody>
                                                                    <TableRow>
                                                                        <TableCell align="left" sx={{ fontSize: '13px', fontFamily: "FaunaRegular", color: "#695E93"}}>
                                                                            Distributing: {(Number(milestone.amountPercentage) / totalSupply) * 100}%
                                                                        </TableCell>
                                                                    </TableRow>
                                                                    <TableRow>
                                                                        <TableCell align="left" sx={{ fontSize: '13px', fontFamily: "FaunaRegular", color: "#695E93"}}>
                                                                            Description: .
                                                                            <a
                                                                                href={milestone.description}
                                                                                target="_blank" // This ensures the link opens in a new tab
                                                                                rel="noopener noreferrer" // Security measure for links that open a new tab
                                                                                
                                                                                >
                                                                                {milestone.description}
                                                                            </a> 
                                                                        </TableCell>
                                                                    </TableRow>

                                                                </TableBody>
                                                            </Table>
                                                        </TableContainer>
                                                    ))}
                                                </TableCell>
                                                </TableBody>
                                            </Table>
                                        </TableContainer>

                                        {
                                            (offeredMilestonesVotes && isDataLoaded) ? (


                                                <TableContainer 
                                                    component={Paper} 
                                                    sx={{ 
                                                        // borderRadius: '25px', 
                                                        overflow: 'hidden',
                                                        borderTopLeftRadius: 3,
                                                        borderTopRightRadius: 3,
                                                        borderBottomLeftRadius: 25,
                                                        borderBottomRightRadius: 25,
                                                        marginBottom: '10px',
                                                        maxWidth: "90%",
                                                        marginLeft: 'auto', // Adjust for centering
                                                        marginRight: 'auto', // Adjust for centering
                                                        display: 'block', // 
                                                    }}
                                                >
                                                    <Table aria-label="simple table">
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell align="left" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#BEAFC2"}}>
                                                                    Milestones Defining Votes
                                                                </TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                        <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "FaunaRegular", color: "#695E93"}}>

                                                            
                                                            <ProgressBarVotes 
                                                                completed={calculateVotesPercentage(totalSupply, offeredMilestonesVotes.votesFor)}
                                                                label={"Votes For"}
                                                                color={"#4caf50"}
                                                            />
                                                            <ProgressBarVotes 
                                                                completed={calculateVotesPercentage(totalSupply, offeredMilestonesVotes.votesAgainst)}
                                                                label={"Votes Against"}
                                                                color={"#C70039"}
                                                            />

                                                        </TableCell>

                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            )
                                            : (
                                                <div style={infoStyle}>
                                                    <p></p>
                                                </div>
                                            )
                                        }
                                    </>
                                )
                                : (
                                    <div style={infoStyle}>
                                        <p></p>
                                    </div>
                                )
                            }

                            {
                                (milestonesWithStatus.length && isDataLoaded) ? (

                                    <>

                                    <TableContainer 
                                        component={Paper} 
                                        sx={{ 
                                            // borderRadius: '25px', 
                                            overflow: 'hidden',
                                            borderTopLeftRadius: 25,
                                            borderTopRightRadius: 25,
                                            borderBottomLeftRadius: 25,
                                            borderBottomRightRadius: 25,
                                            marginBottom: '10px',
                                            marginTop: '50px',
                                            maxWidth: "90%",
                                            marginLeft: 'auto', // Adjust for centering
                                            marginRight: 'auto', // Adjust for centering
                                            display: 'block', // 
                                        }}
                                    >
                                        <Table aria-label="simple table">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#BEAFC2"}}>
                                                        Submited Milestones
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                            <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "FaunaRegular", color: "#695E93"}}>

                                                {milestonesWithStatus.map((milestone, i) => (


                                                    <TableContainer 
                                                        component={Paper} 
                                                        sx={{ 
                                                            // borderRadius: '25px', 
                                                            overflow: 'hidden',
                                                            borderTopLeftRadius: 25,
                                                            borderTopRightRadius: 25,
                                                            borderBottomLeftRadius: 25,
                                                            borderBottomRightRadius: 25,
                                                            marginBottom: '10px',
                                                            maxWidth: "100%",
                                                            marginLeft: 'auto', // Adjust for centering
                                                            marginRight: 'auto', // Adjust for centering
                                                            display: 'block', // 
                                                        }}
                                                    >
                                                        <Table aria-label="simple table">
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell align="left" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#BEAFC2"}}>
                                                                        {milestoneNameColor(Number(milestone.milestoneStatus), `Milestone ${i + 1}`)} {milestoneStatusLabel(Number(milestone.milestoneStatus))}
                                                                    </TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                <TableRow>
                                                                    <TableCell align="left" sx={{ fontSize: '13px', fontFamily: "FaunaRegular", color: "#695E93"}}>
                                                                        Distributing: {(Number(milestone.amountPercentage) / totalSupply) * 100}%
                                                                    </TableCell>
                                                                </TableRow>
                                                                <TableRow>
                                                                    <TableCell align="left" sx={{ fontSize: '13px', fontFamily: "FaunaRegular", color: "#695E93"}}>
                                                                        Description: .
                                                                        <a
                                                                            href={milestone.description}
                                                                            target="_blank" // This ensures the link opens in a new tab
                                                                            rel="noopener noreferrer" // Security measure for links that open a new tab
                                                                            
                                                                            >
                                                                            {milestone.description}
                                                                        </a> 
                                                                    </TableCell>
                                                                </TableRow>
                                                                <TableRow>
                                                                    <TableCell align="left" sx={{ fontSize: '13px', fontFamily: "FaunaRegular", color: "#695E93"}}>
                                                                        Sumbmission: .
                                                                        <a
                                                                            href={milestone.metadata.pointer}
                                                                            target="_blank" // This ensures the link opens in a new tab
                                                                            rel="noopener noreferrer" // Security measure for links that open a new tab
                                                                            
                                                                            >
                                                                            {milestone.metadata.pointer}
                                                                        </a> 
                                                                    </TableCell>
                                                                </TableRow>

                                                                <TableRow>
                                                                    
                                                                    <TableContainer 
                                                                        component={Paper} 
                                                                        sx={{ 
                                                                            // borderRadius: '25px', 
                                                                            overflow: 'hidden',
                                                                            borderTopLeftRadius: 3,
                                                                            borderTopRightRadius: 3,
                                                                            borderBottomLeftRadius: 25,
                                                                            borderBottomRightRadius: 25,
                                                                            // marginBottom: '10px',
                                                                            marginTop: '10px',
                                                                            maxWidth: "100%",
                                                                            marginLeft: 'auto', // Adjust for centering
                                                                            marginRight: 'auto', // Adjust for centering
                                                                            display: 'block', // 
                                                                        }}
                                                                    >
                                                                        <Table aria-label="simple table">
                                                                            <TableHead>
                                                                                <TableRow>
                                                                                    <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#BEAFC2"}}>
                                                                                        Milestone submission Votes
                                                                                    </TableCell>
                                                                                </TableRow>
                                                                            </TableHead>
                                                                            <TableBody>
                                                                                <TableRow>

                                                                                    <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "FaunaRegular", color: "#695E93"}}>
                                                                                        <ProgressBarVotes 
                                                                                            completed={calculateVotesPercentage(totalSupply, milestone.votesFor)}
                                                                                            label={"Votes For"}
                                                                                            color={"#4caf50"}
                                                                                        />
                                                                                        <ProgressBarVotes 
                                                                                            completed={Number(milestone.milestoneStatus) != 3 ? calculateVotesPercentage(totalSupply, milestone.votesAgainst) : 100}
                                                                                            label={"Votes Against"}
                                                                                            color={"#C70039"}
                                                                                        />
                                                                                        
                                                                                    

                                                                                    </TableCell>
                                                                                </TableRow>
                                                                            </TableBody>
                                                                        </Table>
                                                                    </TableContainer>


                                                                </TableRow>

                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                ))}
                                            </TableCell>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>

                                    </>
                                )
                                : (
                                    <div style={infoStyle}>
                                        <p></p>
                                    </div>
                                )
                            }
                            {projectInfo && (

                                <>

                                    <TableContainer 
                                        component={Paper} 
                                        sx={{ 
                                            // borderRadius: '25px', 
                                            overflow: 'hidden',
                                            borderTopLeftRadius: 25,
                                            borderTopRightRadius: 25,
                                            borderBottomLeftRadius: 3,
                                            borderBottomRightRadius: 3,
                                            marginTop: '50px',
                                            marginBottom: '10px',
                                            maxWidth: "90%",
                                            marginLeft: 'auto', // Adjust for centering
                                            marginRight: 'auto', // Adjust for centering
                                            display: 'block', // 
                                            mb: 2,
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
                                            borderBottomLeftRadius: 3,
                                            borderBottomRightRadius: 3,
                                            marginBottom: '10px',
                                            maxWidth: "90%",
                                            marginLeft: 'auto', // Adjust for centering
                                            marginRight: 'auto', // Adjust for centering
                                            display: 'block', // 
                                        }}
                                    >
                                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell align="left" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#BEAFC2"}}>
                                                        Allo-V2 Registry Profile ID:
                                                    </TableCell>
                                                    <TableCell align="left" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#BEAFC2"}}>
                                                        Pool:
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "FaunaRegular", color: "#695E93"}}>
                                                        {profileId}
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "FaunaRegular", color: "#695E93"}}>
                                                        {poolID}
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>

                                    <TableContainer component={Paper} 
                                        sx={{ 
                                            borderRadius: '5px', 
                                            overflow: 'hidden', 
                                            mb: 2,
                                            maxWidth: "90%",
                                            marginLeft: 'auto', // Adjust for centering
                                            marginRight: 'auto', // Adjust for centering
                                            display: 'block', // 
                                        }}
                                    >
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
                                                    { projecExecutor == accounts[0] ? youLabel() : ""}{projecExecutor}
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
                                            borderBottomLeftRadius: 25,
                                            borderBottomRightRadius: 25,
                                            marginBottom: '50px',
                                            maxWidth: "90%",
                                            marginLeft: 'auto', // Adjust for centering
                                            marginRight: 'auto', // Adjust for centering
                                            display: 'block', // 
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
                                                        <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "FaunaRegular", color: "#695E93" }}>
                                                        {manager == accounts[0] ? youLabel() : ""} {manager}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </>
                            )}

                            {
                                <>
                                    {fundsSent ? (
                                                <>
                                                    <p style={thanksgivingSentStyle}>Thank you for your support of the project's suppliers. They will greatly appreciate receiving your positive feedback and acknowledgment of their contributions 🎉🎉🎉</p>
                                                </>
                                            )
                                        :
                                        (
                                            <>
                                                {/* <p style={thanksgivingStyle}>Everyone is invited to express their gratitude to the suppliers who have been instrumental in advancing this project. Any contributions made as a token of thanks will be equitably distributed among the suppliers in proportion to their respective contributions to the funding.</p>
                                                <div>
                                                    <input 
                                                        id="amount" 
                                                        style={inputStyle} 
                                                        value={amountToSend} 
                                                        onChange={(e) => setAmountToSend(e.target.value)} 
                                                    />
                                                    <button style={buttonContentStyle} onClick={handleSendFunds}>
                                                        Send Funds
                                                    </button>
                                                </div> */}

                                                    <TableContainer 
                                                        component={Paper} 
                                                        sx={{ 
                                                            borderTopLeftRadius: 25,
                                                            borderTopRightRadius: 25,
                                                            borderBottomLeftRadius: 25,
                                                            borderBottomRightRadius: 25, 
                                                            overflow: 'hidden', 
                                                            mb: 2,
                                                            maxWidth: "90%",
                                                            marginLeft: 'auto', // Adjust for centering
                                                            marginRight: 'auto', // Adjust for centering
                                                            display: 'block', // 
                                                        }}
                                                    >
                                                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#BEAFC2" }}>Send thank-you tokens to the investors</TableCell>
                                                                    <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "RaxtorRegular", color: "#BEAFC2"}}></TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                <TableRow>
                                                                    <TableCell align="center" sx={{ fontSize: '13px', fontFamily: "FaunaRegular" }}>
                                                                        {/* <CircularProgressWithLabel value={calculateProgress(projecData, web3)} /> */}

                                                                        <p style={thanksgivingStyle}>Everyone is invited to express their gratitude to the suppliers who have been instrumental in advancing this project. Any contributions made as a token of thanks will be equitably distributed among the suppliers in proportion to their respective contributions to the funding.</p>

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
                                                                                    sx={{ width: 30, height: 30, border: '1px solid green'}}
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
                                                                            disabled={!Number(amountToSend)}
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
                                            </>
                                        )
                                    }
                                </>
                            }
                        </div>

                        

                    </div>
                )}
            </div>
        </div>
    );
};

const infoStyle = {
    fontSize: '13px',
    color: "695E93",
    marginBottom: '10px',
    fontFamily: "RaxtorRegular",
    marginRight: '25px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap', // Allows items to wrap onto multiple lines
    gap: '20px' // Spacing between items
};

const progressBarVotesForContainerStyle = {
    width: '50%',  // Adjust as needed
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '20px 0' // Gives space around the progress bar
};

const contentStyle = {
    fontSize: '21px',
    marginTop: '50px',
    marginBottom: '20px',
    backgroundColor: '#FFFFFF',
    color: "#8155BA",
    // border: '1px solid black',
    borderRadius: "15px",
    width: "100%",
    paddingTop: '30px',
    paddingBottom: '10px',
    // alignItems: 'center', 
    // height: '500px', 
};

const h3Style = { 
    fontSize: '24px', 
    fontWeight: 'bold',
    fontFamily: "FaunaRegular",
};

const pStyle = { 
    fontSize: '16px',
    marginLeft: '30px', 
};

const buttonContainerStyle = {
    textAlign: 'left', // Aligns the button to the left
    paddingTop: '20px',
    // paddingBottom: '20px'
};

const milestonesFlexContainerStyle = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap', // Allows items to wrap onto multiple lines
    gap: '20px' // Spacing between items
};

const thanksgivingStyle = {
    fontSize: '13px',
    color: "695E93",
    marginBottom: '10px',
    fontFamily: "RaxtorRegular",
    marginRight: '30px',
    marginLeft: '30px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap', // Allows items to wrap onto multiple lines
    gap: '20px' // Spacing between items
};

const thanksgivingSentStyle = {
    fontSize: '17px',
    color: "695E93",
    marginBottom: '10px',
    fontFamily: "RaxtorRegular",
    marginRight: '30px',
    marginLeft: '60px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap', // Allows items to wrap onto multiple lines
    gap: '20px' // Spacing between items
};
